import type { LocalizedString } from "../types/common";

export const otherDictionary: Record<string, LocalizedString> = {
  // add below When you want to write furigana for Japanese words
  // "": {
  //   ja: "",
  //   en: ""
  // }
};

export const generalMessages: Record<string, LocalizedString> = {
  emailLabel: { ja: "メール", en: "Email" },
  tableOfContentsTitle: { ja: "目次", en: "Table of Contents" },
  AboutMeLabel: { ja: "「前川 鷹哉」とは", en: "Who is 'Takaya Maekawa'?" },
  AboutPolicyLable: {
    ja: "プログラミングにおけるポリシー",
    en: "my policy on programming",
  },
  AboutBackgrounds: {
    ja: "プログラミングを始めてから今に至るまで",
    en: "From the time I started programming until now",
  },
  AboutLastLabel: { ja: "最後に", en: "Finally" },
  nextButtonText: { ja: "次に進む", en: "Next" },
  nextPagePrefix: { ja: "次は:", en: "Next:" },
  prevButtonText: { ja: "前に戻る", en: "Previous" },
  prevPagePrefix: { ja: "前は:", en: "Previous:" },
  staffSpecialtyLabel: { ja: "プロフィール:", en: "Profile:" },
  staffHobbyLabel: { ja: "趣味:", en: "Hobby:" },
};

export const projectPageStrings = {
  // 新しいオブジェクトとして定義するか、generalMessagesに追加
  viewOnGithub: { ja: "GitHubで見る", en: "View on GitHub" },
  moreInfoPrefix: { ja: "詳しくは、", en: "For more details, check " },
  moreInfoCheck: {
    ja: "詳しくは、 {githubProfileLink} をチェック。",
    en: "For more details, check {githubProfileLink}.",
  },
  viewSite: { ja: "サイトを見る", en: "View Site" }, // liveLink用

  // ★ kishaxプロジェクト詳細用に追加
  kishaxAuthDetailPrefix: {
    ja: "認証ユーザーは、",
    en: "Authenticated users are those who have logged into the login page of ",
  },
  kishaxAuthDetailSuffix: {
    ja: "のログインページにログインしたユーザーが該当します。",
    en: ".", // 英語の場合はリンクの後にピリオドが自然かもしれません
  },
};

export const aboutPageStrings = {
  myBlogLinkText: { ja: "私のブログ", en: "My Blog" },
  qiitaUserPrefix: { ja: "Qiita-@", en: "Qiita-@" },
  projectsLinkText: { ja: "PROJECTS", en: "PROJECTS" },
  servicesLinkText: { ja: "SERVICES", en: "SERVICES" },
  // 「最後に」セクションのテキストセグメント
  finallyP1_seg1: {
    ja: "今では自分でブログなども書いて情報発信をしています。ぜひ興味のある方は、",
    en: "I now also write and publish information through my blog and other means. If you are interested, please take a look at ",
  },
  finallyP1_seg2: { ja: " を見てみてください。", en: ". " },
  finallyP1_seg3: {
    ja: " でも同様に配信しています。",
    en: " where I also publish similar content.",
  },
  finallyP2_seg1: {
    ja: "また、上で話した、私が育てたエディターNeovimの設定などのプロジェクト要項は、",
    en: "Also, the project guidelines I talked about above, such as setting up Neovim, the editor I grew up with, can be found at ",
  },
  finallyP2_seg2: { ja: " で確認できます。", en: "." },
  finallyP3_seg1: {
    ja: "私は将来、起業し、独立するつもりです。そのために、現在は、実務から私のプログラミングがどうビジネスに活かされるかを焦点に、インターンを通して、日々励んでいます。<br /><br />しかし、起業のためにはまだまだ経験が乏しいため、他の人のバックアップが必要になります。",
    en: "I plan to start my own business and become independent in the future. To achieve this, I am currently focusing on how my programming can be utilized in business through internships, working hard every day.<br /><br />However, since I still lack experience for starting a business, I need the support of others.",
  },
  finallyP3_seg2: {
    ja: "<br /><br />もし、私の活動に興味を持っていただけたら、ぜひご連絡ください。",
    en: "<br /><br />If you are interested in my activities, please feel free to contact me.",
  },
  finallyP3_seg3: {
    ja: "<br /><br />---<br /><br />近頃、私は、人間力を育むためにも上京予定です。少なくとも私は形から入るタイプなので、まずは東京に出て、様々な人と出会い、協力し合いながら成長していきたいと考えています。",
    en: "<br /><br />---<br /><br />Recently, I am planning to move to Tokyo to cultivate my human skills. At least for me, I tend to start from the form, so I want to go to Tokyo first and grow by meeting various people and collaborating with them.",
  },
};
