#!/usr/bin/env node

/**
 * Hexo ⇔ Qiita ヘッダー変換ユーティリティ
 * 既存のHexoヘッダーを統合形式に拡張し、Qiita形式に変換
 */

import { readFileSync, writeFileSync } from "fs";
import crypto from "crypto";
import yaml from "js-yaml";
import { removeTagsQuotes } from "./format.js";
import { formatToISOStringWithOffset } from "../format-time.js";

/**
 * Hexoの記事から統合ヘッダー形式に変換
 */
export function convertToIntegratedHeader(filePath) {
  const content = readFileSync(filePath, "utf8");
  const { frontMatter, body } = parseFrontMatter(content);

  // 既にqiitaメタデータがある場合はスキップ
  if (frontMatter.qiita) {
    return content;
  }

  // 統合ヘッダーに拡張
  const integratedFrontMatter = {
    ...frontMatter,
    qiita: {
      id: null,
      status: "draft",
      last_sync_hash: null,
      last_sync_at: null,
      private: false,
      slide: false,
      ignore_publish: false,
    },
  };

  return buildMarkdownContent(integratedFrontMatter, body);
}

/**
 * 統合ヘッダー → Qiitaヘッダー変換
 */
export function convertToQiitaHeader(filePath, qiitaArticleData = null) {
  const content = readFileSync(filePath, "utf8");
  const { frontMatter, body } = parseFrontMatter(content);

  // Qiitaヘッダー形式に変換（必須フィールドを全て含める）
  let qiitaTags = [];

  console.log("DEBUG - Converting tags for:", frontMatter.title);
  console.log(
    "DEBUG - frontMatter.tags:",
    JSON.stringify(frontMatter.tags, null, 2),
  );
  console.log(
    "DEBUG - frontMatter.qiita?.tags:",
    JSON.stringify(frontMatter.qiita?.tags, null, 2),
  );

  // Hexoのtagsが配列で存在する場合
  if (Array.isArray(frontMatter.tags) && frontMatter.tags.length > 0) {
    qiitaTags = frontMatter.tags; // 文字列配列としてそのまま使用
    console.log(
      "DEBUG - Using Hexo tags, converted to:",
      JSON.stringify(qiitaTags, null, 2),
    );
  }
  // それ以外の場合はqiita.tagsから取得を試行
  else if (frontMatter.qiita?.tags) {
    qiitaTags = convertTagsToQiitaFormat(frontMatter.qiita.tags);
    console.log(
      "DEBUG - Using qiita tags, converted to:",
      JSON.stringify(qiitaTags, null, 2),
    );
  } else {
    console.log("DEBUG - No tags found, using empty array");
  }

  const qiitaFrontMatter = {
    title: frontMatter.title?.replace(/['"]/g, ""), // クォートを除去
    tags: qiitaTags, // 文字列配列形式
    private: frontMatter.qiita?.private || false,
    updated_at: formatToISOStringWithOffset(), // 日本時間形式
    id: frontMatter.qiita?.id || null,
    organization_url_name: null,
    slide: frontMatter.qiita?.slide || false,
    ignorePublish: frontMatter.qiita?.ignore_publish || false,
  };

  // Qiitaから取得したメタデータがあれば上書き（不要なフィールドは除外）
  if (qiitaArticleData) {
    qiitaFrontMatter.id = qiitaArticleData.id;
    // updated_atは常に日本時間の現在時刻を使用（変更された記事として扱う）
    qiitaFrontMatter.updated_at = formatToISOStringWithOffset();
    qiitaFrontMatter.organization_url_name =
      qiitaArticleData.organization_url_name || null;
  } else {
    // 既存記事の場合も不要フィールドは除外
    if (frontMatter.qiita?.id) {
      qiitaFrontMatter.id = frontMatter.qiita.id;
    }
  }

  return buildMarkdownContent(qiitaFrontMatter, body);
}

/**
 * Qiitaヘッダー → 統合ヘッダー逆変換（同期時）
 */
export function syncQiitaToIntegratedHeader(hexoFilePath, qiitaContent) {
  const hexoContent = readFileSync(hexoFilePath, "utf8");
  const { frontMatter: hexoFM, body: hexoBody } = parseFrontMatter(hexoContent);
  const { frontMatter: qiitaFM, body: qiitaBody } =
    parseFrontMatter(qiitaContent);

  // Hexoヘッダーを維持しつつ、Qiitaメタデータを更新
  const syncedFrontMatter = {
    ...hexoFM,
    // Hexoにtagsがない、または空の場合はQiitaのtagsを同期
    tags:
      hexoFM.tags && Array.isArray(hexoFM.tags) && hexoFM.tags.length > 0
        ? hexoFM.tags
        : convertQiitaTagsToHexoFormat(qiitaFM.tags),
    qiita: {
      ...hexoFM.qiita,
      id: qiitaFM.id,
      status: qiitaFM.id ? "published" : "draft",
      last_sync_hash: generateContentHash(qiitaBody),
      last_sync_at: new Date().toISOString(),
      private: qiitaFM.private,
      slide: qiitaFM.slide,
      ignore_publish: qiitaFM.ignorePublish,
      url: qiitaFM.url,
      likes_count: qiitaFM.likes_count,
      created_at: qiitaFM.created_at,
      updated_at: qiitaFM.updated_at,
      tags: qiitaFM.tags, // Qiita形式のtagsも保持
    },
  };

  return buildMarkdownContent(syncedFrontMatter, hexoBody);
}

/**
 * タグをQiita形式に変換（文字列配列形式）
 */
function convertTagsToQiitaFormat(tags) {
  if (!tags) return [];

  // 空オブジェクトの場合も空配列を返す
  if (
    typeof tags === "object" &&
    !Array.isArray(tags) &&
    Object.keys(tags).length === 0
  ) {
    return [];
  }

  // 既にオブジェクト形式の場合は文字列配列に変換
  if (
    Array.isArray(tags) &&
    tags.length > 0 &&
    typeof tags[0] === "object" &&
    tags[0].name
  ) {
    return tags.map((tag) => tag.name);
  }

  // 既に文字列配列の場合はそのまま返す
  if (Array.isArray(tags) && tags.every((tag) => typeof tag === "string")) {
    return tags;
  }

  // 文字列の場合
  if (typeof tags === "string") {
    return [tags];
  }

  return [];
}

/**
 * QiitaのtagsをHexo形式に変換
 */
function convertQiitaTagsToHexoFormat(qiitaTags) {
  if (!qiitaTags || !Array.isArray(qiitaTags)) return [];

  // Qiita: [{"name": "tag1", "versions": []}, ...] → Hexo: ['tag1', 'tag2']
  return qiitaTags.map((tag) => tag.name || tag);
}

/**
 * Front Matterをパース
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontMatter: {}, body: content };
  }

  const [, yamlContent, body] = match;
  const frontMatter = yaml.load(yamlContent);

  return { frontMatter, body };
}

/**
 * Markdownコンテンツを組み立て
 */
function buildMarkdownContent(frontMatter, body) {
  const yamlContent = yaml.dump(frontMatter, {
    // 配列要素に適切なインデントを付ける
    noArrayIndent: false,
    indent: 2,
  });
  const completeYamlContent = removeTagsQuotes(yamlContent);
  return `---
${completeYamlContent}---
${body}`;
}

/**
 * コンテンツハッシュを生成
 */
function generateContentHash(content) {
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

/**
 * ファイルが更新されているかチェック
 */
export function isContentChanged(filePath) {
  const content = readFileSync(filePath, "utf8");
  const { frontMatter, body } = parseFrontMatter(content);

  if (!frontMatter.qiita?.last_sync_hash) {
    return true; // 初回同期
  }

  const currentHash = generateContentHash(body);
  return currentHash !== frontMatter.qiita.last_sync_hash;
}
