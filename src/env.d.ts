/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_API?: string;
  readonly VITE_SITE_AUTHOR?: string;
  readonly VITE_SITE_ICP?: string;
  readonly VITE_SITE_MAIN_LOGO?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
