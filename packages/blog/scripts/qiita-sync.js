#!/usr/bin/env node

/**
 * Qiita自動同期スクリプト
 * Hexo記事をqiita-cliの新仕様に対応して自動同期
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { glob } from "glob";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import { each as applyMapping } from "./mapping.js";
import {
  ensureQiitaStructure,
  getArticlesList,
  placeArticleForQiita,
  syncFromQiita,
  updateExistingArticle,
} from "./utils/file-manager.js";
import {
  convertToIntegratedHeader,
  convertToQiitaHeader,
  isContentChanged,
  syncQiitaToIntegratedHeader,
} from "./utils/header-converter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const SOURCE_POSTS_DIR = join(ROOT_DIR, "source", "_posts");
const QIITA_DIR = join(ROOT_DIR, "qiita");

/**
 * メイン同期処理
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "sync";

  try {
    switch (command) {
      case "sync":
        await fullSync();
        break;
      case "pull":
        await pullFromQiita();
        break;
      case "push":
        await pushToQiita();
        break;
      case "init":
        await initializeHeaders();
        break;
      case "status":
        await showSyncStatus();
        break;
      case "migrate":
        await migrateToSyncState();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

/**
 * フル同期：pull → convert → push
 */
async function fullSync() {
  console.log("🔄 Starting full synchronization...\n");

  // 1. Qiitaから最新を取得
  console.log("📥 Step 1: Pulling from Qiita...");
  await pullFromQiita();

  // 2. Hexo記事をQiita形式に変換
  console.log("\n🔄 Step 2: Converting Hexo articles...");
  await convertHexoArticles();

  // 3. 変更されたものをQiitaに送信
  console.log("\n📤 Step 3: Preparing articles for push...");
  await prepareChangedArticles();

  console.log("\n✅ Full synchronization completed!");
  console.log('📝 Run "npm run qiita:publish" to publish all changes to Qiita');
}

/**
 * Qiitaから記事を取得
 */
async function pullFromQiita() {
  const success = await syncFromQiita(QIITA_DIR);
  if (!success) {
    throw new Error("Failed to pull articles from Qiita");
  }

  // Qiitaの記事をHexoに反映
  await syncQiitaToHexo();
}

/**
 * 新規記事のみをQiita形式に変換してarticlesディレクトリに配置
 * 既存記事（QiitaID付き）はqiita-cliが管理するため処理しない
 * ignore_publish: true の記事はQiitaに投稿しないためスキップ
 */
async function convertHexoArticles() {
  ensureQiitaStructure(QIITA_DIR);

  // Hexo記事を取得
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));
  let newArticlesCount = 0;
  let existingArticlesCount = 0;
  let ignoredArticlesCount = 0;

  for (const hexoFile of hexoFiles) {
    try {
      console.log(`Processing: ${basename(hexoFile)}`);

      // 統合ヘッダー形式に変換（必要に応じて）
      const integratedContent = convertToIntegratedHeader(hexoFile);
      writeFileSync(hexoFile, integratedContent);

      const content = readFileSync(hexoFile, "utf8");
      const { frontMatter } = parseFrontMatter(content);

      // ignore_publish: true の記事はQiitaに投稿しないためスキップ
      if (frontMatter.qiita?.ignore_publish) {
        console.log(
          `⏭️ Skipping Hexo-only article: ${frontMatter.title} (ignore_publish)`,
        );
        ignoredArticlesCount++;
        continue;
      }

      // 既存記事（QiitaID付き）は完全にスキップ
      if (frontMatter.qiita?.id) {
        console.log(
          `✅ Skipping existing article: ${frontMatter.title} (managed by qiita-cli)`,
        );
        existingArticlesCount++;
      } else {
        // 新規記事のみ処理
        console.log(`🆕 Processing new article: ${frontMatter.title}`);

        const qiitaContent = convertToQiitaHeader(hexoFile);

        const result = placeArticleForQiita(
          frontMatter.title,
          qiitaContent,
          null, // 新規記事
          QIITA_DIR,
        );

        if (result) {
          // mapping.jsを適用
          const mdBasename = basename(hexoFile, ".md");
          await applyMappingIfExists(result.dirPath, mdBasename);
          newArticlesCount++;
        }
      }
    } catch (error) {
      console.error(
        `❌ Failed to process ${basename(hexoFile)}:`,
        error.message,
      );
    }
  }

  console.log(`📊 Processing summary:`);
  console.log(`  🆕 New articles: ${newArticlesCount}`);
  console.log(`  ✅ Existing articles (skipped): ${existingArticlesCount}`);
  console.log(`  ⏭️ Hexo-only articles (skipped): ${ignoredArticlesCount}`);
}

/**
 * 変更された記事をqiita/publicに反映
 */
