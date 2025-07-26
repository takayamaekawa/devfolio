import { usePageLang } from "../hooks/pageLang";
import { translate } from "../utils/i18n";
import type { ContactData, ContactMethodInfo } from "../types/contact"; // 新しい型をインポート
import type { Language } from "../types/common";

// 各連絡方法をカード形式で表示するコンポーネント
const ContactCard = ({
  method,
  lang,
}: {
  method: ContactMethodInfo;
  lang: Language;
}) => {
  let href: string | undefined;
  let displayLabel: string;

  // labelプロパティが文字列かオブジェクトかで翻訳方法を分ける
  const name =
    typeof method.label === "string"
      ? method.label
      : translate(method.label, lang);

  // 連絡方法の種類に応じて、表示するラベルとリンク先を決定
  if (name === "Discord") {
    href = undefined; // Discordは直接リンクできないので、IDのみ表示
    displayLabel = `@${method.id}`;
  } else if (name === "X") {
    href = `${method.url}/${method.id}`;
    displayLabel = `@${method.id}`;
  } else if (name === "GitHub") {
    href = `${method.url}/${method.id}`;
    displayLabel = `@${method.id}`;
  } else if (name === "LinkedIn") {
    href = `${method.url}/${method.id}`;
    displayLabel = `@${method.id}`;
  } else if (method.email) {
    // Emailオブジェクトの場合
    href = `mailto:${method.email}`;
    displayLabel = method.email;
  } else if (method.phone) {
    // ★ ここから電話番号の処理 ★

    // 1. `tel:` リンク用のhrefを作成 (国際形式のまま、ハイフンなどを削除)
    // これにより、どの国からでも正しく電話をかけられる
    href = `tel:${method.phone.replace(/[- ]/g, "")}`;

    // 2. 画面表示用のラベルを作成
    if (lang === "ja" && method.phone.startsWith("+81")) {
      // 言語が日本語で、番号が '+81' で始まる場合、見慣れた '0'始まりの形式に変換
      // 例: "+81-90-1234-5678" -> "090-1234-5678"
      displayLabel = method.phone.replace(/^\+81[- ]?/, "0");
    } else {
      // それ以外の言語、または '+81' で始まらない番号の場合は、そのまま表示
      displayLabel = method.phone;
    }
  } else {
    // 将来的に他のタイプが増えた場合のフォールバック
    href = method.url;
    displayLabel = `@${method.id}` || "";
  }

  return (
    // 各連絡方法をセクションで区切る
    <section class="mt-8 text-center">
      {/* 連絡方法の名前 (例: "Discord", "X", "メール") */}
      <h3 class="text-base font-semibold text-gray-400">{name}</h3>

      {/* 連絡先 (リンクまたはテキスト) */}
      <div class="mt-1 text-lg">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-400 hover:text-blue-300 transition duration-200 underline break-all text-link"
          >
            {displayLabel}
          </a>
        ) : (
          <p class="text-gray-300 break-all">{displayLabel}</p>
        )}
      </div>

      {/* 補足コメント */}
      <p class="text-sm text-gray-500 mt-2">
        {translate(method.comment, lang)}
      </p>
    </section>
  );
};

// メインのコンポーネント (Propsの型を ContactData に変更)
function ContactContent({ way }: ContactData) {
  const { lang } = usePageLang();

  return (
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
      {/* 'way' 配列をループして、各連絡方法をカードとして表示 */}
      {way.map((method, index) => (
        <ContactCard key={index} method={method} lang={lang} />
      ))}
    </div>
  );
}

export default ContactContent;
