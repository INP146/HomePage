import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      imgLoadStatus: false, // 壁纸加载状态
      githubLoadStatus: false, // Github 数据加载状态
      projectLinks: [], // 项目链接
      githubContributions: [], // Github 贡献数据
      githubContributionsTotal: 0, // Github 贡献总数
      mobileOpenState: false, // 移动端开启状态
    };
  },
  getters: {
    // 页面加载状态
    appLoadStatus(state) {
      return state.imgLoadStatus && state.githubLoadStatus;
    },
  },
  actions: {
    // 更改壁纸加载状态
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
    // 更改 Github 数据加载状态
    setGithubLoadStatus(value) {
      this.githubLoadStatus = value;
    },
    // 更改项目链接
    setProjectLinks(value) {
      this.projectLinks = value;
    },
    // 更改 Github 贡献数据
    setGithubContributions(total, contributions) {
      this.githubContributionsTotal = total;
      this.githubContributions = contributions;
    },
  },
  persist: {
    key: "data",
    storage: window.localStorage,
  },
});
