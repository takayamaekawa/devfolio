import { createContext, useContext } from "hono/jsx";
import type { Language } from "../types/common";

type PageLangContextType = {
  lang: Language;
};

// Contextのデフォルト値
const PageLangContext = createContext<PageLangContextType>({
  lang: "ja", // アプリケーションのデフォルト言語
});

// Providerをエクスポートして RootLayoutIsland で使えるようにする
export const PageLangContextProvider = PageLangContext.Provider;

// langを消費するためのカスタムフック
export const usePageLang = (): PageLangContextType => {
  const context = useContext(PageLangContext);
  if (!context) {
    // このエラーは、PageLangContextProvider でラップされていない場合に発生する可能性がある
    console.warn(
      'usePageLang must be used within a PageLangContextProvider. Defaulting to "ja".',
    );
    return { lang: "ja" };
  }
  // console.log('[usePageLang Hook] Consumed lang:', context.lang); // デバッグ用
  return context;
};