async function prepareChangedArticles() {
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));
  const changedArticles = [];

  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, "utf8");
    const { frontMatter } = parseFrontMatter(content);

    // ignore_publish: true の記事はスキップ
    if (frontMatter.qiita?.ignore_publish) {
      continue;
    }

    // 既存記事で内容が変更された場合のみqiita/publicに反映
    if (frontMatter.qiita?.id && isContentChanged(hexoFile, QIITA_DIR)) {
      const qiitaContent = convertToQiitaHeader(hexoFile);
      const result = updateExistingArticle(
        frontMatter.title,
        qiitaContent,
        QIITA_DIR,
      );

      if (result) {
        // mapping.jsを適用
        const mdBasename = basename(hexoFile, ".md");
        await applyMappingIfExists(result.dirPath, mdBasename);

        changedArticles.push({
          title: frontMatter.title,
          type: "update",
          path: result.filePath,
        });
      }
    }
  }

  if (changedArticles.length === 0) {
    console.log("📄 No articles to update");
  } else {
    console.log(
      `📝 Prepared ${changedArticles.length} articles for publishing:`,
    );
    changedArticles.forEach((article) => {
      console.log(`  ${article.type === "new" ? "🆕" : "🔄"} ${article.title}`);
    });
  }
}

/**
 * Qiitaの記事をHexoに同期
 *
 * .md への書き込みは qiita.id が null → 実ID に変化したときのみ。
 * それ以外の sync metadata は sync-state.json に保存する。
 */
async function syncQiitaToHexo() {
  const qiitaArticles = getArticlesList(QIITA_DIR);

  for (const article of qiitaArticles) {
    if (article.hasId) {
      try {
        const qiitaContent = readFileSync(article.filePath, "utf8");

        // ファイル名ではなくfrontmatterのtitleで検索
        // （new-TIMESTAMP形式のファイルに対応するため）
        const { frontMatter: qiitaFM } = parseFrontMatter(qiitaContent);
        const titleToSearch = qiitaFM.title || article.title;

        const hexoFile = await findHexoFileByTitle(titleToSearch);
        if (hexoFile) {
          const syncedContent = syncQiitaToIntegratedHeader(
            hexoFile,
            qiitaContent,
            QIITA_DIR,
          );

          if (syncedContent !== null) {
            // qiita.id が変化した（初回公開後の書き戻し）
            writeFileSync(hexoFile, syncedContent);
            console.log(`🆕 Written back qiita.id: ${titleToSearch}`);
          } else {
            // sync-state.json のみ更新済み（.md は触らない）
            console.log(`🔄 Synced state from Qiita: ${titleToSearch}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not sync: ${article.title} - ${error.message}`);
      }
    }
  }
}

/**
 * 記事タイトルでHexoファイルを検索
 */
async function findHexoFileByTitle(title) {
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));

  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, "utf8");
    const { frontMatter } = parseFrontMatter(content);

    if (
      frontMatter.title === title ||
      frontMatter.title?.replace(/['"]/g, "") === title
    ) {
      return hexoFile;
    }
  }

  return null;
}

/**
 * Hexo記事ヘッダーを統合形式に初期化
 */
async function initializeHeaders() {
  console.log("🔧 Initializing Hexo headers to integrated format...");

  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));
  let updated = 0;

  for (const hexoFile of hexoFiles) {
    try {
      const originalContent = readFileSync(hexoFile, "utf8");
      const { frontMatter } = parseFrontMatter(originalContent);

      // 既に統合形式の場合はスキップ
      if (frontMatter.qiita) {
        continue;
      }

      const integratedContent = convertToIntegratedHeader(hexoFile);
      writeFileSync(hexoFile, integratedContent);

      console.log(`✅ Updated: ${basename(hexoFile)}`);
      updated++;
    } catch (error) {
      console.error(
        `❌ Failed to update ${basename(hexoFile)}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Updated ${updated} files to integrated format`);
}

/**
 * 同期状況を表示
 */
async function showSyncStatus() {
  console.log("📊 Synchronization Status\n");

  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));
  const qiitaArticles = getArticlesList(QIITA_DIR);

  console.log(`📝 Hexo articles: ${hexoFiles.length}`);
  console.log(`📄 Qiita articles: ${qiitaArticles.length}`);

  let synced = 0;
  let needsUpdate = 0;
  let newArticles = 0;
  let ignored = 0;

  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, "utf8");
    const { frontMatter } = parseFrontMatter(content);

    if (frontMatter.qiita?.ignore_publish) {
      ignored++;
    } else if (frontMatter.qiita?.id) {
      if (isContentChanged(hexoFile, QIITA_DIR)) {
        needsUpdate++;
      } else {
        synced++;
      }
    } else {
      newArticles++;
    }
  }

  console.log(`\n📊 Status:`);
  console.log(`  ✅ Synced: ${synced}`);
  console.log(`  🔄 Needs update: ${needsUpdate}`);
  console.log(`  🆕 New articles: ${newArticles}`);
  console.log(`  ⏭️ Hexo-only (ignore_publish): ${ignored}`);
}

/**
 * 既存.mdのsync metadata を sync-state.json に移行し、frontmatter をクリーンアップ
 * 移行対象: last_sync_hash / last_sync_at / updated_at（qiita配下）/ tags（qiita配下）
 * 移行後: これらフィールドを frontmatter から除去し、updated: を qiita_updated_at から設定
 */
