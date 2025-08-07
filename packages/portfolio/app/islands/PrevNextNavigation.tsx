import { useState, useEffect } from "hono/jsx";
import { usePageLang } from "../hooks/pageLang";
import { translate } from "../utils/i18n";
import { generalMessages } from "../locales/translations";
import {
  getNextPage,
  getPreviousPage,
  type NavItem,
} from "../config/navigation";
import type { FullRouteInfo } from "../types/routes";

type ArrowIconProps = {
  direction: "left" | "right";
  className?: string;
};

const ArrowIcon = ({ direction, className = "" }: ArrowIconProps) => {
  const commonPath = "M13.5 4.5 21 12m0 0L13.5 19.5M21 12H3";
  let svgClassName = `h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${className}`;
  if (direction === "left") {
    svgClassName += " rotate-180 origin-center";
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class={svgClassName.trim()}
    >
      <path stroke-linecap="round" stroke-linejoin="round" d={commonPath} />
    </svg>
  );
};

type PrevNextNavigationProps = {
  currentPath: string;
  routesData: { routes: FullRouteInfo[] }; // ★ routesData を props として追加
};

const PrevNextNavigation = ({
  currentPath,
  routesData,
}: PrevNextNavigationProps) => {
  const { lang } = usePageLang();

  // ★ getPreviousPage と getNextPage に routesData を渡す
  const [previousPageInfo, setPreviousPageInfo] = useState<NavItem | null>(() =>
    getPreviousPage(currentPath, routesData),
  );
  const [nextPageInfo, setNextPageInfo] = useState<NavItem | null>(() =>
    getNextPage(currentPath, routesData),
  );

  useEffect(() => {
    // ★ useEffect 内でも routesData を渡す
    setPreviousPageInfo(getPreviousPage(currentPath, routesData));
    setNextPageInfo(getNextPage(currentPath, routesData));
  }, [currentPath, routesData]); // ★ useEffect の依存配列に routesData を追加

  if (!previousPageInfo && !nextPageInfo) {
    return null;
  }

  const prevPageTitle = previousPageInfo
    ? translate(previousPageInfo.title, lang)
    : null;
  const nextPageTitle = nextPageInfo
    ? translate(nextPageInfo.title, lang)
    : null;

  return (
    <div class="mt-10 mb-8 py-5 px-4 sm:px-6 bg-slate-800/70 border border-slate-700/60 rounded-lg shadow-xl flex flex-col sm:flex-row justify-between items-stretch gap-4">
      {/* Previous Page Link Area */}
      {previousPageInfo ? (
        <a
          href={previousPageInfo.path}
          class="group flex-1 flex items-center p-3 sm:p-4 rounded-md hover:bg-slate-700/80 transition-colors duration-150 text-gray-300 hover:text-white"
        >
          <ArrowIcon
            direction="left"
            className="mr-2 sm:mr-3 text-gray-400 group-hover:text-white transition-colors"
          />
          <div class="text-left">
            <span class="text-xs text-gray-400 block group-hover:text-gray-200 transition-colors">
              {translate(generalMessages.prevButtonText, lang)}
            </span>
            {prevPageTitle && (
              <span class="text-sm sm:text-base font-semibold block">
                {prevPageTitle}
              </span>
            )}
          </div>
        </a>
      ) : (
        <div class="flex-1"></div>
      )}

      {/* Next Page Link Area */}
      {nextPageInfo ? (
        <a
          href={nextPageInfo.path}
          class="group flex-1 flex items-center justify-end p-3 sm:p-4 rounded-md hover:bg-slate-700/80 transition-colors duration-150 text-gray-300 hover:text-white"
        >
          <div class="text-right">
            <span class="text-xs text-gray-400 block group-hover:text-gray-200 transition-colors">
              {translate(generalMessages.nextButtonText, lang)}
            </span>
            {nextPageTitle && (
              <span class="text-sm sm:text-base font-semibold block">
                {nextPageTitle}
              </span>
            )}
          </div>
          <ArrowIcon
            direction="right"
            className="ml-2 sm:ml-3 text-gray-400 group-hover:text-white transition-colors"
          />
        </a>
      ) : (
        <div class="flex-1"></div>
      )}
    </div>
  );
};

export default PrevNextNavigation;
