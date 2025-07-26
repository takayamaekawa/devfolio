import { usePageLang } from "../hooks/pageLang";
import { translate } from "../utils/i18n";
import type { RouteContent } from "../types/routes";
import { formatHtml } from "../utils/textFormatters";

type CommonHeaderProps = {
  // 単一のルート情報、または見つからなかった場合は undefined
  routeContent: RouteContent | undefined;
};

const CommonHeader = ({ routeContent }: CommonHeaderProps) => {
  const { lang } = usePageLang();

  if (!routeContent) {
    // ルート情報が見つからない場合、何も表示しないか、デフォルトヘッダーを表示
    return <header class="text-center py-4"></header>;
  }

  return (
    <header class="text-center mb-8">
      {" "}
      {/* ヘッダー全体の下にマージンを追加 */}
      <h1 class="text-3xl font-bold">{translate(routeContent.title, lang)}</h1>
      <p class="text-xl text-gray-400 mt-2">
        {translate(routeContent.description, lang)}
      </p>
      {routeContent.description2 && (
        <p class="text-xl text-gray-400 mt-2 underline font-bold">
          {translate(routeContent.description2, lang)}
        </p>
      )}
      {routeContent.description3 && (
        <p
          class="mt-4 text-gray-400"
          dangerouslySetInnerHTML={{
            __html: formatHtml(routeContent.description3, lang),
          }}
        />
      )}
    </header>
  );
};

export default CommonHeader;