async function migrateToSyncState() {
  console.log("🔧 Migrating sync metadata to sync-state.json...\n");

  // 動的importで yaml と sync-state を取得
  const { default: yaml } = await import("js-yaml");
  const { updateArticleState, getArticleState } = await import(
    "./utils/sync-state.js"
  );
  const { removeTagsQuotes } = await import("./utils/format.js");

  function toHexoDate(isoStr) {
    const d = new Date(isoStr);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, "*.md"));
  let migrated = 0;
  let skipped = 0;

  for (const hexoFile of hexoFiles) {
    try {
      const content = readFileSync(hexoFile, "utf8");
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) {
        skipped++;
        continue;
      }

      const [, yamlContent, body] = match;
      const fm = yaml.load(yamlContent);

      if (!fm?.qiita) {
        skipped++;
        continue;
      }

      const hasLegacyFields =
        fm.qiita.last_sync_hash ||
        fm.qiita.last_sync_at ||
        fm.qiita.updated_at ||
        fm.qiita.tags ||
        fm.qiita.url ||
        fm.qiita.likes_count ||
        fm.qiita.created_at;

      // sync-state.json に移行（レガシーフィールドがある場合）
      if (hasLegacyFields) {
        const updates = {};
        if (fm.qiita.last_sync_hash)
          updates.last_sync_hash = fm.qiita.last_sync_hash;
        if (fm.qiita.last_sync_at) updates.last_sync_at = fm.qiita.last_sync_at;
        if (fm.qiita.updated_at) updates.qiita_updated_at = fm.qiita.updated_at;
        if (fm.qiita.tags) updates.qiita_tags = fm.qiita.tags;
        if (fm.qiita.url) updates.qiita_url = fm.qiita.url;
        if (fm.qiita.likes_count != null)
          updates.qiita_likes_count = fm.qiita.likes_count;
        if (fm.qiita.created_at) updates.qiita_created_at = fm.qiita.created_at;
        updateArticleState(QIITA_DIR, hexoFile, updates);

        // frontmatter からレガシーフィールドを除去
        delete fm.qiita.last_sync_hash;
        delete fm.qiita.last_sync_at;
        delete fm.qiita.updated_at;
        delete fm.qiita.tags;
        delete fm.qiita.url;
        delete fm.qiita.likes_count;
        delete fm.qiita.created_at;
      }

      // updated: が未設定の場合、sync-state.json の qiita_updated_at から設定
      if (!fm.updated) {
        const articleState = getArticleState(QIITA_DIR, hexoFile);
        const qiitaUpdatedAt = articleState.qiita_updated_at;
        if (qiitaUpdatedAt) {
          fm.updated = toHexoDate(qiitaUpdatedAt);
        }
      }

      if (!hasLegacyFields && fm.updated) {
        skipped++;
        continue;
      }

      const newYaml = removeTagsQuotes(
        yaml.dump(fm, { noArrayIndent: false, indent: 2 }),
      );
      writeFileSync(hexoFile, `---\n${newYaml}---\n${body}`);

      console.log(`✅ Migrated: ${basename(hexoFile)}`);
      migrated++;
    } catch (error) {
      console.error(`❌ Failed: ${basename(hexoFile)}: ${error.message}`);
    }
  }

  console.log(
    `\n📊 Migration complete: ${migrated} migrated, ${skipped} skipped`,
  );
}

/**
 * mapping.jsを適用（設定がある場合）
 */
async function applyMappingIfExists(targetDir, filename) {
  try {
    applyMapping(targetDir, `${filename}.md`);
  } catch (error) {
    console.warn(`⚠️ Mapping not applied for ${filename}: ${error.message}`);
  }
}

/**
 * Front Matterをパース（詳細版）
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontMatter: {}, body: content };
  }

  const [, yamlContent, body] = match;

  // タイトル抽出
  const titleMatch = yamlContent.match(/^title:\s*['"]?([^'"\n]+)['"]?/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // qiitaメタデータの詳細解析
  let qiitaMeta = null;
  if (yamlContent.includes("qiita:")) {
    // qiita.idを抽出
    const idMatch = yamlContent.match(/^\s*id:\s*(.+)$/m);
    const qiitaId = idMatch ? idMatch[1].trim() : null;

    // ignore_publishを抽出
    const ignoreMatch = yamlContent.match(/^\s*ignore_publish:\s*(.+)$/m);
    const ignorePub = ignoreMatch ? ignoreMatch[1].trim() === "true" : false;

    qiitaMeta = {
      id: qiitaId && qiitaId !== "null" ? qiitaId : null,
      ignore_publish: ignorePub,
    };
  }

  return {
    frontMatter: {
      title,
      qiita: qiitaMeta,
    },
    body,
  };
}

/**
 * ヘルプ表示
 */
function showHelp() {
  console.log(`
🔄 Qiita Sync Tool

Usage: node scripts/qiita-sync.js [command]

Commands:
  sync     Full synchronization (pull → convert → prepare for push)
  pull     Pull articles from Qiita
  push     Push changed articles to Qiita (prepare will_be_patched.md)
  init     Initialize Hexo headers to integrated format
  status   Show synchronization status
  help     Show this help

Examples:
  npm run qiita:sync
  npm run qiita:pull
  npm run qiita:status
`);
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
