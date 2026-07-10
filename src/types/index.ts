export interface ProjectLink {
  icon: string;
  name: string;
  description: string;
  link: string;
}

export interface GithubContribution {
  date: string;
  count: number;
  level: number;
  color?: string;
}

export interface GithubContributionsResponse {
  total: number;
  contributions: GithubContribution[];
}

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
}
