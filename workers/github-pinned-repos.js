const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, status = 200) =>
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
            owner {
              login
            }
            name
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
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
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              color
            }
          }
        }
      }
    }
  }
`;

const contributionLevel = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const normalizeRepo = (repo) => ({
  author: repo.owner?.login || "",
  name: repo.name,
  description: repo.description || "",
  language: repo.primaryLanguage?.name || "",
  languageColor: repo.primaryLanguage?.color || "",
  stars: repo.stargazerCount || 0,
  forks: repo.forkCount || 0,
  url: repo.url,
  homepage: repo.homepageUrl || "",
});

const graphql = async (env, query, variables) => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "github-pinned-repos-worker",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
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

const getDateRange = () => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 365);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const getPinnedRepositories = async (env, username, limit) => {
  const { data, error } = await graphql(env, pinnedQuery, {
    login: username,
    first: limit,
  });
  if (error) return error;

  const repos = data.data?.user?.pinnedItems?.nodes?.filter(Boolean).map(normalizeRepo) || [];
  return json(repos);
};

const getContributions = async (env, username) => {
  const { from, to } = getDateRange();
  const { data, error } = await graphql(env, contributionsQuery, {
    login: username,
    from,
    to,
  });
  if (error) return error;

  const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
  const contributions =
    calendar?.weeks?.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: contributionLevel[day.contributionLevel] || 0,
        color: day.color,
      })),
    ) || [];

  return json({
    total: {
      lastYear: calendar?.totalContributions || 0,
    },
    contributions,
  });
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!env.GITHUB_TOKEN) {
      return json({ error: "Missing GITHUB_TOKEN" }, 500);
    }

    const url = new URL(request.url);
    const username = url.searchParams.get("username") || env.GITHUB_USERNAME;
    const type = url.searchParams.get("type");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 6, 6);

    if (!username) {
      return json({ error: "Missing username" }, 400);
    }

    if (!["pinned", "contributions"].includes(type)) {
      return json({ error: "Missing or invalid type. Use type=pinned or type=contributions" }, 400);
    }

    const cacheKey = new Request(
      `${url.origin}${url.pathname}?type=${type}&username=${username}&limit=${limit}`,
    );
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const result =
      type === "contributions"
        ? await getContributions(env, username)
        : await getPinnedRepositories(env, username, limit);

    if (result.ok) {
      ctx.waitUntil(cache.put(cacheKey, result.clone()));
    }
    return result;
  },
};
