// app/routes/projects/[id].tsx
import { createRoute } from "honox/factory";
import profileData from "../../../data/profile.json"; // profileDataにリネーム (profile との混同を避けるため)
import type { ProjectInfo } from "../../types/projects";
import projectsDataJson from "../../../data/projects.json";
import type { Language, LocalizedString } from "../../types/common"; // Language型をインポート

// projectsDataJson.projects が ProjectInfo[] 型であることを明示
const allProjectsData: ProjectInfo[] =
  projectsDataJson.projects as ProjectInfo[];

// IDでプロジェクトを検索 (generateId は不要、p.id を使用)
const getProjectById = (id: string): ProjectInfo | undefined => {
  return allProjectsData.find((p) => p.id === id); // ★ p.title から p.id に変更
};

// OG description 用のテキスト取得関数を修正
const getOgDescription = (
  desc: LocalizedString,
  lang: Language = "ja",
): string => {
  const descriptionString =
    desc[lang] || desc.ja || desc.en || "プロジェクトの詳細情報です。";
  return (
    descriptionString.substring(0, 150) +
    (descriptionString.length > 150 ? "..." : "")
  );
};

export default createRoute(async (c) => {
  const id = c.req.param("id");
  const project = getProjectById(id);

  if (!project) {
    return c.notFound();
  }

  // SSR時のメタタグやタイトルに使用する言語（デフォルトは 'ja'）
  // 将来的にはリクエストヘッダー等から適切な言語を判定するロジックも入れられる
  const ssrLang: Language = "ja"; // ここでは 'ja' をデフォルトとする

  const projectUrl = `${profileData.og.url}/projects/${project.id}`; // ★ project.id を使用

  // リダイレクト先のURLを生成 (プロジェクト一覧ページの該当箇所へ)
  const projectsPageBaseUrl = new URL("/projects", profileData.og.url);
  projectsPageBaseUrl.hash = project.id; // ハッシュにはプロジェクトIDを設定
  const redirectUrl = projectsPageBaseUrl.toString();

  // ページタイトルとメタタグを設定
  c.set(
    "pageTitle",
    `${profileData.name} - Project: ${project.title[ssrLang] || project.title.ja}`,
  );
  c.set("metaTags", [
    {
      property: "og:title",
      content: project.title[ssrLang] || project.title.ja,
    },
    {
      property: "og:description",
      content: getOgDescription(project.description, ssrLang),
    },
    { property: "og:url", content: projectUrl },
    { property: "og:type", content: "article" },
    { property: "og:image", content: profileData.og.image },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: project.title[ssrLang] || project.title.ja,
    },
    {
      name: "twitter:description",
      content: getOgDescription(project.description, ssrLang),
    },
    { name: "twitter:image", content: profileData.og.image },
  ]);

  // プロジェクト詳細ページではなく、プロジェクト一覧の該当箇所にリダイレクトする
  // もし詳細ページを別途作りたい場合は、このリダイレクトロジックは不要
  return c.render(
    <>
      {/* project.title も翻訳が必要な場合は、このページもIsland化するか、サーバーサイドで言語を決定して渡す */}
      <h1 class="text-3xl font-bold">
        {project.title[ssrLang] || project.title.ja}
      </h1>
      <p class="mt-4">プロジェクト一覧の該当箇所へリダイレクトします...</p>
      <p class="mt-8">
        <a href={redirectUrl} class="text-blue-400 text-link">
          リダイレクトされない場合はこちらをクリック
        </a>
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          if (window.location.hash !== '#${project.id}') { // 現在地が目的のハッシュでなければリダイレクト
            window.location.replace('${redirectUrl}');
          }
        `,
        }}
      />
    </>,
  );
});
