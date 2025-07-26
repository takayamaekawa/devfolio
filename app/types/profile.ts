export type ProfileData = {
  name: string;
  title?: string;
  copyrighter: string;
  social: ProfileSocials;
};

export type ProfileSocials = {
  github: {
    id: string;
    url: string;
  };
  qiita: {
    id: string;
    url: string;
  };
  kishax: {
    page: {
      url: string;
    };
    discord: {
      url: string;
    };
  };
};
