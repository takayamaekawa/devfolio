import type { LocalizedString } from "./common";

type SiteMapProps = {
  priority?: string;
  changefreq?: string;
};

export type RouteContent = {
  title: LocalizedString;
  description: LocalizedString;
  description2?: LocalizedString;
  description3?: LocalizedString;
};

export type FullRouteInfo = {
  path: string;
  name: string;
  title: LocalizedString;
  description: LocalizedString;
  description2?: LocalizedString;
  description3?: LocalizedString;
  sitemap?: SiteMapProps;
};

// ★ sitemap.xml.tsx (サイトマップインデックス) にリストするファイルのエントリ型
export type SitemapIndexFile = {
  loc: string; // 例: "/sitemap-honox.xml" または "/blog/sitemap.xml"
  // lastmod は動的に生成するため、ここには不要
};

// ★ routes.json ファイル全体の型定義
export type RoutesJson = {
  routes: FullRouteInfo[]; // 個別のページルート情報
  sitemapIndexFiles?: SitemapIndexFile[]; // サイトマップインデックスに含めるファイルリスト (オプショナル)
};
