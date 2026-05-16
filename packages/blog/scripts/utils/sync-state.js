#!/usr/bin/env node

/**
 * qiita/sync-state.json の読み書きユーティリティ
 *
 * source/_posts/*.md の mtime 汚染を防ぐため、
 * 同期用メタデータ（last_sync_hash / last_sync_at 等）を
 * .md frontmatter ではなく外部 JSON ファイルで管理する。
 *
 * JSONキー: source/_posts/ 内の .md ファイル名（パスなし）
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";

const STATE_FILENAME = "sync-state.json";

function statePath(qiitaDir) {
  return join(qiitaDir, STATE_FILENAME);
}

export function readSyncState(qiitaDir) {
  const path = statePath(qiitaDir);
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

export function writeSyncState(qiitaDir, state) {
  writeFileSync(statePath(qiitaDir), JSON.stringify(state, null, 2) + "\n");
}

/** 単一記事の状態を取得（キー: ファイル名のみ） */
export function getArticleState(qiitaDir, hexoFilePath) {
  const state = readSyncState(qiitaDir);
  return state[basename(hexoFilePath)] || {};
}

/** 単一記事の状態を部分更新（他記事に影響しない） */
export function updateArticleState(qiitaDir, hexoFilePath, updates) {
  const state = readSyncState(qiitaDir);
  const key = basename(hexoFilePath);
  state[key] = { ...state[key], ...updates };
  writeSyncState(qiitaDir, state);
}
