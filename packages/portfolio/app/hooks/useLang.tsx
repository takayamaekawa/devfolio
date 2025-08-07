import {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useCallback,
} from "hono/jsx";
import { Language } from "../types/common";

type LangContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LangContext = createContext<LangContextType>({
  lang: "ja",
  setLang: () => {
    console.warn(
      "Default setLang in LangContext called. Provider might be missing or not updated.",
    );
  },
});

export const LangProvider = ({ children }: PropsWithChildren) => {
  const [lang, setLangState] = useState<Language>("ja");

  useEffect(() => {
    // console.log(`[LangProvider Client Effect] lang state is now: ${lang}`);
  }, [lang]);

  const updateLang = useCallback(
    (newLang: Language) => {
      // console.log(`[LangProvider] updateLang CALLED. Attempting to change from "${lang}" to "${newLang}"`);
      if (newLang !== lang) {
        setLangState(newLang);
        // console.log(`[LangProvider] Lang SET to "${newLang}". State update initiated.`);
      } else {
        // console.log(`[LangProvider] Language already "${newLang}". No state change.`);
      }
    },
    [lang],
  ); // lang が変更されたら updateLang も再生成 (重要)

  // contextに渡すvalueオブジェクトをuseMemoでメモ化
  const contextValue = useMemo(
    () => ({
      lang,
      setLang: updateLang,
    }),
    [lang, updateLang],
  ); // lang または updateLang (実質langに依存) が変わった時のみ contextValue を再生成

  return (
    <LangContext.Provider value={contextValue}>{children}</LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);

  // ★ このログで、context が Provider から来たものか、デフォルト値か判別する
  if (context.setLang.toString().includes("console.warn")) {
    // ダミー関数かどうかを簡易的にチェック
    console.error(
      `[useLang Hook ERROR] useContext is returning the DEFAULT context value! This means the Island is not seeing the LangProvider correctly. Lang: ${context.lang}, setLang type: ${typeof context.setLang}`,
    );
  } else {
    // console.log(`[useLang Hook OK] useContext returned a value from a Provider. Lang: ${context.lang}, typeof setLang: ${typeof context.setLang}`);
  }

  if (!context) {
    // 通常この分岐には入らないはず
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
};
