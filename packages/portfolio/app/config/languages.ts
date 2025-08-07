import type { Language } from "../types/common";

export type LanguageOption = {
  code: Language; // 'ja', 'en'
  nativeName: string; // その言語での表示名 (例: "日本語", "English")
  englishName: string; // 英語での言語名 (内部的な参照やaria-label用など)
};

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese" },
  // 必要に応じて他の言語をここに追加
  // 例: { code: 'zh-CN', nativeName: '简体中文', englishName: 'Simplified Chinese' },
];

// 現在選択されている言語の表示名を取得するヘルパー (任意)
export const getCurrentLanguageNativeName = (langCode: Language): string => {
  const current = AVAILABLE_LANGUAGES.find((l) => l.code === langCode);
  return current ? current.nativeName : langCode.toUpperCase();
};
