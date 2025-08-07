import type { LocalizedString, NameRuby } from "./common"; // LocalizedStringを再利用

export type StaffMember = {
  id: string;
  name: NameRuby; // 名前は翻訳対象外とするか、それもLocalizedにするかによります
  position: LocalizedString;
  specialty: LocalizedString;
  message: LocalizedString;
  hobby?: LocalizedString;
  image?: string;
};

export type StaffData = {
  staff: StaffMember[];
};
