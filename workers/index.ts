import githubApi, { type GithubWorkerEnv } from "./github-api";

interface HomeWorkerEnv extends GithubWorkerEnv {
  ASSETS: Fetcher;
  VITE_SOCIAL_BILIBILI?: string;
  VITE_SOCIAL_EMAIL?: string;
  VITE_SOCIAL_QQ?: string;
  VITE_SOCIAL_TELEGRAM?: string;
  VITE_SOCIAL_TWITTER?: string;
  VITE_GITHUB_USERNAME?: string;
  VITE_SITE_AUTHOR?: string;
  VITE_SITE_ICP?: string;
  VITE_SITE_KEYWORDS?: string;
  VITE_SITE_NAME?: string;
}

const siteConfig = (env: HomeWorkerEnv) => ({
  author: env.VITE_SITE_AUTHOR || "",
  githubUsername: env.VITE_GITHUB_USERNAME || "",
  keywords: env.VITE_SITE_KEYWORDS || "",
  siteName: env.VITE_SITE_NAME || "",
  ...(env.VITE_SITE_ICP ? { icp: env.VITE_SITE_ICP } : {}),
  ...(env.VITE_SOCIAL_BILIBILI ? { bilibili: env.VITE_SOCIAL_BILIBILI } : {}),
  ...(env.VITE_SOCIAL_EMAIL ? { email: env.VITE_SOCIAL_EMAIL } : {}),
  ...(env.VITE_SOCIAL_QQ ? { qq: env.VITE_SOCIAL_QQ } : {}),
  ...(env.VITE_SOCIAL_TELEGRAM ? { telegram: env.VITE_SOCIAL_TELEGRAM } : {}),
  ...(env.VITE_SOCIAL_TWITTER ? { twitter: env.VITE_SOCIAL_TWITTER } : {}),
});

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/github") return githubApi.fetch(request, env, ctx);
    if (url.pathname === "/api/config") {
      return Response.json(siteConfig(env), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<HomeWorkerEnv>;
