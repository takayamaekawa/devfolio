// app/types/about.ts
import type { LocalizedString } from "./common"; // ★ common.ts に LocalizedString があると仮定
import type { aboutPageStrings } from "../locales/translations";

// 古い定義や重複した定義を削除し、以下のように整理します。

// Aboutセクションの基本コンテンツ (AboutMe, Career, Finally がこれを拡張または利用)
export interface AboutSectionBase {
  // 名前を変更して明確化
  title: LocalizedString;
}

export interface AboutMeContent extends AboutSectionBase {
  intro1: LocalizedString;
  policySuffix: LocalizedString;
  neovimStory: LocalizedString;
}

export interface CareerContent extends AboutSectionBase {
  paragraphs: LocalizedString[];
}

// 「最後に」セクションの新しい構造のための型
export type KnownLinkIds = "myBlog" | "qiita" | "projects";

export type TextSegment = {
  type: "text";
  key: keyof typeof aboutPageStrings; // aboutPageStrings のキーであることを示す
};

export type LinkSegment = {
  type: "link";
  linkId: KnownLinkIds;
};

export type Segment = TextSegment | LinkSegment;

export interface ParagraphStructure {
  segments: Segment[];
}

export interface FinallyContentStructure extends AboutSectionBase {
  // AboutSectionBaseを継承してtitleを持つ
  paragraphs: ParagraphStructure[];
}

// AboutData 全体の型 (これが唯一の定義となるようにする)
export interface AboutData {
  aboutMe: AboutMeContent;
  career: CareerContent;
  finally: FinallyContentStructure; // ★ 更新された型を使用
}
