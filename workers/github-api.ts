export interface GithubWorkerEnv {
  GITHUB_TOKEN: string;
  GITHUB_USERNAME?: string;
}

interface RepositoryNode {
  owner?: { login?: string };
  name?: string;
  description?: string | null;
  url?: string;
  homepageUrl?: string | null;
  stargazerCount?: number;
  forkCount?: number;
  primaryLanguage?: { name?: string; color?: string } | null;
}

interface PinnedRepositoriesData {
  user?: { pinnedItems?: { nodes?: Array<RepositoryNode | null> } };
}

const contributionLevel = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: keyof typeof contributionLevel;
  color: string;
}

interface ContributionsData {
  user?: {
    contributionsCollection?: {
      contributionCalendar?: {
        totalContributions?: number;
        weeks?: Array<{ contributionDays: ContributionDay[] }>;
      };
    };
  };
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: unknown[];
  message?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control":
        status === 200 ? "public, max-age=600, stale-while-revalidate=3600" : "no-store",
    },
  });

const pinnedQuery = `
  query PinnedRepositories($login: String!, $first: Int!) {
    user(login: $login) {
      pinnedItems(first: $first, types: REPOSITORY) {
        nodes {
          ... on Repository {
            owner { login }
            name
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            primaryLanguage { name color }
          }
        }
      }
    }
  }
`;

const contributionsQuery = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel color } }
        }
      }
    }
  }
`;

const normalizeRepo = (repo: RepositoryNode) => ({
  author: repo.owner?.login || "",
  name: repo.name || "",
  description: repo.description || "",
  language: repo.primaryLanguage?.name || "",
  languageColor: repo.primaryLanguage?.color || "",
  stars: repo.stargazerCount || 0,
  forks: repo.forkCount || 0,
  url: repo.url || "",
  homepage: repo.homepageUrl || "",
});

const graphql = async <T>(
  env: GithubWorkerEnv,
  query: string,
  variables: Record<string, string | number>,
): Promise<{ data: GraphqlResponse<T> } | { error: Response }> => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "homepage-github-api-worker",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok || data.errors?.length) {
    return {
      error: json(
        {
          error: "GitHub GraphQL request failed",
          details: data.errors || data.message || response.statusText,
        },
        response.ok ? 502 : response.status,
      ),
    };
  }

  return { data };
};

const getDateRange = (): { from: string; to: string } => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 365);
  return { from: from.toISOString(), to: to.toISOString() };
};

const getPinnedRepositories = async (
  env: GithubWorkerEnv,
  username: string,
  limit: number,
): Promise<Response> => {
  const result = await graphql<PinnedRepositoriesData>(env, pinnedQuery, {
    login: username,
    first: limit,
  });
  if ("error" in result) return result.error;

  const repos =
    result.data.data?.user?.pinnedItems?.nodes
      ?.filter((repo): repo is RepositoryNode => Boolean(repo))
      .map(normalizeRepo) || [];
  return json(repos);
};

const getContributions = async (env: GithubWorkerEnv, username: string): Promise<Response> => {
  const { from, to } = getDateRange();
  const result = await graphql<ContributionsData>(env, contributionsQuery, {
    login: username,
    from,
    to,
  });
  if ("error" in result) return result.error;

  const calendar = result.data.data?.user?.contributionsCollection?.contributionCalendar;
  const contributions =
    calendar?.weeks?.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: contributionLevel[day.contributionLevel],
        color: day.color,
      })),
    ) || [];

  return json({ total: { lastYear: calendar?.totalContributions || 0 }, contributions });
};

const githubApi = {
  async fetch(request: Request, env: GithubWorkerEnv, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    if (!env.GITHUB_TOKEN) return json({ error: "Missing GITHUB_TOKEN" }, 500);

    const url = new URL(request.url);
    const username = url.searchParams.get("username") || env.GITHUB_USERNAME;
    const type = url.searchParams.get("type");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 6, 1), 6);

    if (!username) return json({ error: "Missing username" }, 400);
    if (type !== "pinned" && type !== "contributions") {
      return json({ error: "Missing or invalid type. Use type=pinned or type=contributions" }, 400);
    }

    const cacheKey = new Request(
      `${url.origin}${url.pathname}?type=${type}&username=${username}&limit=${limit}`,
    );
    const cache = (caches as unknown as { default: Cache }).default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const result =
      type === "contributions"
        ? await getContributions(env, username)
        : await getPinnedRepositories(env, username, limit);
    if (result.ok) ctx.waitUntil(cache.put(cacheKey, result.clone()));
    return result;
  },
} satisfies ExportedHandler<GithubWorkerEnv>;

export default githubApi;
