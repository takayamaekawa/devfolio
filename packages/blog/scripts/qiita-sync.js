#!/usr/bin/env node

/**
 * Qiita自動同期スクリプト
 * Hexo記事をqiita-cliの新仕様に対応して自動同期
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { 
  convertToIntegratedHeader, 
  convertToQiitaHeader, 
  syncQiitaToIntegratedHeader,
  isContentChanged 
} from './utils/header-converter.js';
import { 
  ensureArticlesStructure, 
  placeArticleForQiita, 
  createWillBePatchedFile,
  getArticlesList,
  syncFromQiita
} from './utils/file-manager.js';
import { each as applyMapping } from './mapping.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const SOURCE_POSTS_DIR = join(ROOT_DIR, 'source', '_posts');
const ARTICLES_DIR = join(ROOT_DIR, 'articles');

/**
 * メイン同期処理
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  try {
    switch (command) {
      case 'sync':
        await fullSync();
        break;
      case 'pull':
        await pullFromQiita();
        break;
      case 'push':
        await pushToQiita();
        break;
      case 'init':
        await initializeHeaders();
        break;
      case 'status':
        await showSyncStatus();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * フル同期：pull → convert → push
 */
async function fullSync() {
  console.log('🔄 Starting full synchronization...\n');
  
  // 1. Qiitaから最新を取得
  console.log('📥 Step 1: Pulling from Qiita...');
  await pullFromQiita();
  
  // 2. Hexo記事をQiita形式に変換
  console.log('\n🔄 Step 2: Converting Hexo articles...');
  await convertHexoArticles();
  
  // 3. 変更されたものをQiitaに送信
  console.log('\n📤 Step 3: Preparing articles for push...');
  await prepareChangedArticles();
  
  console.log('\n✅ Full synchronization completed!');
  console.log('📝 Run "npm run qiita:publish" to publish changes to Qiita');
}

/**
 * Qiitaから記事を取得
 */
async function pullFromQiita() {
  const success = await syncFromQiita(ARTICLES_DIR);
  if (!success) {
    throw new Error('Failed to pull articles from Qiita');
  }
  
  // Qiitaの記事をHexoに反映
  await syncQiitaToHexo();
}

/**
 * 新規記事のみをQiita形式に変換してarticlesディレクトリに配置
 * 既存記事（QiitaID付き）はqiita-cliが管理するため処理しない
 */
