<template>
  <!-- 功能区域 -->
  <div class="function">
    <GitHubContributions />
  </div>
</template>

<script setup>
import GitHubContributions from "@/components/GitHubContributions.vue";
</script>

<style lang="scss" scoped>
.function {
  height: auto;
  display: flex;
  align-items: stretch;

  > * {
    min-width: 0;
    flex: 1 1 0;
  }
}
</style>
