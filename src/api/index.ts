import siteLinks from "@/assets/siteLinks.json";
import socialLinks from "@/assets/socialLinks.json";
import type {
  GithubContribution,
  GithubContributionsResponse,
  ProjectLink,
  SocialLink,
} from "@/types";

interface GithubPinnedRepository {
  author?: string;
  owner?: string;
  name?: string;
  description?: string | null;
  url?: string;
  link?: string;
}

interface GithubContributionsPayload {
  total?: { lastYear?: number };
  contributions?: GithubContribution[];
}

const githubApi = import.meta.env.VITE_GITHUB_API || "https://gh-pinned-repo.inp.la/";
const fallbackUser = import.meta.env.VITE_SITE_AUTHOR || "INP146";

export const getGithubUser = (): string => {
  const githubLink = (socialLinks as SocialLink[]).find(
    (item) => item.name.toLowerCase() === "github",
  );
  const match = githubLink?.url.match(/github\.com\/([^/?#]+)/i);
  return match?.[1] || fallbackUser;
};

const getGithubApiUrl = (
  type: "pinned" | "contributions",
  params: Record<string, string | number> = {},
): string => {
  const url = new URL(githubApi, window.location.origin);
  url.searchParams.set("type", type);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "") url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const fetchJson = async <T>(url: string, timeout = 5000): Promise<T | null> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok ? ((await response.json()) as T) : null;
  } finally {
    clearTimeout(timer);
  }
};

const normalizePinnedRepo = (repo: GithubPinnedRepository): ProjectLink => {
  const author = repo.author || repo.owner || getGithubUser();
  return {
    icon: "Github",
    name: repo.name || "",
    description: repo.description || "",
    link: repo.url || repo.link || `https://github.com/${author}/${repo.name || ""}`,
  };
};

const normalizeProjectLink = (item: Partial<ProjectLink>): ProjectLink => ({
  icon: item.icon || "Github",
  name: item.name || "",
  description: item.description || "",
  link: item.link || "",
});

const mergeProjectLinks = (pinnedRepos: GithubPinnedRepository[]): ProjectLink[] => {
  const result: ProjectLink[] = [];
  const seen = new Set<string>();

  [
    ...pinnedRepos.map(normalizePinnedRepo),
    ...(siteLinks as Partial<ProjectLink>[]).map(normalizeProjectLink),
  ].forEach((item) => {
    if (!item.name || !item.link) return;
    const key = item.link.toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
};

export const getProjectLinks = async (): Promise<ProjectLink[]> => {
  try {
    const data = await fetchJson<GithubPinnedRepository[]>(
      getGithubApiUrl("pinned", { username: getGithubUser(), limit: 6 }),
    );
    return mergeProjectLinks(Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn("GitHub pinned repositories load failed", error);
    return mergeProjectLinks([]);
  }
};

const normalizeContributionsData = (
  data: GithubContributionsPayload | null,
): GithubContributionsResponse => {
  const contributions = Array.isArray(data?.contributions) ? data.contributions : [];
  const total = data?.total?.lastYear ?? contributions.reduce((sum, day) => sum + day.count, 0);
  return { total, contributions };
};

export const getGithubContributions = async (): Promise<GithubContributionsResponse> => {
  try {
    const data = await fetchJson<GithubContributionsPayload>(
      getGithubApiUrl("contributions", { username: getGithubUser() }),
    );
    const result = normalizeContributionsData(data);
    if (result.contributions.length) return result;
  } catch (error) {
    console.warn("GitHub contributions load failed", error);
  }

  try {
    const data = await fetchJson<GithubContributionsPayload>(
      `https://github-contributions-api.jogruber.de/v4/${getGithubUser()}?y=last`,
    );
    return normalizeContributionsData(data);
  } catch (error) {
    console.warn("GitHub fallback contributions load failed", error);
    return { total: 0, contributions: [] };
  }
};
