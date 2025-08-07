import { usePageLang } from "../hooks/pageLang";
import type { Language } from "../types/common";
import type { StaffMember } from "../types/staff";
import type { NameRuby } from "../types/common";
import { translate } from "../utils/i18n";
import { generalMessages } from "../locales/translations";
import { renderName } from "../islands/Renders";

interface StaffMemberUpdated extends Omit<StaffMember, "name"> {
  // Omitを使ってnameを上書き
  name: NameRuby;
}
// StaffItemPropsの型も更新
type StaffItemPropsUpdated = StaffMemberUpdated & {
  lang: Language;
};

function StaffItem({
  name,
  position,
  specialty,
  message,
  image,
  hobby,
  lang,
}: StaffItemPropsUpdated) {
  // altテキスト用の簡易的な名前取得 (renderNameがJSXを返す可能性があるため、文字列を確実に取得)
  let plainNameForAlt = "";
  if (typeof name === "string") {
    plainNameForAlt = name;
  } else if ("text" in name) {
    // NameRuby オブジェクトの場合
    plainNameForAlt = name.text;
  } else {
    // LocalizedString オブジェクトの場合
    plainNameForAlt = name[lang] || name.ja;
  }

  return (
    <div
      class="bg-gray-700 p-4 sm:p-6 rounded-lg shadow-lg
                flex flex-col items-center space-y-4    /* ★ デフォルト (モバイル): 縦積み、中央揃え */
                sm:flex-row sm:space-y-0 sm:space-x-6 sm:items-start /* ★ sm以上: 横並び、上揃え */
               "
    >
      {image && (
        <img
          src={image}
          alt={plainNameForAlt} // ★ プレーンテキストの名前を使用
          // モバイルでは少し大きめ、sm以上で元のサイズに戻す例
          class="w-24 h-24 rounded-full object-cover shrink-0
                  sm:w-20 sm:h-20"
        />
      )}

      {/* テキストコンテンツ用のdiv */}
      <div class="flex-1 text-center sm:text-left w-full sm:w-auto">
        {/* モバイル(デフォルト): text-center, w-full (画像の下で幅いっぱい)
            sm以上: text-left, w-auto (画像の横で幅は自動)
        */}
        <h3 class="text-xl font-semibold text-gray-100">
          {renderName(name, lang)}
        </h3>
        <p class="text-gray-400 text-sm mt-0.5">{translate(position, lang)}</p>
        <p class="mt-3 text-gray-300 text-sm">
          <strong class="font-medium text-gray-200">
            {translate(generalMessages.staffSpecialtyLabel, lang)}
          </strong>
          <span class="ml-1">{translate(specialty, lang)}</span>
        </p>

        {/* 趣味の欄を追加 */}
        {hobby && (
          <p class="mt-2 text-gray-300 text-sm">
            <strong class="font-medium text-gray-200">
              {translate(generalMessages.staffHobbyLabel, lang)}
            </strong>
            <span class="ml-1">{translate(hobby, lang)}</span>
          </p>
        )}

        <p class="mt-2 text-gray-300 italic text-sm leading-relaxed">
          "{translate(message, lang)}"
        </p>
      </div>
    </div>
  );
}

// StaffListコンポーネントのprops型も更新
type StaffListPropsUpdated = {
  staffMembers: StaffMemberUpdated[];
};

const StaffList = ({ staffMembers }: StaffListPropsUpdated) => {
  const { lang } = usePageLang();
  return (
    <>
      {staffMembers.map((member) => (
        <StaffItem key={`${member.id}-${lang}`} {...member} lang={lang} />
      ))}
    </>
  );
};
export default StaffList;
