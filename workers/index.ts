import githubApi, { type GithubWorkerEnv } from "./github-api";

interface HomeWorkerEnv extends GithubWorkerEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/github") return githubApi.fetch(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<HomeWorkerEnv>;
