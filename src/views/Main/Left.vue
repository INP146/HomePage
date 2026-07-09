<template>
  <div :class="store.mobileOpenState ? 'left hidden' : 'left'">
    <div class="profile-block">
      <Message />
      <SocialLinks />
    </div>
    <GitHubContributions class="desktop-contributions" />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Message from "@/components/Message.vue";
import SocialLinks from "@/components/SocialLinks.vue";
import GitHubContributions from "@/components/GitHubContributions.vue";
const store = mainStore();
</script>

<style lang="scss" scoped>
.left {
  // flex: 1 0 0%;
  width: 50%;
  height: auto;
  margin-right: 10px;
  display: grid;
  grid-template-rows: 330px 260px;
  align-content: start;
  gap: 18px;
  align-items: stretch;

  .profile-block {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &.hidden {
    display: none;
  }
  @media (max-width: 768px) {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-right: 0;
    width: 100%;
    justify-content: center;

    .profile-block {
      min-height: auto;
    }

    .desktop-contributions {
      display: none;
    }
  }
}
</style>
