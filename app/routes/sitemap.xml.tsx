import { createRoute } from "honox/factory";
import profile from "../../data/profile.json";
import routesDataJson from "../../data/routes.json";
import type { RoutesJson } from "../types/routes";

// インポートしたJSONデータに型を適用 (TypeScriptが型推論できない場合があるため)
const routesData: RoutesJson = routesDataJson;

export default createRoute(async (c) => {
  const lastmod = new Date().toISOString();
  let sitemapEntriesXml = "";

  if (
    routesData.sitemapIndexFiles &&
    Array.isArray(routesData.sitemapIndexFiles)
  ) {
    sitemapEntriesXml = routesData.sitemapIndexFiles
      .map((sitemapFile) => {
        // profile.url が末尾に / を持たず、sitemapFile.loc が / で始まることを想定
        const sitemapLocation = `${profile.url}${sitemapFile.loc}`;
        return `
  <sitemap>
    <loc>${sitemapLocation}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
      })
      .join("");
  } else {
    // sitemapIndexFiles が未定義の場合のフォールバック (例: sitemap-honox.xml のみ)
    console.warn(
      "sitemap.xml.tsx: 'sitemapIndexFiles' not found in routes.json. Defaulting to sitemap-honox.xml only.",
    );
    const honoxSitemapUrl = `${profile.url}/sitemap-honox.xml`;
    sitemapEntriesXml = `
  <sitemap>
    <loc>${honoxSitemapUrl}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntriesXml}
</sitemapindex>`;

  c.header("Content-Type", "application/xml");
  return c.body(xml);
});
