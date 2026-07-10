declare module "swiper" {
  export interface Swiper {
    activeIndex: number;
    slideTo(index: number): void;
  }

  export const Mousewheel: unknown;
}

declare module "unplugin-vue-components/vite" {
  import type { Plugin } from "vite";

  interface ComponentsOptions {
    resolvers?: unknown[];
  }

  const Components: (options?: ComponentsOptions) => Plugin;
  export default Components;
}

declare module "unplugin-vue-components/resolvers" {
  import type { Resolver } from "unplugin-auto-import/dist/types";

  export const ElementPlusResolver: () => Resolver;
}
