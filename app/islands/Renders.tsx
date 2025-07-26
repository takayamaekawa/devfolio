import type { Language, NameRuby } from "../types/common";
import { translate } from "../utils/i18n";
import type { LocalizedString } from "../types/common";

export const renderName = (name: NameRuby, lang: Language) => {
  if (typeof name === "string") {
    return name; // 単純な文字列の場合
  }
  if ("text" in name && "ruby" in name) {
    // ふりがなオブジェクトの場合 (日本語想定)
    if (lang !== "ja") {
      return (
        <ruby>
          {name.text}
          <rt>{name.ruby}</rt>
        </ruby>
      );
    }
    return name.text; // 他言語ではふりがななし
  }
  return translate(name as LocalizedString, lang);
};
