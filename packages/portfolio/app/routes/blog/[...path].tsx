import { createRoute } from "honox/factory";

export default createRoute(async (c) => {
  const path = c.req.path;
  
  // /blog へのアクセスの場合、/blog/index.html にリダイレクト
  if (path === "/blog" || path === "/blog/") {
    return c.redirect("/blog/index.html", 301);
  }
  
  // 静的ファイルへのフォールバック
  // Cloudflare Workers環境では、静的ファイルは自動的に配信される
  // このルートは静的ファイルが見つからない場合のみ実行される
  return c.notFound();
});