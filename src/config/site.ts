import { reactive } from "vue";

interface PublicSiteConfig {
  author?: string;
  bilibili?: string;
  email?: string;
  githubUsername?: string;
  icp?: string;
  keywords?: string;
  qq?: string;
  siteName?: string;
  telegram?: string;
  twitter?: string;
}

const githubApi = import.meta.env.VITE_GITHUB_API || "https://gh-pinned-repo.inp.la/";

export const siteConfig = reactive({
  author: import.meta.env.VITE_SITE_AUTHOR || "INP146",
  bilibili: import.meta.env.VITE_SOCIAL_BILIBILI || "",
  email: import.meta.env.VITE_SOCIAL_EMAIL || "",
  githubUsername:
    import.meta.env.VITE_GITHUB_USERNAME || import.meta.env.VITE_SITE_AUTHOR || "INP146",
  icp: import.meta.env.VITE_SITE_ICP || "",
  keywords: import.meta.env.VITE_SITE_KEYWORDS || "HomePage",
  qq: import.meta.env.VITE_SOCIAL_QQ || "",
  siteName: import.meta.env.VITE_SITE_NAME || "HomePage",
  telegram: import.meta.env.VITE_SOCIAL_TELEGRAM || "",
  twitter: import.meta.env.VITE_SOCIAL_TWITTER || "",
});

const updateDocumentMetadata = (): void => {
  document.title = siteConfig.siteName;
  document.querySelector('meta[name="author"]')?.setAttribute("content", siteConfig.author);
  document.querySelector('meta[name="keywords"]')?.setAttribute("content", siteConfig.keywords);
};

export const loadRuntimeSiteConfig = async (): Promise<void> => {
  if (githubApi !== "/api/github") return;

  try {
    const response = await fetch("/api/config");
    if (!response.ok) return;

    const config = (await response.json()) as PublicSiteConfig;
    if (config.author) siteConfig.author = config.author;
    if (config.bilibili !== undefined) siteConfig.bilibili = config.bilibili;
    if (config.email !== undefined) siteConfig.email = config.email;
    if (config.githubUsername) siteConfig.githubUsername = config.githubUsername;
    if (config.icp !== undefined) siteConfig.icp = config.icp;
    if (config.keywords) siteConfig.keywords = config.keywords;
    if (config.qq !== undefined) siteConfig.qq = config.qq;
    if (config.siteName) siteConfig.siteName = config.siteName;
    if (config.telegram !== undefined) siteConfig.telegram = config.telegram;
    if (config.twitter !== undefined) siteConfig.twitter = config.twitter;
    updateDocumentMetadata();
  } catch (error) {
    console.warn("Runtime site configuration load failed", error);
  }
};
