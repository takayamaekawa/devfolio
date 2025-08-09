#!/usr/bin/env node

/**
 * Hexo ⇔ Qiita ヘッダー変換ユーティリティ
 * 既存のHexoヘッダーを統合形式に拡張し、Qiita形式に変換
 */

import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';

/**
 * Hexoの記事から統合ヘッダー形式に変換
 */
export function convertToIntegratedHeader(filePath) {
  const content = readFileSync(filePath, 'utf8');
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
      status: 'draft',
      last_sync_hash: null,
      last_sync_at: null,
      private: false,
      slide: false,
      ignore_publish: false
    }
  };

  return buildMarkdownContent(integratedFrontMatter, body);
}

/**
 * 統合ヘッダー → Qiitaヘッダー変換
 */
export function convertToQiitaHeader(filePath, qiitaArticleData = null) {
  const content = readFileSync(filePath, 'utf8');
  const { frontMatter, body } = parseFrontMatter(content);
  
  // Qiitaヘッダー形式に変換（必須フィールドを全て含める）
  let qiitaTags = [];
  
  console.log('DEBUG - Converting tags for:', frontMatter.title);
  console.log('DEBUG - frontMatter.tags:', JSON.stringify(frontMatter.tags, null, 2));
  console.log('DEBUG - frontMatter.qiita?.tags:', JSON.stringify(frontMatter.qiita?.tags, null, 2));
  
  // Hexoのtagsが配列で存在する場合
  if (Array.isArray(frontMatter.tags) && frontMatter.tags.length > 0) {
    qiitaTags = frontMatter.tags.map(tag => ({ name: tag, versions: [] }));
    console.log('DEBUG - Using Hexo tags, converted to:', JSON.stringify(qiitaTags, null, 2));
  }
  // それ以外の場合はqiita.tagsから取得を試行
  else if (frontMatter.qiita?.tags) {
    qiitaTags = convertTagsToQiitaFormat(frontMatter.qiita.tags);
    console.log('DEBUG - Using qiita tags, converted to:', JSON.stringify(qiitaTags, null, 2));
  }
  else {
    console.log('DEBUG - No tags found, using empty array');
  }
  
  const qiitaFrontMatter = {
    title: frontMatter.title?.replace(/['"]/g, ''), // クォートを除去
    tags: qiitaTags,
    private: frontMatter.qiita?.private || false,
    slide: frontMatter.qiita?.slide || false,
    ignorePublish: frontMatter.qiita?.ignore_publish || false,
    id: frontMatter.qiita?.id || null,
    updated_at: frontMatter.date || new Date().toISOString(),
    organization_url_name: null
  };

  // Qiitaから取得したメタデータがあれば上書き
  if (qiitaArticleData) {
    qiitaFrontMatter.id = qiitaArticleData.id;
    qiitaFrontMatter.created_at = qiitaArticleData.created_at;
    qiitaFrontMatter.updated_at = qiitaArticleData.updated_at;
    qiitaFrontMatter.url = qiitaArticleData.url;
    qiitaFrontMatter.likes_count = qiitaArticleData.likes_count;
    qiitaFrontMatter.organization_url_name = qiitaArticleData.organization_url_name || null;
  } else {
    // 既存記事の場合、統合ヘッダーから必須フィールドを取得
    if (frontMatter.qiita?.id) {
      qiitaFrontMatter.created_at = frontMatter.qiita.created_at;
      qiitaFrontMatter.url = frontMatter.qiita.url;
      qiitaFrontMatter.likes_count = frontMatter.qiita.likes_count || 0;
    }
  }

  return buildMarkdownContent(qiitaFrontMatter, body);
}

/**
 * Qiitaヘッダー → 統合ヘッダー逆変換（同期時）
 */
export function syncQiitaToIntegratedHeader(hexoFilePath, qiitaContent) {
  const hexoContent = readFileSync(hexoFilePath, 'utf8');
  const { frontMatter: hexoFM, body: hexoBody } = parseFrontMatter(hexoContent);
  const { frontMatter: qiitaFM, body: qiitaBody } = parseFrontMatter(qiitaContent);
  
  // Hexoヘッダーを維持しつつ、Qiitaメタデータを更新
  const syncedFrontMatter = {
    ...hexoFM,
    // Hexoにtagsがない、または空の場合はQiitaのtagsを同期
    tags: (hexoFM.tags && Array.isArray(hexoFM.tags) && hexoFM.tags.length > 0) 
          ? hexoFM.tags 
          : convertQiitaTagsToHexoFormat(qiitaFM.tags),
    qiita: {
      ...hexoFM.qiita,
      id: qiitaFM.id,
      status: qiitaFM.id ? 'published' : 'draft',
      last_sync_hash: generateContentHash(qiitaBody),
      last_sync_at: new Date().toISOString(),
      private: qiitaFM.private,
      slide: qiitaFM.slide,
      ignore_publish: qiitaFM.ignorePublish,
      url: qiitaFM.url,
      likes_count: qiitaFM.likes_count,
      created_at: qiitaFM.created_at,
      updated_at: qiitaFM.updated_at,
      tags: qiitaFM.tags // Qiita形式のtagsも保持
    }
  };

  return buildMarkdownContent(syncedFrontMatter, hexoBody);
}

/**
 * タグをQiita形式に変換
 */
function convertTagsToQiitaFormat(tags) {
  if (!tags) return [];
  
  // 空オブジェクトの場合も空配列を返す
  if (typeof tags === 'object' && !Array.isArray(tags) && Object.keys(tags).length === 0) {
    return [];
  }
  
  // 既にQiita形式の場合はそのまま返す
  if (Array.isArray(tags) && tags.length > 0 && 
      typeof tags[0] === 'object' && tags[0].name) {
    return tags;
  }
  
  // Hexo: ['tag1', 'tag2'] → Qiita: [{"name": "tag1", "versions": []}, ...]
  if (Array.isArray(tags)) {
    return tags.map(tag => ({ name: tag, versions: [] }));
  }
  
  // 文字列の場合
  if (typeof tags === 'string') {
    return [{ name: tags, versions: [] }];
  }
  
  return [];
}

/**
 * QiitaのtagsをHexo形式に変換
 */
function convertQiitaTagsToHexoFormat(qiitaTags) {
  if (!qiitaTags || !Array.isArray(qiitaTags)) return [];
  
  // Qiita: [{"name": "tag1", "versions": []}, ...] → Hexo: ['tag1', 'tag2']
  return qiitaTags.map(tag => tag.name || tag);
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
  const frontMatter = parseYaml(yamlContent);
  
  return { frontMatter, body };
}

/**
 * 簡易YAML パーサー（基本的な形式のみ対応）
 */
function parseYaml(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n');
  
  let currentKey = null;
  let isArray = false;
  let isObject = false;
  let currentObject = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // オブジェクトの処理
    if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*:$/)) {
      currentKey = trimmed.replace(':', '');
      result[currentKey] = {};
      isObject = true;
      currentObject = result[currentKey];
      continue;
    }
    
    // オブジェクト内のプロパティ
    if (isObject && line.match(/^  [a-zA-Z_]/)) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      const propKey = key.trim();
      
      // 値が空でかつ次の行が配列要素の場合（オブジェクト内の配列）
      if (value === '' && i + 1 < lines.length && lines[i + 1].match(/^\s{4,}- /)) {
        currentObject[propKey] = [];
        // 次の行以降の配列要素を読み込む
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (nextLine.match(/^\s{4,}- /)) {
            const arrayValue = nextLine.trim().replace(/^- /, '');
            currentObject[propKey].push(parseValue(arrayValue));
            i = j; // インデックスを進める
          } else {
            break;
          }
        }
      } else {
        currentObject[propKey] = parseValue(value);
      }
      continue;
    }
    
    // 通常のキー:値
    if (line.includes(':') && !line.startsWith(' ')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      currentKey = key.trim();
      isObject = false;
      isArray = false;
      
      // 値が空でかつ次の行が配列要素の場合
      if (value === '' && i + 1 < lines.length && lines[i + 1].match(/^\s*- /)) {
        result[currentKey] = [];
        isArray = true;
      } else if (value === '' || value === '[]') {
        result[currentKey] = [];
        isArray = true;
      } else {
        result[currentKey] = parseValue(value);
      }
      continue;
    }
    
    // 配列要素
    if (isArray && line.match(/^\s*- /)) {
      const value = trimmed.replace(/^- /, '');
      result[currentKey].push(parseValue(value));
    }
  }
  
  return result;
}

