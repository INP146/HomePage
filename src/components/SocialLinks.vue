<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <a v-for="item in socialLinks" :key="item.name" :href="item.url" target="_blank">
        <img class="icon" :src="item.icon" height="24" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import socialLinksData from "@/assets/socialLinks.json";
import { siteConfig } from "@/config/site";
import type { SocialLink } from "@/types";

const socialLinks = computed(() => [
  {
    name: "Github",
    icon: "/images/icon/github.png",
    url: `https://github.com/${siteConfig.githubUsername}`,
  },
  ...(siteConfig.email
    ? [{ name: "Email", icon: "/images/icon/email.png", url: `mailto:${siteConfig.email}` }]
    : []),
  ...(siteConfig.twitter
    ? [
        {
          name: "Twitter",
          icon: "/images/icon/twitter.png",
          url: `https://twitter.com/${siteConfig.twitter.replace(/^@/, "")}`,
        },
      ]
    : []),
  ...(siteConfig.telegram
    ? [
        {
          name: "Telegram",
          icon: "/images/icon/telegram.png",
          url: `https://t.me/${siteConfig.telegram.replace(/^@/, "")}`,
        },
      ]
    : []),
  ...(siteConfig.qq
    ? [
        {
          name: "QQ",
          icon: "/images/icon/qq.png",
          url: `https://wpa.qq.com/msgrd?v=3&uin=${siteConfig.qq}&site=qq&menu=yes`,
        },
      ]
    : []),
  ...(siteConfig.bilibili
    ? [
        {
          name: "Bilibili",
          icon: "/images/icon/bilibili.png",
          url: `https://space.bilibili.com/${siteConfig.bilibili}`,
        },
      ]
    : []),
  ...(socialLinksData as SocialLink[]).filter(
    (item) =>
      !["github", "email", "twitter", "telegram", "qq", "bilibili"].includes(
        item.name.toLowerCase(),
      ),
  ),
]);
</script>

<style lang="scss" scoped>
.social {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 460px;
  width: 100%;
  height: 42px;
  animation: fade 0.5s;
  @media (max-width: 840px) {
    max-width: 100%;
    justify-content: center;
    .link {
      justify-content: space-evenly !important;
      width: 90%;
    }
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    a {
      display: inherit;
      .icon {
        margin: 0 12px;
        transition: transform 0.3s;
        &:hover {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(1);
        }
      }
    }
  }
}
</style>
