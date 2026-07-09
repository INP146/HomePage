import siteLinks from "@/assets/siteLinks.json";
import socialLinks from "@/assets/socialLinks.json";

const githubApi = import.meta.env.VITE_GITHUB_API || "https://gh-pinned-repo.inp.la/";
const fallbackUser = import.meta.env.VITE_SITE_ANTHOR || "INP146";

export const getGithubUser = () => {
  const githubLink = socialLinks.find((item) => item.name?.toLowerCase() === "github");
  const match = githubLink?.url?.match(/github\.com\/([^/?#]+)/i);
  return match?.[1] || fallbackUser;
};

const getGithubApiUrl = (type, params = {}) => {
  const url = new URL(githubApi, window.location.origin);
  url.searchParams.set("type", type);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const fetchJson = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const normalizePinnedRepo = (repo) => {
  const author = repo.author || repo.owner || getGithubUser();
  return {
    icon: "Github",
    name: repo.name,
    description: repo.description || "",
    link: repo.url || repo.link || `https://github.com/${author}/${repo.name}`,
  };
};

const normalizeProjectLink = (item) => ({
  icon: item.icon || "Github",
  name: item.name,
  description: item.description || "",
  link: item.link || item.url || "",
});

const mergeProjectLinks = (pinnedRepos) => {
  const result = [];
  const seen = new Set();

  [...pinnedRepos.map(normalizePinnedRepo), ...siteLinks.map(normalizeProjectLink)].forEach(
    (item) => {
      if (!item.name || !item.link) return;
      const key = (item.link || item.name).toLowerCase().replace(/\/$/, "");
      if (seen.has(key)) return;
      seen.add(key);
      result.push(item);
    },
  );

  return result;
};

export const getProjectLinks = async () => {
  try {
    const data = await fetchJson(
      getGithubApiUrl("pinned", {
        username: getGithubUser(),
        limit: 6,
      }),
    );

    return mergeProjectLinks(Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn("GitHub pinned repositories load failed", error);
    return mergeProjectLinks([]);
  }
};

const normalizeContributionsData = (data) => {
  const contributions = Array.isArray(data?.contributions) ? data.contributions : [];
  const total =
    data?.total?.lastYear ?? contributions.reduce((sum, day) => sum + (day.count || 0), 0);

  return {
    total,
    contributions,
  };
};

export const getGithubContributions = async () => {
  try {
    const data = await fetchJson(
      getGithubApiUrl("contributions", {
        username: getGithubUser(),
      }),
    );

    const result = normalizeContributionsData(data);
    if (result.contributions.length) return result;
  } catch (error) {
    console.warn("GitHub contributions load failed", error);
  }

  try {
    const data = await fetchJson(
      `https://github-contributions-api.jogruber.de/v4/${getGithubUser()}?y=last`,
    );
    return normalizeContributionsData(data);
  } catch (error) {
    console.warn("GitHub fallback contributions load failed", error);
    return {
      total: 0,
      contributions: [],
    };
  }
};
