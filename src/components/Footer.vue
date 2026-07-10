<template>
  <footer id="footer" class="blur">
    <div class="power">
      <span>
        Copyright&nbsp;&copy;
        {{ fullYear }}
        <a :href="siteUrl">{{ siteAuthor }}</a>
      </span>
      <!-- 站点备案 -->
      <a v-if="siteIcp" href="https://beian.miit.gov.cn" target="_blank">
        &amp;
        {{ siteIcp }}
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { siteConfig } from "@/config/site";
const fullYear = new Date().getFullYear();

const siteIcp = computed(() => siteConfig.icp);
const siteAuthor = computed(() => siteConfig.author);
const siteUrl = computed(() => {
  const url = siteConfig.url;
  if (!url) return siteAuthor.value ? `https://github.com/${siteAuthor.value}` : "/";
  // 判断协议前缀
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "//" + url;
  }
  return url;
});
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  line-height: 46px;
  text-align: center;
  z-index: 0;
  font-size: 14px;
  .power {
    animation: fade 0.3s;
  }
  &.blur {
    backdrop-filter: blur(10px);
    background: rgb(0 0 0 / 25%);
    font-size: 16px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  @media (max-width: 768px) {
    font-size: 0.85rem;
    height: calc(46px + env(safe-area-inset-bottom));
    line-height: 46px;
    padding-bottom: env(safe-area-inset-bottom);

    &.blur {
      font-size: 0.85rem;
    }
  }
  @media (max-width: 480px) {
    .hidden {
      display: none;
    }
  }
}
</style>
