<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <div class="name text-hidden">
        <span class="bg">{{ siteName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 主页站点logo
const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO;
// 站点名称
const siteName = import.meta.env.VITE_SITE_NAME || "Homepage";
</script>

<style lang="scss" scoped>
.message {
  width: 100%;
  max-width: 460px;
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    animation: fade 0.5s;
    .logo-img {
      border-radius: 50%;
      width: 120px;
    }
    .name {
      width: 100%;
      transform: translateY(-8px);
      text-align: center;

      .bg {
        font-size: 5rem;
      }
    }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: 128px;
        .bg {
          font-size: 4.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
  @media (max-width: 390px) {
    .logo {
      flex-direction: column;
      .logo-img {
        display: none;
      }
      .name {
        margin-left: 0;
        height: auto;
        transform: none;
        text-align: center;
        .bg {
          font-size: 3.5rem;
        }
      }
    }
  }
}
</style>
