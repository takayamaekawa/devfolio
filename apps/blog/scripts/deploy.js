export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;

      // 以下、butterflyの「最近の記事」にて、rootを/blogに設定しているのに、/[id]のURLに設定されてしまう問題を回避するためのコードだが、そもそも、これがめんどうだと感じる場合は、「最近の記事」を非表示にすることをおすすめする。どうしても、「最近の記事」を表示したい場合は、下のコメントアウトを外して、適宜修正すること。
      const oldPostIds = ["8859", "8821", "30026", "34194", "49418"];

      for (const oldId of oldPostIds) {
        if (pathname === `/${oldId}/`) {
          return Response.redirect(`${url.origin}/posts/${oldId}/`, 301);
        }
      }

      if (pathname.endsWith("/")) {
        pathname += "index.html";
      }

      if (pathname === "/atom.xml") {
        const assetResponse = await fetch(`https://static-content/atom.xml`, {
          cf: {
            cacheTtl: 60 * 60, // 1時間のブラウザキャッシュ
            edgeTtl: 60 * 60 * 2, // 2時間のCDNキャッシュ
            cacheEverything: true,
            cacheKey: request.url,
          },
        });
        if (assetResponse.ok) {
          return assetResponse;
        }
      }

      if (pathname === "/search.xml") {
        const assetResponse = await fetch(`https://static-content/search.xml`, {
          cf: {
            cacheTtl: 5 * 60, // 5分のブラウザキャッシュ (頻繁に更新される可能性を考慮)
            edgeTtl: 10 * 60, // 10分のCDNキャッシュ
            cacheEverything: true,
            cacheKey: request.url,
          },
        });
        if (assetResponse.ok) {
          return assetResponse;
        }
      }

      const assetResponse = await fetch(`https://static-content/${pathname}`, {
        cf: {
          cacheTtl: 60 * 60 * 24 * 7, // 7日間のブラウザキャッシュ
          cacheEverything: true,
          cacheKey: request.url,
        },
      });

      if (assetResponse.ok) {
        return assetResponse;
      }

      return new Response("Not Found", { status: 404 });
    } catch (e) {
      console.error("Error handling request:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
