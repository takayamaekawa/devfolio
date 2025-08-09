#!/usr/bin/env node

/**
 * ファイル管理ユーティリティ
 * qiita-cliのarticlesディレクトリ管理
 */

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "fs";
import { join, basename, dirname } from "path";
import { execSync } from "child_process";

/**
 * articlesディレクトリ構造を作成
 */
export function ensureArticlesStructure(articlesDir) {
  if (!existsSync(articlesDir)) {
    mkdirSync(articlesDir, { recursive: true });
  }
}

/**
 * 記事をarticlesディレクトリに配置
 * qiita-cli仕様: 既存記事はそのまま、新規記事のみdraft作成
 */
export function placeArticleForQiita(
  title,
  content,
  qiitaId = null,
  articlesDir = "./articles",
) {
  ensureArticlesStructure(articlesDir);

  // qiitaIdがある場合は既存記事なのでスキップ（qiita-cliが管理）
  if (qiitaId) {
    console.log(`Skipping existing article: ${title} (managed by qiita-cli)`);
    return null;
  }

  // 新規記事のみdraftとして作成
  const safeDirName = sanitizeDirName(title);
  const articleDir = join(articlesDir, safeDirName);

  if (!existsSync(articleDir)) {
    mkdirSync(articleDir, { recursive: true });
  }

  const fileName = "draft.md";
  const filePath = join(articleDir, fileName);

  writeFileSync(filePath, content, "utf8");

  return {
    dirPath: articleDir,
    filePath,
    fileName: safeDirName,
  };
}

/**
 * will_be_patched.md を既存のQiitaディレクトリに生成
 */
export function createWillBePatchedFile(
  title,
  content,
  articlesDir = "./articles",
) {
  if (!existsSync(articlesDir)) {
    console.error(`❌ Articles directory does not exist: ${articlesDir}`);
    return null;
  }

  // タイトルに一致する既存ディレクトリを検索
  const entries = readdirSync(articlesDir);
  let targetDir = null;

  for (const entry of entries) {
    const entryPath = join(articlesDir, entry);
    if (statSync(entryPath).isDirectory()) {
      // ディレクトリ名がタイトルと一致するかチェック
      if (entry === title || entry.includes(title.substring(0, 10))) {
        // UUIDファイルがあることを確認（Qiitaが管理するディレクトリ）
        const files = readdirSync(entryPath);
        const hasUuidFile = files.some(
          (file) =>
            file.match(/^[a-f0-9]{20}\.md$/) && file !== "will_be_patched.md",
        );

        if (hasUuidFile) {
          targetDir = entryPath;
          break;
        }
      }
    }
  }

  if (!targetDir) {
    console.error(`❌ No existing Qiita directory found for: ${title}`);
    return null;
  }

  const patchFilePath = join(targetDir, "will_be_patched.md");
  writeFileSync(patchFilePath, content, "utf8");

  console.log(`Created will_be_patched.md: ${patchFilePath}`);

  return {
    dirPath: targetDir,
    filePath: patchFilePath,
    fileName: basename(targetDir),
  };
}

/**
 * articlesディレクトリから記事一覧を取得
 */
export function getArticlesList(articlesDir = "./articles") {
  if (!existsSync(articlesDir)) {
    return [];
  }

  const articles = [];
  const dirEntries = readdirSync(articlesDir);

  for (const entry of dirEntries) {
    const entryPath = join(articlesDir, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      const files = readdirSync(entryPath);
      const mdFiles = files.filter((f) => f.endsWith(".md"));

      for (const mdFile of mdFiles) {
        articles.push({
          title: entry,
          fileName: mdFile,
          filePath: join(entryPath, mdFile),
          dirPath: entryPath,
          isWillBePatched: mdFile === "will_be_patched.md",
          hasId: mdFile !== "draft.md" && mdFile !== "will_be_patched.md",
        });
      }
    }
  }

  return articles;
}

/**
 * Qiitaから最新記事を同期
 */
export async function syncFromQiita(articlesDir = "./articles") {
  try {
    console.log("Syncing articles from Qiita...");

    // qiita pull:article を実行
    const result = execSync("npx qiita pull:article", {
      stdio: "pipe",
      cwd: dirname(articlesDir),
      encoding: "utf8",
    });

    console.log(result);
    console.log("✅ Sync from Qiita completed");
    return true;
  } catch (error) {
    // qiita-cliが出力を持っていても終了コードが0でない場合があるため、
    // stdoutやstderrから成功メッセージを検索
    const output = (error.stdout || "") + (error.stderr || "");
    if (
      output.includes("Article fetching completed") ||
      output.includes("fetching article")
    ) {
      console.log(output);
      console.log("✅ Sync from Qiita completed (with warnings)");
      return true;
    }

    console.error("❌ Failed to sync from Qiita:", error.message);
    console.error("stdout:", error.stdout);
    console.error("stderr:", error.stderr);
    return false;
  }
}

/**
 * Qiitaに記事を投稿（バッチ処理）
 */
export async function batchPublishToQiita(
  articles,
  articlesDir = "./articles",
) {
  const results = [];

  for (const article of articles) {
    try {
      console.log(`Publishing: ${article.fileName}`);

      if (article.isWillBePatched) {
        // patch処理
        execSync(`npx qiita patch:article`, {
          stdio: "inherit",
          cwd: dirname(articlesDir),
        });
      } else if (!article.hasId) {
        // 新規投稿
        execSync(`npx qiita post:article`, {
          stdio: "inherit",
          cwd: dirname(articlesDir),
        });
      }

      results.push({ article: article.title, status: "success" });
      console.log(`✅ Successfully published: ${article.title}`);
    } catch (error) {
      console.error(`❌ Failed to publish ${article.title}:`, error.message);
      results.push({
        article: article.title,
        status: "failed",
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * 記事タイトルを安全なディレクトリ名に変換
 */
function sanitizeDirName(title) {
  return title
    .replace(/[^\w\s-]/g, "") // 英数字、スペース、ハイフン以外を除去
    .replace(/\s+/g, "") // スペースを除去
    .replace(/-+/g, "-") // 連続するハイフンを1つに
    .trim()
    .substring(0, 50); // 長さ制限
}

/**
 * ディレクトリの存在確認とクリーンアップ
 */
export function cleanupArticlesDir(articlesDir = "./articles") {
  const articles = getArticlesList(articlesDir);
  let cleaned = 0;

  // will_be_patched.md ファイルをクリーンアップ
  for (const article of articles) {
    if (article.isWillBePatched) {
      try {
        unlinkSync(article.filePath);
        console.log(`Cleaned up: ${article.filePath}`);
        cleaned++;
      } catch (error) {
        console.warn(`Could not clean up: ${article.filePath}`);
      }
    }
  }

  console.log(`✅ Cleaned up ${cleaned} will_be_patched.md files`);
  return cleaned;
}

