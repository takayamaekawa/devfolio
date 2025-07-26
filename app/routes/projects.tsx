// app/routes/projects.tsx
import { createRoute } from "honox/factory";
import profileData from "../../data/profile.json";
import projectsJson from "../../data/projects.json"; // ★ JSONからプロジェクトデータをインポート
import type { ProjectInfo } from "../types/projects"; // ★ 型をインポート
import ProjectList from "../islands/ProjectList"; // ★ ProjectList Islandをインポート

// 型アサーション
const allProjectsData: ProjectInfo[] = projectsJson.projects as ProjectInfo[];

export default createRoute(async (c) => {
  // profileData全体か、必要な部分だけをProjectListに渡すか検討
  // ProjectItemがprofile.social.github.idを必要とするので、それを渡せるようにする
  const relevantProfileData = {
    social: profileData.social,
    // 他にProjectListやProjectItemが必要とするprofileのフィールドがあれば追加
  };

  return c.render(
    <>
      <ProjectList projects={allProjectsData} profile={relevantProfileData} />
    </>,
  );
});
