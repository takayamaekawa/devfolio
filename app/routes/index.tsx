import { createRoute } from "honox/factory";
import IndexContent from "../islands/IndexContent";
import routesDataJson from "../../data/routes.json";

const routesData = { routes: routesDataJson.routes };

export default createRoute(async (c) =>
  c.render(<IndexContent routesData={routesData} />),
);
