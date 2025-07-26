import { otherDictionary } from "../locales/translations";

function RubyText({ text, lang }: { text: string; lang: string }) {
  if (lang !== "ja") {
    return <>{text}</>;
  }

  // 簡易的な実装: 辞書にある魚の名前を探してルビを振る
  let processedText = text;
  for (const [jaName, enName] of Object.entries(otherDictionary)) {
    processedText = processedText.replace(
      new RegExp(jaName, "g"),
      `<ruby>${jaName}<rt>${enName}</rt></ruby>`,
    );
  }

  return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
}

export default RubyText;
