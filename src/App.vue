<template>
  <!-- 加载 -->
  <Loading />
  <!-- 壁纸 -->
  <Background />
  <!-- 主界面 -->
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.appLoadStatus">
      <div class="container">
        <section class="all">
          <MainLeft />
          <MainRight />
        </section>
      </div>
      <!-- 移动端菜单按钮 -->
      <Icon class="menu" size="24" @click="store.mobileOpenState = !store.mobileOpenState">
        <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
      </Icon>
      <!-- 页脚 -->
      <Transition name="fade" mode="out-in">
        <Footer />
      </Transition>
    </main>
  </Transition>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { getGithubContributions, getProjectLinks } from "@/api";
import { Icon } from "@vicons/utils";
import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import cursorInit from "@/utils/cursor";
import config from "@/../package.json";

const store = mainStore();

const initProjectLinks = async () => {
  const [links, contributions] = await Promise.all([getProjectLinks(), getGithubContributions()]);
  store.setProjectLinks(links);
  store.setGithubContributions(contributions.total, contributions.contributions);
  store.setGithubLoadStatus(true);
};

initProjectLinks();

// 页面宽度
const getWidth = () => {
  if (window.innerWidth > 768) {
    store.mobileOpenState = false;
  }
};

onMounted(() => {
  // 自定义鼠标
  cursorInit();

  // 屏蔽右键
  document.oncontextmenu = () => {
    ElMessage({
      message: "Right-click is disabled for a better browsing experience.",
      grouping: true,
      duration: 2000,
    });
    return false;
  };

  // 监听当前页面宽度
  getWidth();
  window.addEventListener("resize", getWidth);

  // 控制台输出
  const styleTitle1 = "font-size: 20px;font-weight: 600;color: rgb(244,167,89);";
  const styleTitle2 = "font-size:12px;color: rgb(244,167,89);";
  const styleContent = "color: rgb(30,152,255);";
  const title1 = "HomePage";
  const title2 = `
 ___ _   _ ____
|_ _| \\ | |  _ \\
 | ||  \\| | |_) |
 | || |\\  |  __/
|___|_| \\_|_|`;
  const content = `\n\nVersion: ${config.version}\nHomepage: ${config.homepage}\nGithub: ${config.github}`;
  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
});
</script>

<style lang="scss" scoped>
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 0.5s;
  .container {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    @media (max-width: 1200px) {
      padding: 0 2vw;
    }

    @media (max-width: 768px) {
      overflow-x: hidden;

      .all {
        height: 100%;
        min-height: 100%;
        padding: 0 0.75rem;
        align-items: center;
      }
    }
  }
  .menu {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: calc(62px + env(safe-area-inset-bottom));
    left: calc(50% - 28px);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    .i-icon {
      transform: translateY(2px);
    }
    @media (min-width: 769px) {
      display: none;
    }
  }
}
</style>
