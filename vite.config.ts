import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
        dts: "src/auto-imports.d.ts",
      }),
      Components({ resolvers: [ElementPlusResolver()] }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/,
              handler: "CacheFirst",
              options: { cacheName: "js-css-cache" },
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
              handler: "CacheFirst",
              options: { cacheName: "image-cache" },
            },
          ],
        },
        manifest: {
          name: env.VITE_SITE_NAME,
          short_name: env.VITE_SITE_NAME,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [48, 72, 96, 128, 144, 192, 512].map((size) => ({
            src: `/images/icon/${size}.png`,
            sizes: `${size}x${size}`,
            type: "image/png",
          })),
        },
      }),
      viteCompression(),
    ],
    server: { port: 3000, open: true },
    resolve: { alias: [{ find: "@", replacement: resolve(process.cwd(), "src") }] },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          quietDeps: true,
          silenceDeprecations: ["legacy-js-api"],
          additionalData: (source: string, filename: string) =>
            filename.includes("node_modules") ? source : `@use "./src/style/global.scss" as *;\n${source}`,
        },
      },
    },
    build: { minify: "terser", terserOptions: { compress: { pure_funcs: ["console.log"] } } },
  };
});
