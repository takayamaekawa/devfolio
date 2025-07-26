import { createRoute } from "honox/factory";

const oldPostIds = ["8859", "8821", "30026", "34194"];

export default createRoute(async (c, next) => {
  const path = c.req.path;
  const match = path.match(/^\/(\d+)\/?$/);
  const id = match?.[1];

  if (id && oldPostIds.includes(id)) {
    return c.redirect(`/blog/posts/${id}/`, 301);
  }

  await next();
});
