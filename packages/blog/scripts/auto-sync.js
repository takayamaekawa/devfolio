#!/usr/bin/env node

/**
 * 自動同期とバッチ投稿スクリプト
 * qiita-cliの新仕様に対応したバッチ処理
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { 
  getArticlesList, 
  batchPublishToQiita, 
  cleanupArticlesDir 
} from './utils/file-manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const ARTICLES_DIR = join(ROOT_DIR, 'articles');

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'auto';
  
  try {
    switch (command) {
      case 'auto':
        await autoSyncAndPublish();
        break;
      case 'publish':
        await publishOnly();
        break;
      case 'cleanup':
        await cleanup();
        break;
      case 'batch':
        await batchPublish();
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
 * 自動同期＋投稿
 */
async function autoSyncAndPublish() {
  console.log('🤖 Starting automatic sync and publish...\n');
  
  // 1. 同期処理を実行
  console.log('🔄 Step 1: Running sync...');
  try {
    execSync('node scripts/qiita-sync.js sync', { 
      stdio: 'inherit',
      cwd: ROOT_DIR
    });
  } catch (error) {
    throw new Error('Sync process failed');
  }
  
  // 2. 投稿処理を実行
  console.log('\n📤 Step 2: Publishing to Qiita...');
  await publishOnly();
  
  // 3. クリーンアップ
  console.log('\n🧹 Step 3: Cleaning up...');
  await cleanup();
  
  console.log('\n✅ Automatic sync and publish completed!');
}

/**
 * 投稿のみ実行
 */
async function publishOnly() {
  const articles = getArticlesList(ARTICLES_DIR);
  
  // will_be_patched.md があるものを抽出
  const articlesToPublish = articles.filter(article => article.isWillBePatched);
  
  if (articlesToPublish.length === 0) {
    console.log('📄 No articles ready for publishing (no will_be_patched.md files found)');
    return;
  }
  
  console.log(`📝 Found ${articlesToPublish.length} articles ready for publishing:`);
  articlesToPublish.forEach(article => {
    console.log(`  📄 ${article.title}`);
  });
  
  // バッチ投稿実行
  const results = await batchPublishToQiita(articlesToPublish, ARTICLES_DIR);
  
  // 結果表示
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n📊 Publishing Results:`);
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n❌ Failed articles:`);
    results.filter(r => r.status === 'failed').forEach(result => {
      console.log(`  • ${result.article}: ${result.error}`);
    });
  }
}

/**
 * バッチ投稿（インタラクティブ選択なし）
 */
async function batchPublish() {
  console.log('📦 Starting batch publish...\n');
  
  const articles = getArticlesList(ARTICLES_DIR);
  const publishableArticles = articles.filter(article => 
    article.isWillBePatched || !article.hasId
  );
  
  if (publishableArticles.length === 0) {
    console.log('📄 No articles available for publishing');
    return;
  }
  
  console.log('🔍 Articles available for publishing:');
  publishableArticles.forEach((article, index) => {
    const type = article.isWillBePatched ? 'UPDATE' : 'NEW';
    console.log(`  ${index + 1}. [${type}] ${article.title}`);
  });
  
  // 確認プロンプト
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    rl.question('🤔 Publish all articles? (y/N): ', resolve);
  });
  rl.close();
  
  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Publishing cancelled');
    return;
  }
  
  // バッチ投稿実行
  const results = await batchPublishToQiita(publishableArticles, ARTICLES_DIR);
  
  // 結果表示
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n📊 Batch Publishing Results:`);
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
}

/**
 * クリーンアップ処理
 */
async function cleanup() {
  const cleaned = await cleanupArticlesDir(ARTICLES_DIR);
  console.log(`🧹 Cleanup completed: ${cleaned} files cleaned`);
}

/**
 * 記事の状態確認
 */
async function checkStatus() {
  const articles = getArticlesList(ARTICLES_DIR);
  
  const published = articles.filter(a => a.hasId && !a.isWillBePatched).length;
  const readyForUpdate = articles.filter(a => a.isWillBePatched).length;
  const drafts = articles.filter(a => !a.hasId && !a.isWillBePatched).length;
  
  console.log('📊 Articles Status:');
  console.log(`  📄 Published: ${published}`);
  console.log(`  🔄 Ready for update: ${readyForUpdate}`);
  console.log(`  📝 Drafts: ${drafts}`);
  console.log(`  📈 Total: ${articles.length}`);
  
  if (readyForUpdate > 0) {
    console.log('\n📝 Articles ready for update:');
    articles.filter(a => a.isWillBePatched).forEach(article => {
      console.log(`  • ${article.title}`);
    });
  }
}

/**
 * ヘルプ表示
 */
function showHelp() {
  console.log(`
🤖 Auto Sync & Publish Tool

Usage: node scripts/auto-sync.js [command]

Commands:
  auto      Full automatic sync and publish (default)
  publish   Publish articles with will_be_patched.md only
  batch     Interactive batch publish
  cleanup   Clean up will_be_patched.md files
  help      Show this help

Examples:
  npm run qiita:auto      # Full automatic process
  npm run qiita:publish   # Publish prepared articles only
  npm run qiita:batch     # Interactive batch publish
  npm run qiita:cleanup   # Clean up temp files
`);
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}