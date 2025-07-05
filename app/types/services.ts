import { LocalizedString } from '../types/common';

export type ServiceOtherSiteItem = {
  name: LocalizedString;
  description: LocalizedString;
  url: string;
};

export type ServiceInfo = {
  devNotes: {
    title: LocalizedString;
    subtitle: LocalizedString;
    description1: LocalizedString;
    obsidianPoint: LocalizedString;
    visitSite: LocalizedString;
    siteUrl: string;
  };
  techBlog: {
    title: LocalizedString;
    description1: LocalizedString;
    description2: LocalizedString;
    readBlog: LocalizedString;
    readQiita: LocalizedString;
    or: LocalizedString;
  };
  kishax: {
    title: LocalizedString;
    description1: LocalizedString;
    description2: LocalizedString;
    description3: LocalizedString;
    features: LocalizedString[];
    portalSite: LocalizedString;
    discordTitle: LocalizedString;
    joinHere: LocalizedString;
  };
  otherSites: {
    title: LocalizedString;
    description1: LocalizedString;
    description2: LocalizedString;
    visitSite: LocalizedString;
    info: ServiceOtherSiteItem[];
  }
}
