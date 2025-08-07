import { useState, useEffect, useRef, useCallback } from "hono/jsx";
import type { Language } from "../types/common";
import {
  AVAILABLE_LANGUAGES,
  getCurrentLanguageNativeName,
  type LanguageOption,
} from "../config/languages"; // 先ほど定義したものをインポート

type LanguageSwitcherDropdownProps = {
  currentLang: Language;
  setLang: (newLang: Language) => void;
  isMobile?: boolean; // モバイル表示用に見た目を変える場合のフラグ (オプション)
};

const LanguageSwitcherDropdown = ({
  currentLang,
  setLang,
  isMobile,
}: LanguageSwitcherDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // ドロップダウン要素への参照 (クリック外判定用)

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (newLangCode: Language) => {
    setLang(newLangCode);
    setIsOpen(false); // 言語を選択したらドロップダウンを閉じる
  };

  // ドロップダウンの外側をクリックしたときに閉じる処理
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        class="flex items-center text-gray-300 hover:text-white focus:outline-none px-2 py-1 rounded"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* 地球儀アイコン (SVGまたは絵文字) */}
        <span class="mr-1" role="img" aria-label="Language">
          🌐
        </span>
        {/* isMobile ? currentLang.toUpperCase() : "LANGUAGE" */}{" "}
        {/* モバイルとデスクトップで表示を変える例 */}
        {isMobile
          ? currentLang.toUpperCase()
          : getCurrentLanguageNativeName(currentLang)}
        {/* ドロップダウンの開閉を示す矢印アイコン (Tailwind UIなどからSVGを拝借) */}
        <svg
          class={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div class="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
          {AVAILABLE_LANGUAGES.map((langOption: LanguageOption) => (
            <button
              key={langOption.code}
              onClick={() => selectLanguage(langOption.code)}
              class={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${
                currentLang === langOption.code
                  ? "font-semibold text-white bg-gray-600"
                  : "text-gray-300"
              }`}
            >
              {langOption.nativeName} {/* 各言語のネイティブ名で表示 */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcherDropdown;
