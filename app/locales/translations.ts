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
    ja: "私は将来、起業し、独立するつもりです。しかし、経験が乏しいため、他の人のバックアップが必要になります。そのためにも、今後は、創作性と行動力を持って、邁進するつもりです。",
    en: "I intend to start my own business and become independent in the future. However, due to my lack of experience, I will need the backup of others. For this reason, I intend to push forward with creativity and energy.",
  },
};
