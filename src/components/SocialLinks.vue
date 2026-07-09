<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <a
        v-for="item in socialLinks"
        :key="item.name"
        :href="item.url"
        target="_blank"
      >
        <img class="icon" :src="item.icon" height="24" />
      </a>
    </div>
  </div>
</template>

<script setup>
import socialLinks from "@/assets/socialLinks.json";
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
