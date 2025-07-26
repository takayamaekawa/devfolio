import type { Language } from "../types/common";
import type { LocalizedString } from "../types/common";
import { otherDictionary } from "../locales/translations";

/**
 * LocalizedString オブジェクトまたは文字列から、指定された言語のテキストを返します。
 * HTMLタグはそのまま返します。
 * @param data LocalizedString オブジェクトまたは通常の文字列
 * @param lang 対象の言語
 * @returns 翻訳された文字列
 */
export function translate(
  data: LocalizedString | string | undefined,
  lang: Language,
): string {
  if (!data) return ""; // データがない場合は空文字を返す
  if (typeof data === "string") return data; // 文字列の場合はそのまま返す

  // LocalizedString の場合
  return data[lang] || data.ja || ""; // 対象言語、なければ日本語、なければ空文字
}

/**
 * HTMLタグを考慮して翻訳する（今回は簡易版のため、translateと同じ）
 * より高度な実装では、タグをプレースホルダーに置換する処理が入ります。
 * @param data LocalizedString オブジェクトまたは通常の文字列
 * @param lang 対象の言語
 * @returns 翻訳された文字列
 */
export function translateWithHtml(
  data: LocalizedString | string | undefined,
  lang: Language,
): string {
  // TODO: HTMLタグのプレースホルダー処理を実装する
  return translate(data, lang);
}

/**
 * テキスト内の魚の名前にルビを振る関数（日本語のみ対象）
 * @param text テキスト
 * @param lang 現在の言語
 * @returns ルビ付きのHTML文字列
 */
export function addRubyToFishNames(text: string, lang: Language): string {
  if (lang !== "ja") {
    return text;
  }

  let processedText = text;
  for (const [jaName, names] of Object.entries(otherDictionary)) {
    // 正規表現で、<ruby>タグの内側でない魚の名前を探す
    const regex = new RegExp(jaName + "(?![^<]*</rt>)", "g");
    processedText = processedText.replace(
      regex,
      `<ruby>${jaName}<rt>${names.en}</rt></ruby>`,
    );
  }
  return processedText;
}

/**
 * 翻訳し、さらにルビを振る関数
 * @param data LocalizedString オブジェクトまたは通常の文字列
 * @param lang 対象の言語
 * @returns 翻訳・ルビ付きのHTML文字列
 */
export function translateAndRuby(
  data: LocalizedString | string | undefined,
  lang: Language,
): string {
  const translated = translate(data, lang);
  return addRubyToFishNames(translated, lang);
}
