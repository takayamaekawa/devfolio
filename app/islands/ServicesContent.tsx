import { usePageLang } from '../hooks/pageLang';
import { translate } from '../utils/i18n';
import type { ProfileSocials } from '../types/profile';
import type { ServiceInfo } from '../types/services';

type ServicesContentProps = {
  profile: {
    social: ProfileSocials;
  };
  services: ServiceInfo;
};

const ServicesContent = ({ profile, services }: ServicesContentProps) => {
  const { lang } = usePageLang();
  const visitText = translate(services.otherSites.visitSite, lang);

  return (
    <section class="mt-12 space-y-12 text-left">
      <article>
        <h2 class="text-2xl font-semibold">{translate(services.techBlog.title, lang)}</h2>
        <p class="mt-2 text-gray-300">
          &emsp;{translate(services.techBlog.description1, lang)}
          <br />
          {translate(services.techBlog.description2, lang)}
        </p>
        <div class="mt-6 flex space-x-4 items-center text-blue-400 leading-none">
          <a href="/blog" rel="noopener noreferrer" target="_blank" class="hover:text-blue-300 text-link">{translate(services.techBlog.readBlog, lang)}</a>
          <span class="text-gray-400 not-italic">{translate(services.techBlog.or, lang)}</span>
          <a href={`${profile.social.qiita.url}/${profile.social.qiita.id}`} rel="noopener noreferrer" target="_blank" class="hover:text-blue-300 text-link">{translate(services.techBlog.readQiita, lang)}</a>
        </div>
      </article>

      <article>
        <h2 class="text-2xl font-semibold">{translate(services.kishax.title, lang)}</h2>
        <p class="mt-2 text-gray-300">
          &emsp;{translate(services.kishax.description1, lang)}
          <br />
          {translate(services.kishax.description2, lang)}
          <br />
          {translate(services.kishax.description3, lang)}
        </p>
        <ul class="mt-2 list-disc list-inside text-gray-400">
          {services.kishax.features.map((feature, index) => (
            <li key={`kishax-feature-${index}`}>{translate(feature, lang)}</li>
          ))}
        </ul>
        <p class="mt-2 text-gray-400">
          {translate(services.kishax.portalSite, lang)}<a href={profile.social.kishax.page.url} class="text-blue-400 underline hover:text-blue-300 text-link" rel="noopener noreferrer" target="_blank">kishax.net</a>
          <br /><br />
          {translate(services.kishax.discordTitle, lang)}<a href={profile.social.kishax.discord.url} class="text-blue-400 underline hover:text-blue-300 text-link" rel="noopener noreferrer" target="_blank">{translate(services.kishax.joinHere, lang)}</a>
        </p>
      </article>
      <article>
        <h2 class="text-2xl font-semibold">{translate(services.otherSites.title, lang)}</h2>
        <p class="mt-2 text-gray-300">
          &emsp;{translate(services.otherSites.description1, lang)}
          <br />
          {translate(services.otherSites.description2, lang)}
        </p>
        <div class="mt-6 flex space-x-4 items-center text-blue-400 leading-none">
        </div>

        {services.otherSites.info.map((site, index) => (
          <li key={`${translate(site.name, lang)}-${index}`} class="mb-3 pb-3 border-b border-gray-700 last:border-b-0 last:pb-0 last:mb-0"> {/* リストアイテム間の区切りと最後の要素の調整 */}
            {/* サイト名と説明の行 */}
            <div class="mb-1">
              <span class="font-semibold text-gray-300">{translate(site.name, lang)}:</span>
              <span class="ml-2 text-gray-400">{translate(site.description, lang)}</span> {/* 説明文の色を少し調整 */}
            </div>
            {/* リンクの行 */}
            <div>
              <a href={site.url} rel="noopener noreferrer" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline text-link">
                {visitText || site.url} {/* visitTextがない場合のフォールバック */}
              </a>
            </div>
          </li>
        ))}
      </article>
    </section >
  );
};

export default ServicesContent;
