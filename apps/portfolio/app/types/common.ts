export type LocalizedString = {
  ja: string;
  en: string;
};

export type Language = "ja" | "en";

export type NameRuby =
  | string
  | { text: string; ruby: string }
  | LocalizedString;
