export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;

      // リダイレクト対象の記事IDの配列
      const oldPostIds = ['8859', '8821', '30026', '34194', '49418'];

      // 古いパーマリンクを新しいパーマリンクへリダイレクトする処理
      for (const oldId of oldPostIds) {
        if (pathname === `/${oldId}/`) {
          return Response.redirect(`${url.origin}/posts/${oldId}/`, 301);
        }
      }

      if (pathname.endsWith('/')) {
        pathname += 'index.html';
      }

      // atom.xml の特別な処理
      if (pathname === '/atom.xml') {
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

      // search.xml の特別な処理
      if (pathname === '/search.xml') {
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

      // その他の静的アセットの処理
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

      // ファイルが見つからなかった場合は404を返す
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Error handling request:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