async function convertHexoArticles() {
  ensureArticlesStructure(ARTICLES_DIR);
  
  // Hexo記事を取得
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, '*.md'));
  let newArticlesCount = 0;
  let existingArticlesCount = 0;
  
  for (const hexoFile of hexoFiles) {
    try {
      console.log(`Processing: ${basename(hexoFile)}`);
      
      // 統合ヘッダー形式に変換（必要に応じて）
      const integratedContent = convertToIntegratedHeader(hexoFile);
      writeFileSync(hexoFile, integratedContent);
      
      const content = readFileSync(hexoFile, 'utf8');
      const { frontMatter } = parseFrontMatter(content);
      
      // 既存記事（QiitaID付き）は完全にスキップ
      if (frontMatter.qiita?.id) {
        console.log(`✅ Skipping existing article: ${frontMatter.title} (managed by qiita-cli)`);
        existingArticlesCount++;
      } else {
        // 新規記事のみ処理
        console.log(`🆕 Processing new article: ${frontMatter.title}`);
        
        const qiitaContent = convertToQiitaHeader(hexoFile);
        
        const result = placeArticleForQiita(
          frontMatter.title,
          qiitaContent,
          null, // 新規記事
          ARTICLES_DIR
        );
        
        if (result) {
          // mapping.jsを適用
          const mdBasename = basename(hexoFile, '.md');
          await applyMappingIfExists(result.dirPath, mdBasename);
          newArticlesCount++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${basename(hexoFile)}:`, error.message);
    }
  }
  
  console.log(`📊 Processing summary:`);
  console.log(`  🆕 New articles: ${newArticlesCount}`);
  console.log(`  ✅ Existing articles (skipped): ${existingArticlesCount}`);
}

/**
 * 変更された記事のwill_be_patched.mdを生成
 */
async function prepareChangedArticles() {
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, '*.md'));
  const changedArticles = [];
  
  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, 'utf8');
    const { frontMatter } = parseFrontMatter(content);
    
    // 既存記事で内容が変更された場合のみwill_be_patched.mdを生成
    if (frontMatter.qiita?.id && isContentChanged(hexoFile)) {
      const qiitaContent = convertToQiitaHeader(hexoFile);
      const result = createWillBePatchedFile(
        frontMatter.title,
        qiitaContent,
        ARTICLES_DIR
      );
      
      // mapping.jsを適用
      const mdBasename = basename(hexoFile, '.md');
      await applyMappingIfExists(result.dirPath, mdBasename);
      
      changedArticles.push({
        title: frontMatter.title,
        type: 'update',
        path: result.filePath
      });
    }
    // 新規記事（Qiita IDなし）はここでは処理しない
  }
  
  if (changedArticles.length === 0) {
    console.log('📄 No articles to update');
  } else {
    console.log(`📝 Prepared ${changedArticles.length} articles for publishing:`);
    changedArticles.forEach(article => {
      console.log(`  ${article.type === 'new' ? '🆕' : '🔄'} ${article.title}`);
    });
  }
}

/**
 * Qiitaの記事をHexoに同期
 */
async function syncQiitaToHexo() {
  const qiitaArticles = getArticlesList(ARTICLES_DIR);
  
  for (const article of qiitaArticles) {
    if (article.hasId) {
      try {
        // 対応するHexo記事を検索
        const hexoFile = await findHexoFileByTitle(article.title);
        if (hexoFile) {
          const qiitaContent = readFileSync(article.filePath, 'utf8');
          const syncedContent = syncQiitaToIntegratedHeader(hexoFile, qiitaContent);
          writeFileSync(hexoFile, syncedContent);
          
          console.log(`🔄 Synced from Qiita: ${article.title}`);
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
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, '*.md'));
  
  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, 'utf8');
    const { frontMatter } = parseFrontMatter(content);
    
    if (frontMatter.title === title || 
        frontMatter.title?.replace(/['"]/g, '') === title) {
      return hexoFile;
    }
  }
  
  return null;
}

/**
 * Hexo記事ヘッダーを統合形式に初期化
 */
async function initializeHeaders() {
  console.log('🔧 Initializing Hexo headers to integrated format...');
  
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, '*.md'));
  let updated = 0;
  
  for (const hexoFile of hexoFiles) {
    try {
      const originalContent = readFileSync(hexoFile, 'utf8');
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
      console.error(`❌ Failed to update ${basename(hexoFile)}:`, error.message);
    }
  }
  
  console.log(`✅ Updated ${updated} files to integrated format`);
}

/**
 * 同期状況を表示
 */
async function showSyncStatus() {
  console.log('📊 Synchronization Status\n');
  
  const hexoFiles = await glob(join(SOURCE_POSTS_DIR, '*.md'));
  const qiitaArticles = getArticlesList(ARTICLES_DIR);
  
  console.log(`📝 Hexo articles: ${hexoFiles.length}`);
  console.log(`📄 Qiita articles: ${qiitaArticles.length}`);
  
  let synced = 0;
  let needsUpdate = 0;
  let newArticles = 0;
  
  for (const hexoFile of hexoFiles) {
    const content = readFileSync(hexoFile, 'utf8');
    const { frontMatter } = parseFrontMatter(content);
    
    if (frontMatter.qiita?.id) {
      if (isContentChanged(hexoFile)) {
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
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // qiitaメタデータの詳細解析
  let qiitaMeta = null;
  if (yamlContent.includes('qiita:')) {
    // qiita.idを抽出
    const idMatch = yamlContent.match(/^\s*id:\s*(.+)$/m);
    const qiitaId = idMatch ? idMatch[1].trim() : null;
    
    if (qiitaId && qiitaId !== 'null') {
      qiitaMeta = { id: qiitaId };
    }
  }
  
  return {
    frontMatter: { 
      title,
      qiita: qiitaMeta
    },
    body
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