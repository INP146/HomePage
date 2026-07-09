<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <!-- 网站链接 -->
    <Link />
    <!-- 移动端 Github 热力图 -->
    <GitHubContributions class="mobile-contributions" />
    <!-- Github 动态 -->
    <GitHubActivity />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Link from "@/components/Links.vue";
import GitHubActivity from "@/components/GitHubActivity.vue";
import GitHubContributions from "@/components/GitHubContributions.vue";
const store = mainStore();
</script>

<style lang="scss" scoped>
.right {
  // flex: 1 0 0%;
  width: 50%;
  height: auto;
  margin-left: 0.75rem;
  display: grid;
  grid-template-rows: 330px 260px;
  align-content: start;
  gap: 18px;
  align-items: stretch;

  .mobile-contributions {
    display: none;
  }

  @media (max-width: 768px) {
    height: 100dvh;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-left: 0;
    width: 100%;
    padding:
      calc(58px + env(safe-area-inset-top)) 0.75rem
      calc(160px + env(safe-area-inset-bottom));
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scroll-padding-bottom: calc(160px + env(safe-area-inset-bottom));
    -webkit-overflow-scrolling: touch;

    > * {
      flex: 0 0 auto;
    }

    &.hidden {
      display: none;
    }

    .mobile-contributions {
      display: flex;
    }
  }
}
</style>
