import type { LocalizedString } from './common';

export interface ProjectInfo {
  id: string; // ★ 各プロジェクトを識別するための一意のID (URLフレンドリーなものが望ましい)
  title: LocalizedString;
  description: LocalizedString; // JSXではなくLocalizedStringに変更
  details: LocalizedString;     // JSXではなくLocalizedStringに変更
  points: LocalizedString[];    // 各ポイントもLocalizedStringに
  statement: LocalizedString;
  githubRepoName?: string; // GitHubリポジトリ名 (例: "bbs", "devfolio")
  org?: string;            // GitHub組織名 (例: "Kishax") - 未指定の場合は個人アカウントを使用
  liveLink?: string;       // 公開されている場合のURL (オプション)
  // kishax のような特殊な詳細リンクが必要な場合、フラグや追加データをここに持たせることも可能
  detailsLinkRepo?: string; // 例: "kishax-web" をここに入れる
}
