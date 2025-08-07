import type {} from "hono";

type MetaTag = {
  name?: string;
  property?: string;
  content: string;
};

declare module "hono" {
  interface Env {
    Variables: {
      APP_NAME?: string;
      pageTitle?: string;
      metaTags?: MetaTag[];
    };
    Bindings: {
      CONFIG?: KVNamespace;
      DB?: D1Database;
    };
  }
}
