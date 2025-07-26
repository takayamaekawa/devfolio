// app/routes/[name].tsx
import { createRoute } from "honox/factory";

export default createRoute(async (c) => {
  const name = c.req.param("name");

  return c.render(
    <>
      <div className="mx-auto py-16 px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="text-2xl font-bold">Hello, {name}!</h1>
        <p className="mt-4">You are viewing the page for: {name}</p>
      </div>
    </>,
  );
});
