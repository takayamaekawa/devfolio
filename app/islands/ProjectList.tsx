import { usePageLang } from "../hooks/pageLang";
import type { ProjectInfo } from "../types/projects";
import ProjectItem from "../components/ProjectItem"; // ★コンポーネントをインポート
import type { ProfileData } from "../types/profile"; // RootLayoutIslandからprofileの型を借用 (または共通型へ)
import { translate } from "../utils/i18n";
import { generalMessages } from "../locales/translations";

type ProjectListProps = {
  projects: ProjectInfo[];
  profile: Pick<ProfileData, "social">; // GitHub IDを含むsocial情報が必要
};

const ProjectList = ({ projects, profile }: ProjectListProps) => {
  const { lang } = usePageLang();
  // console.log('[ProjectList Island] Rendered. Current lang:', lang);

  // profile.social.github.id が存在するか確認
  const githubId = profile?.social?.github?.id;
  if (!githubId) {
    console.warn("GitHub ID not found in profile prop for ProjectList");
    // GitHub ID がない場合のフォールバック処理 (例: リンクを表示しないなど)
  }
  const githubProfileUrl = profile?.social?.github?.url;

  return (
    <>
      <section class="mt-8 space-y-10">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            {...project}
            lang={lang}
            githubId={githubId || ""} // githubIdがない場合は空文字を渡す
          />
        ))}
      </section>
      {githubProfileUrl && githubId && (
        <p class="mt-12 text-center text-gray-400">
          <span
            dangerouslySetInnerHTML={{
              __html: translate(generalMessages.moreInfoCheck, lang).replace(
                "{githubProfileLink}",
                `<a href="${githubProfileUrl}" class="text-blue-400 hover:text-blue-300 text-link" target="_blank" rel="noopener noreferrer">github-${githubId}</a>`,
              ),
            }}
          ></span>
        </p>
      )}
    </>
  );
};

export default ProjectList;
