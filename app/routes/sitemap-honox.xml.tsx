import { createRoute } from "honox/factory";
import profile from "../../data/profile.json";
import routesData from "../../data/routes.json"; // ★ routes.json をインポート
import type { FullRouteInfo } from "../types/routes"; // ★ 型情報をインポート

export default createRoute(async (c) => {
  // routesData.routes を使用して pages 配列を動的に生成
  const pages = routesData.routes.map((route: FullRouteInfo) => {
    return {
      loc: route.path,
      lastmod: new Date().toISOString(), // lastmod は動的に生成
      priority: route.sitemap?.priority || "0.5", // routes.json から取得、なければデフォルト値
      changefreq: route.sitemap?.changefreq || "weekly", // routes.json から取得、なければデフォルト値
    };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${profile.url}${page.loc === "/" ? "" : page.loc}</loc> {/* ホームページの場合、末尾の / を重複させない */}
      <lastmod>${page.lastmod}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `,
    )
    .join("")}
</urlset>`;

  c.header("Content-Type", "application/xml");
  return c.body(xml);
});