/**
 * 値をパース
 */
function parseValue(value) {
  if (!value) return null;
  
  // 文字列のクォートを除去
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  
  // 数値
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  
  // JSON配列の場合
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // JSONパースに失敗した場合は文字列として扱う
    }
  }
  
  return value;
}

/**
 * Markdownコンテンツを組み立て
 */
function buildMarkdownContent(frontMatter, body) {
  const yamlContent = buildYaml(frontMatter);
  return `---\n${yamlContent}\n---\n${body}`;
}

/**
 * オブジェクトをYAMLに変換
 */
function buildYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spaces}${key}: null\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      yaml += buildYaml(value, indent + 1);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        yaml += `${spaces}${key}: []\n`;
      } else {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  - ${JSON.stringify(item)}\n`;
          } else {
            yaml += `${spaces}  - ${formatYamlValue(item)}\n`;
          }
        }
      }
    } else {
      yaml += `${spaces}${key}: ${formatYamlValue(value)}\n`;
    }
  }
  
  return yaml;
}

/**
 * YAML値をフォーマット
 */
function formatYamlValue(value) {
  if (typeof value === 'string') {
    // 特殊文字があるかチェック
    if (value.includes(':') || value.includes('#') || value.includes('\n') || 
        value.startsWith(' ') || value.endsWith(' ')) {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }
  
  return String(value);
}

/**
 * コンテンツハッシュを生成
 */
function generateContentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * ファイルが更新されているかチェック
 */
export function isContentChanged(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const { frontMatter, body } = parseFrontMatter(content);
  
  if (!frontMatter.qiita?.last_sync_hash) {
    return true; // 初回同期
  }
  
  const currentHash = generateContentHash(body);
  return currentHash !== frontMatter.qiita.last_sync_hash;
}