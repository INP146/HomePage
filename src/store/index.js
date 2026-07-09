import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      imgLoadStatus: false, // 壁纸加载状态
      musicIsOk: false, // 音乐是否加载完成
      musicVolume: 0, // 音乐音量;
      backgroundShow: false, // 壁纸展示状态
      mobileOpenState: false, // 移动端开启状态
      playerState: false, // 当前播放状态
      playerTitle: null, // 当前播放歌曲名
      playerArtist: null, // 当前播放歌手名
      playerLrc: "歌词加载中", // 当前播放歌词
    };
  },
  getters: {
    // 获取歌词
    getPlayerLrc(state) {
      return state.playerLrc;
    },
    // 获取歌曲信息
    getPlayerData(state) {
      return {
        name: state.playerTitle,
        artist: state.playerArtist,
      };
    },
  },
  actions: {
    // 更改播放状态
    setPlayerState(value) {
      if (value) {
        this.playerState = false;
      } else {
        this.playerState = true;
      }
    },
    // 更改歌词
    setPlayerLrc(value) {
      this.playerLrc = value;
    },
    // 更改歌曲数据
    setPlayerData(title, artist) {
      this.playerTitle = title;
      this.playerArtist = artist;
    },
    // 更改壁纸加载状态
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
  },
  persist: {
    key: "data",
    storage: window.localStorage,
    paths: ["musicVolume"],
  },
});
