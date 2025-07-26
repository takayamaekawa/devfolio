import { useState, useEffect, PropsWithChildren } from "hono/jsx";
import HamburgerNav from "./HamburgerNav"; // HamburgerNavのpropsも確認
import { Language } from "../types/common";
import type { SiteConfig } from "../types/siteConfig"; // siteConfigの型定義のパスを確認
import { PageLangContextProvider } from "../hooks/pageLang"; // pageLangフックのパスを確認
import type { ProfileData } from "../types/profile";
import type { RouteContent, FullRouteInfo } from "../types/routes";
import PrevNextNavigation from "./PrevNextNavigation";
import CommonHeader from "./CommonHeader";

type RootLayoutIslandProps = PropsWithChildren<{
  profile: ProfileData;
  initialLang?: Language;
  currentPath: string;
  siteConfig: SiteConfig;
  routesData: {
    routes: FullRouteInfo[];
  };
}>;

const LS_LANG_KEY = "maekawa_dev_lang";

export default function RootLayoutIsland({
  children,
  profile,
  initialLang = "ja",
  currentPath,
  siteConfig,
  routesData,
}: RootLayoutIslandProps) {
  const [lang, setLangOriginal] = useState<Language>(() => {
    if (typeof localStorage !== "undefined") {
      const storedLang = localStorage.getItem(LS_LANG_KEY);
      if (storedLang && (storedLang === "ja" || storedLang === "en")) {
        return storedLang as Language;
      }
    }
    return initialLang;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_LANG_KEY, lang);
    }
  }, [lang]);

  // currentPath に基づいて表示するヘッダー情報を data/routes.json から検索
  const currentRouteData = routesData.routes.find(
    (r) => r.path === currentPath,
  );

  // CommonHeader に渡すためのデータ (RouteContent 型に合わせる)
  const headerContent: RouteContent | undefined = currentRouteData
    ? {
        title: currentRouteData.title,
        description: currentRouteData.description, // data/routes.json の description を使用
        description2: currentRouteData.description2,
        description3: currentRouteData.description3,
      }
    : undefined;

  const shouldShowPrevNext = siteConfig.showPrevNextOnHomePage
    ? true
    : currentPath !== "/";

  // HamburgerNav の高さを定義 (例: 3.5rem)
  // Tailwind CSS を使っているなら、pt-14 (3.5rem) や pt-16 (4rem) なども使える
  const hamburgerNavHeight = "3.5rem"; // CSSの単位で指定

  return (
    <>
      <HamburgerNav
        profile={{ name: profile.name }}
        lang={lang}
        setLang={setLangOriginal}
      />
      <div style={{ paddingTop: hamburgerNavHeight }}>
        <PageLangContextProvider value={{ lang }}>
          <div class="mx-auto py-16 px-4 sm:px-6 lg:px-8 max-w-3xl">
            <CommonHeader routeContent={headerContent} />
            {children}
            {shouldShowPrevNext && (
              <PrevNextNavigation
                currentPath={currentPath}
                routesData={routesData}
              />
            )}
          </div>
        </PageLangContextProvider>
      </div>
      <footer class="mt-12 text-center text-gray-400 bg-gray-800 border-t border-gray-700 py-6 shadow-inner">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          {profile.copyrighter || profile.name}.
          <br class="sm:hidden" /> All rights reserved.
        </p>
      </footer>
    </>
  );
}
