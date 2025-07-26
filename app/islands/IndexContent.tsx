import { usePageLang } from "../hooks/pageLang";
import { translate } from "../utils/i18n";
import { FullRouteInfo } from "../types/routes";

type IndexContentProps = {
  routesData: { routes: FullRouteInfo[] }; // ルート情報を含むデータ
};

const IndexContent = ({ routesData }: IndexContentProps) => {
  const { lang } = usePageLang();
  // console.log('[IndexContent Island] Rendered. Current lang:', lang);

  // ★ pathが '/' でないルートのみをフィルタリング
  const filteredRoutes = routesData.routes.filter(
    (route) => route.path !== "/",
  );

  return (
    <div class="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 md:flex-nowrap md:space-x-6">
      {filteredRoutes.map((route) => (
        <a
          href={route.path}
          class="text-blue-400 hover:text-blue-300 py-1 px-2 basis-[45%] md:basis-auto text-center text-link"
          key={route.path}
        >
          {translate(route.title, lang)}
        </a>
      ))}
    </div>
  );
};

export default IndexContent;
