import type { LocalizedString } from "./common";

export type ContactMethodInfo = {
  label: string | LocalizedString;
  id?: string;
  url?: string;
  email?: string;
  phone?: string;
  comment: LocalizedString;
};

export type ContactData = {
  way: ContactMethodInfo[];
};
