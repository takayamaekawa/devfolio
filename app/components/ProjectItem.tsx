import type { ProjectInfo } from '../types/projects';
import type { Language } from '../types/common';
import { translate } from '../utils/i18n';
import { projectPageStrings } from '../locales/translations'; // projectPageStringsも必要なら
import { FormattedTextRenderer } from '../utils/textFormatters';

const GetGitUrlComponent = ({ githubId, repo, org }: { githubId: string, repo: string, org?: string }) => {
  const actualGithubId = org || githubId;
  const gitUrl = `https://github.com/${actualGithubId}/${repo}`;
  return <a href={gitUrl} class="text-blue-400 hover:text-blue-300 text-link" target="_blank" rel="noopener noreferrer">{repo}</a>;
};

type ProjectItemProps = ProjectInfo & {
  lang: Language;
  githubId: string;
};

function ProjectItem({
  id, title, description, details, points, statement, githubRepoName, org, liveLink, detailsLinkRepo, lang, githubId
}: ProjectItemProps) {

  // ★ githubId と githubRepoName の両方が存在する場合のみURLを生成
  // orgが指定されている場合はorgを使用、そうでなければgithubIdを使用
  const actualGithubId = org || githubId;
  const githubProjectUrl = (actualGithubId && githubRepoName)
    ? `https://github.com/${actualGithubId}/${githubRepoName}`
    : undefined;

  return (
    <article id={id} class="mt-8 space-y-4 group relative pt-4 border-t border-gray-700 first:border-t-0 first:pt-0">
      <h3 class="text-2xl font-semibold flex items-center">
        <a href={`#${id}`} class="mr-2 text-xl text-gray-500 hover:text-blue-400" aria-label={`Link to ${translate(title, lang)} section`}>
          🔗
        </a>
        <span>{translate(title, lang)}</span>
      </h3>
      <div class="text-gray-300 prose prose-invert prose-sm max-w-none space-y-3"> {/* 親のpタグに space-y-3 を適用 */}
        <p><FormattedTextRenderer text={description} lang={lang} /></p>

        {id === 'kishax' && detailsLinkRepo ? (
          <p>
            {translate(projectPageStrings.kishaxAuthDetailPrefix, lang)}
            <GetGitUrlComponent githubId={githubId} repo={detailsLinkRepo} org={org} />
            {translate(projectPageStrings.kishaxAuthDetailSuffix, lang)}
          </p>
        ) : (
          // detailsが存在し、翻訳後の文字列が空でない場合のみ <p> タグをレンダリング
          details && translate(details, lang).trim() &&
          <p><FormattedTextRenderer text={details} lang={lang} /></p>
        )}
      </div>
      <ul class="mt-2 list-disc list-inside text-gray-400 space-y-1">
        {points.map((point, index) => (
          <li key={`${id}-point-${index}`}>
            <FormattedTextRenderer text={point} lang={lang} />
          </li>
        ))}
      </ul>
      {/* statementが存在し、翻訳後の文字列が空でない場合のみ <p> タグをレンダリング */}
      {statement && translate(statement, lang).trim() && (
        <p class="mt-2 text-gray-400 italic">
          "<FormattedTextRenderer text={statement} lang={lang} />"
        </p>
      )}
      <div class="mt-4 space-x-4">
        {githubProjectUrl && (
          <a
            class="text-blue-400 hover:text-blue-300 text-link"
            href={githubProjectUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(projectPageStrings.viewOnGithub, lang)}
          </a>
        )}
        {liveLink && (
          <a
            class="text-green-400 hover:text-green-300 text-link"
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(projectPageStrings.viewSite || { ja: "サイトを見る", en: "View Site" }, lang)}
          </a>
        )}
      </div>
    </article>
  );
}

export default ProjectItem;
