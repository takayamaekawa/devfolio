export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;
      if (pathname.endsWith('/')) {
        pathname += 'index.html';
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

      // ファイルが見つからなかった場合は404を返す
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Error handling request:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
