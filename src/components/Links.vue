<template>
  <div v-if="projectLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">PROJECTS</span>
    </div>
    <!-- 网站列表 -->
    <Swiper
      v-if="projectLinks[0]"
      :modules="[Pagination, Mousewheel]"
      :slides-per-view="1"
      :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }"
      :mousewheel="true"
    >
      <SwiperSlide v-for="site in siteLinksList" :key="site">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :span="12" :key="item">
            <div
              class="item cards"
              :style="index < 2 ? 'margin-bottom: 20px' : null"
              @click="jumpLink(item)"
            >
              <img
                v-if="isImageIcon(item.icon)"
                class="site-icon"
                :src="formatImageIcon(item.icon)"
                :alt="item.name"
              />
              <Icon v-else class="site-icon" size="26">
                <component :is="getSiteIcon(item.icon)" />
              </Icon>
              <div class="project-copy">
                <span class="name text-hidden" :title="item.name">{{ item.name }}</span>
                <span v-if="item.description" class="description" :title="item.description">
                  {{ item.description }}
                </span>
              </div>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import {
  Link,
  Github,
  Blog,
  CompactDisc,
  Cloud,
  Compass,
  Book,
  Fire,
  LaptopCode,
} from "@vicons/fa"; // 注意使用正确的类别
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper";
import { mainStore } from "@/store";

const store = mainStore();
const projectLinks = computed(() => store.projectLinks);

// 计算网站链接
const siteLinksList = computed(() => {
  const result = [];
  for (let i = 0; i < projectLinks.value.length; i += 4) {
    const subArr = projectLinks.value.slice(i, i + 4);
    result.push(subArr);
  }
  return result;
});

// 网站链接图标
const siteIcon = {
  Github,
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};

const imageIconPattern =
  /^(https?:)?\/\/|^(data|blob):|^\.{0,2}\/|^\w+\/|.*\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i;

const isImageIcon = (icon) => {
  return typeof icon === "string" && imageIconPattern.test(icon);
};

const formatImageIcon = (icon) => {
  if (/^(https?:)?\/\/|^(data|blob):|^\.{0,2}\//i.test(icon)) return icon;
  return icon.startsWith("/") ? icon : `/${icon}`;
};

const getSiteIcon = (icon) => {
  return siteIcon[icon] || Github;
};

// 链接跳转
const jumpLink = (data) => {
  window.open(data.link, "_blank");
};
</script>

<style lang="scss" scoped>
.links {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .line {
    margin: 0 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: fade 0.5s;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      position: static;
      margin-top: 4px;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 18px;
        height: 4px;
        border-radius: 4px;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: flex-start;
      gap: 10px;
      padding: 0 12px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
      }

      .project-copy {
        min-width: 0;
        flex: 1 1 auto;
        text-align: left;
      }
      .name {
        display: block;
        width: 100%;
        font-size: 1.1rem;
        line-height: 1.25;
      }
      .description {
        display: -webkit-box;
        margin-top: 4px;
        color: #ffffffb3;
        font-size: 0.78rem;
        line-height: 1.25;
        overflow: hidden;
        word-break: break-word;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .site-icon {
        width: 26px;
        height: 26px;
        object-fit: contain;
        flex: 0 0 26px;
      }
      @media (min-width: 769px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 768px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 6px;
        .name {
          font-size: 1rem;
        }
        .description {
          font-size: 0.72rem;
        }
      }
    }
    @media (max-width: 768px) {
      height: 180px;
    }
  }

  @media (max-width: 768px) {
    height: auto;
    flex: 0 0 auto;
  }
}
</style>
