import { defineStore } from "pinia";
import type { GithubContribution, ProjectLink } from "@/types";

interface MainState {
  imgLoadStatus: boolean;
  githubLoadStatus: boolean;
  projectLinks: ProjectLink[];
  githubContributions: GithubContribution[];
  githubContributionsTotal: number;
  mobileOpenState: boolean;
}

export const mainStore = defineStore("main", {
  state: (): MainState => ({
    imgLoadStatus: false,
    githubLoadStatus: false,
    projectLinks: [],
    githubContributions: [],
    githubContributionsTotal: 0,
    mobileOpenState: false,
  }),
  getters: {
    appLoadStatus: (state) => state.imgLoadStatus && state.githubLoadStatus,
  },
  actions: {
    setImgLoadStatus(value: boolean) {
      this.imgLoadStatus = value;
    },
    setGithubLoadStatus(value: boolean) {
      this.githubLoadStatus = value;
    },
    setProjectLinks(value: ProjectLink[]) {
      this.projectLinks = value;
    },
    setGithubContributions(total: number, contributions: GithubContribution[]) {
      this.githubContributionsTotal = total;
      this.githubContributions = contributions;
    },
  },
  persist: {
    key: "data",
    storage: window.localStorage,
  },
});
