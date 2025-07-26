import { useState, useEffect, useCallback } from "hono/jsx";
import { Language } from "../types/common";
import LanguageSwitcherDropdown from "./LanguageSwitcherDropdown";

type ProfileDataForNav = { name: string };
type HamburgerNavProps = {
  profile: ProfileDataForNav;
  lang: Language;
  setLang: (newLang: Language) => void;
};

const NAVBAR_HEIGHT_PX = 56; // 仮のNavbarの高さ (ピクセル)
const SCROLL_THRESHOLD = 5; // スクロール検知の閾値 (ピクセル)
const navbarActualHeight = "3.5rem"; // CSSで使用するNavbarの高さ (例)

const HamburgerNav = ({ profile, lang, setLang }: HamburgerNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
      return;
    }
    if (currentScrollY > lastScrollY && currentScrollY > NAVBAR_HEIGHT_PX) {
      setNavVisible(false);
    } else {
      if (currentScrollY < lastScrollY || currentScrollY <= NAVBAR_HEIGHT_PX) {
        setNavVisible(true);
      }
    }
    setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    setLastScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLangSelected = (newLang: Language) => {
    setLang(newLang);
    // setIsOpen(false); // ドロップダウンが自身で閉じるので、ここでは不要な場合も
  };

  const navClasses = `bg-gray-800 py-4 fixed top-0 left-0 right-0 z-50 shadow-md transition-transform duration-300 ease-in-out 
    ${navVisible ? "transform-none" : "-translate-y-full"}
    mx-auto max-w-4xl`; // ★ 中央揃えと最大幅を追加 (w-full を削除)

  return (
    <nav class={navClasses} style={{ height: navbarActualHeight }}>
      <div class="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
        {/* ロゴ */}
        <div class="text-gray-100 font-bold text-xl">
          <a href="/" class="text-gray-100 font-bold text-xl">
            {profile.name}
          </a>
        </div>

        {/* デスクトップメニュー */}
        <div class="hidden md:flex items-center space-x-8">
          <a href="/" class="text-gray-300 hover:text-blue-500 text-link">
            HOME
          </a>
          <a href="/about" class="text-gray-300 hover:text-blue-500 text-link">
            ABOUT
          </a>
          <a
            href="/projects"
            class="text-gray-300 hover:text-blue-500 text-link"
          >
            PROJECTS
          </a>
          <a
            href="/services"
            class="text-gray-300 hover:text-blue-500 text-link"
          >
            SERVICES
          </a>
          <a
            href="/contact"
            class="text-gray-300 hover:text-blue-500 text-link"
          >
            CONTACT
          </a>
          <LanguageSwitcherDropdown
            currentLang={lang}
            setLang={handleLangSelected}
          />
        </div>

        {/* モバイル用コントロール */}
        <div class="md:hidden flex items-center space-x-2">
          {/* ★ モバイル用にも LanguageSwitcherDropdown を配置 (isMobile=true を渡す) */}
          <LanguageSwitcherDropdown
            currentLang={lang}
            setLang={handleLangSelected}
            isMobile={true}
          />
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            class="focus:outline-none text-gray-100 hover:text-blue-400"
          >
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー Dropdown (ハンバーガーメニュー本体) */}
        {isOpen && (
          <div
            class="md:hidden absolute top-full left-0 w-full bg-gray-800 shadow-lg overflow-y-auto"
            style={{ maxHeight: `calc(100vh - ${navbarActualHeight})` }}
          >
            <div class="px-4 py-2 flex flex-col items-center space-y-2">
              <a
                href="/"
                class="text-gray-300 hover:text-blue-500 py-2 text-link"
                onClick={() => setIsOpen(false)}
              >
                HOME
              </a>
              <a
                href="/about"
                class="text-gray-300 hover:text-blue-500 py-2 text-link"
                onClick={() => setIsOpen(false)}
              >
                ABOUT
              </a>
              <a
                href="/projects"
                class="text-gray-300 hover:text-blue-500 py-2 text-link"
                onClick={() => setIsOpen(false)}
              >
                PROJECTS
              </a>
              <a
                href="/services"
                class="text-gray-300 hover:text-blue-500 py-2 text-link"
                onClick={() => setIsOpen(false)}
              >
                SERVICES
              </a>
              <a
                href="/contact"
                class="text-gray-300 hover:text-blue-500 py-2 text-link"
                onClick={() => setIsOpen(false)}
              >
                CONTACT
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HamburgerNav;
