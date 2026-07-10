# HomePage

一个面向开发者的个人主页，基于 Vue 3 构建。页面聚合个人项目、GitHub 贡献热力图和最近公开动态，并提供桌面与移动端布局以及 PWA 支持。

<p><a href="README.md">English</a> | <b>简体中文</b></p>

![主页预览](./screenshots/main.png)

> 本项目基于 [imsyy/home](https://github.com/imsyy/home) 二次开发，已移除音乐播放器、天气、时间胶囊、Hitokoto 和设置面板等原有模块，改为聚焦项目与 GitHub 数据展示。

## 功能

- 随机本地壁纸与加载动画
- 站点名称、社交链接和备案信息配置
- GitHub 置顶仓库与本地项目链接合并展示
- 最近一年 GitHub 贡献热力图
- GitHub 最近公开动态时间线
- 项目分页、鼠标滚动切换和响应式移动端布局
- PWA 离线资源缓存与更新提示

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Swiper](https://swiperjs.com/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Cloudflare Workers](https://workers.cloudflare.com/)（可选，用于 GitHub GraphQL 数据）

## 部署

### 获取 GitHub Token

Worker 使用它请求 GitHub GraphQL 数据，Token 不会暴露给浏览器。

1. 打开 [GitHub Token 设置页](https://github.com/settings/personal-access-tokens/new)。
2. 创建 **fine-grained personal access token**，设置有效期，并将资源所有者选择为自己的账号。
3. 仓库访问范围选择 **Public Repositories (read-only)**。读取公开置顶仓库和贡献数据不需要额外权限。
4. 生成后立即复制 Token；GitHub 不会再次显示完整内容。

### Cloudflare 一体化部署

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/INP146/HomePage)

徽章是一键部署入口：

1. 点击徽章。
2. 登录 Cloudflare，并连接 GitHub 或 GitLab。
3. 按提示填写 Worker 名称、上一步创建的 Token，以及以下公开站点字段：
   - `VITE_GITHUB_USERNAME`
   - `VITE_SITE_AUTHOR`
   - `VITE_SITE_KEYWORDS`
   - `VITE_SITE_URL`
   - `VITE_SITE_ICP`
   - `VITE_SOCIAL_EMAIL`、`VITE_SOCIAL_TWITTER`、`VITE_SOCIAL_TELEGRAM`、`VITE_SOCIAL_QQ`、`VITE_SOCIAL_BILIBILI`
4. 完成部署。

如需从本地仓库部署：

1. 执行 `pnpm install`。
2. 执行 `pnpm exec wrangler secret put GITHUB_TOKEN --config wrangler.jsonc`，并粘贴上一步创建的 Token。
3. 按需修改 `wrangler.jsonc` 中的 Worker 名称，再执行：

   ```bash
   pnpm deploy:cloudflare
   ```

### 单独部署 API Worker

仅在前端需要单独托管时使用此路线。

1. 执行 `pnpm install`。
2. 执行 `pnpm exec wrangler secret put GITHUB_TOKEN --config workers/wrangler.jsonc`，并粘贴上一步创建的 Token。
3. 按需修改 `workers/wrangler.jsonc` 中的 Worker 名称。
4. 部署 API：

   ```bash
   pnpm deploy:api
   ```

5. 将 `.env.example` 复制为 `.env`，填写 `VITE_GITHUB_USERNAME` 和其他站点字段，再将部署得到的 Worker URL 写入 `VITE_GITHUB_API`。
6. 执行 `pnpm build`，再将 `dist/` 上传至静态托管服务。

`.dev.vars` 与 `workers/.dev.vars` 仅用于本地 `wrangler dev` 测试，不要提交它们。

## 本地运行

建议使用 Node.js 18 或更高版本。

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认监听 3000 端口）
pnpm dev

# 生成生产构建
pnpm build

# 本地预览生产构建
pnpm preview
```

构建产物位于 `dist/`，可直接部署到任意静态站点托管服务。

## 配置站点

本地开发或单独托管前端时，先将 `.env.example` 复制为 `.env`。修改后需要重启开发服务器或重新构建。

```dotenv
# 站点基本信息
VITE_SITE_NAME="HomePage"
VITE_SITE_AUTHOR="INP146"
VITE_SITE_KEYWORDS="INP146,INP"
VITE_SITE_URL="inp.la"
VITE_GITHUB_USERNAME="INP146"

# 固定社交链接：邮箱地址、Twitter/Telegram 用户名、QQ 号、Bilibili 用户 ID
VITE_SOCIAL_EMAIL=""
VITE_SOCIAL_TWITTER=""
VITE_SOCIAL_TELEGRAM=""
VITE_SOCIAL_QQ=""
VITE_SOCIAL_BILIBILI=""
VITE_SITE_LOGO="/images/icon/favicon.ico"
VITE_SITE_MAIN_LOGO="/images/icon/logo.png"
VITE_SITE_APPLE_LOGO="/images/icon/apple-touch-icon.png"

# GitHub 数据服务地址；不配置时使用代码中的默认地址
VITE_GITHUB_API="https://gh-api.inp.la/"

# ICP 备案号；留空则不显示
VITE_SITE_ICP=""
```

GitHub 主页、公开动态、贡献图和 GitHub 社交链接均使用 `VITE_GITHUB_USERNAME`。

### 社交链接

GitHub、邮箱、Twitter、Telegram、QQ、Bilibili 链接均会根据上述环境变量自动生成。`src/assets/socialLinks.json` 仅用于添加其他社交链接：

```json
{
  "name": "Github",
  "icon": "/images/icon/github.png",
  "url": "https://github.com/your-account"
}
```

### 项目链接

编辑 `src/assets/siteLinks.json`，可补充或覆盖需要展示的项目。页面会优先请求 GitHub 置顶仓库，再与这里的条目合并，并按链接去重。

```json
{
  "icon": "Github",
  "name": "My Project",
  "description": "A short project description.",
  "link": "https://github.com/your-account/my-project"
}
```

`icon` 可以是 `Github`、`Blog`、`Cloud`、`CompactDisc`、`Compass`、`Book`、`Fire` 或 `LaptopCode`，也可以是图片 URL、`data:` URL 或 `public/` 下的图片路径。

### 壁纸与图标

- 将壁纸放在 `public/images/`，命名为 `background1.jpg` 至 `background4.jpg`；当前组件会在这 4 张图片中随机选择一张。
- 站点图标位于 `public/images/icon/`。修改图标文件或 `.env` 中对应路径即可。

## GitHub 数据

页面中的三类 GitHub 信息使用以下来源：

| 内容       | 来源                             | 说明                                                                         |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------- |
| 置顶仓库   | `VITE_GITHUB_API` 指向的 Worker  | 读取 GitHub GraphQL 的 pinned repositories；服务不可用时仍展示本地项目链接。 |
| 贡献热力图 | Worker，失败时回退到公开贡献 API | 展示过去 365 天贡献；没有数据时显示空日历。                                  |
| 公开动态   | GitHub REST API                  | 直接读取用户最近的公开 events，最多展示 3 条。                               |

## Docker

```bash
# 构建并运行
docker compose up --build -d
```

容器默认暴露 `12445` 端口，访问 `http://localhost:12445`。

也可以直接使用 Docker：

```bash
docker build -t homepage .
docker run --rm -p 12445:12445 homepage
```

## 鸣谢、版权与许可证

本项目基于 [imsyy/home](https://github.com/imsyy/home) 二次开发，感谢原作者 [imsyy](https://github.com/imsyy) 提供的开源项目与设计基础。本仓库不是上游项目的官方版本。

版权归属如下：

```text
Copyright (c) 2022 imsyy              # 上游项目及其保留的原始内容
Copyright (c) 2026 @INP146            # 本仓库的二次开发内容
```

分发本项目或其重要部分时，必须保留上述版权声明及 [MIT License](./LICENSE) 全文。

除另有说明外，本项目及其保留的上游代码均依照 [MIT License](./LICENSE) 发布，并按“原样”提供，不附带任何明示或默示担保。
