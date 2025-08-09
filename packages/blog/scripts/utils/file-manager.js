#!/usr/bin/env node

/**
 * ファイル管理ユーティリティ
 * 公式@qiita/qiita-cliのqiita/publicディレクトリ管理
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
 * qiitaディレクトリ構造を作成
 */
export function ensureQiitaStructure(qiitaDir) {
  const publicDir = join(qiitaDir, "public");
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
}

/**
 * 新規記事をqiita/publicディレクトリに配置
 * 公式qiita-cli仕様: 全ファイルは単一ディレクトリに配置
 */
export function placeArticleForQiita(
  title,
  content,
  qiitaId = null,
  qiitaDir = "./qiita",
) {
  ensureQiitaStructure(qiitaDir);
  const publicDir = join(qiitaDir, "public");

  // qiitaIdがある場合は既存記事なのでスキップ（qiita-cliが管理）
  if (qiitaId) {
    console.log(`Skipping existing article: ${title} (managed by qiita-cli)`);
    return null;
  }

  // 新規記事用のファイル名生成（タイムスタンプベース）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const fileName = `new-${timestamp}.md`;
  const filePath = join(publicDir, fileName);

  writeFileSync(filePath, content, "utf8");

  return {
    dirPath: publicDir,
    filePath,
    fileName,
  };
}

/**
 * 既存記事の更新用ファイルを作成（記事タイトルベース）
 */
export function updateExistingArticle(
  title,
  content,
  qiitaDir = "./qiita",
) {
  const publicDir = join(qiitaDir, "public");
  if (!existsSync(publicDir)) {
    console.error(`❌ Qiita public directory does not exist: ${publicDir}`);
    return null;
  }

  // 記事タイトルをファイル名として使用
  const fileName = `${title}.md`;
  const filePath = join(publicDir, fileName);
  writeFileSync(filePath, content, "utf8");

  console.log(`Updated existing article: ${filePath}`);

  return {
    dirPath: publicDir,
    filePath,
    fileName,
  };
}

/**
 * articlesディレクトリから記事一覧を取得
 */
export function getArticlesList(qiitaDir = "./qiita") {
  const publicDir = join(qiitaDir, "public");
  if (!existsSync(publicDir)) {
    return [];
  }

  const articles = [];
  const files = readdirSync(publicDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  for (const mdFile of mdFiles) {
    const filePath = join(publicDir, mdFile);
    const fileName = basename(mdFile, ".md");
    
    articles.push({
      title: fileName,
      fileName: mdFile,
      filePath: filePath,
      dirPath: publicDir,
      hasId: true, // public内の全ファイルはQiita IDを持つ
    });
  }

  return articles;
}

/**
 * Qiitaから最新記事を同期
 */
export async function syncFromQiita(qiitaDir = "./qiita") {
  try {
    console.log("Syncing articles from Qiita...");

    // npx qiita pull --root qiita を実行
    const result = execSync(`npx qiita pull --root ${basename(qiitaDir)}`, {
      stdio: "pipe",
      cwd: dirname(qiitaDir),
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
  qiitaDir = "./qiita",
) {
  try {
    console.log(`Publishing articles from: ${qiitaDir}`);

    // npx qiita publish --root qiita --all を実行
    execSync(`npx qiita publish --root ${basename(qiitaDir)} --all`, {
      stdio: "inherit",
      cwd: dirname(qiitaDir),
    });

    console.log(`✅ Successfully published all articles`);
    return [{ status: "success" }];
  } catch (error) {
    console.error(`❌ Failed to publish articles:`, error.message);
    return [{
      status: "failed",
      error: error.message,
    }];
  }
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
 * qiita/publicディレクトリのクリーンアップ
 */
export function cleanupQiitaDir(qiitaDir = "./qiita") {
  console.log(`✅ No cleanup needed for qiita/public directory`);
  return 0;
}

