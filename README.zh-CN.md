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

项目直接读取根目录的 `.env`。修改后需要重启开发服务器或重新构建。

```dotenv
# 站点基本信息
VITE_SITE_NAME="Home"
VITE_SITE_AUTHOR="INP146"
VITE_SITE_KEYWORDS="INP146,INP"
VITE_SITE_URL="inp.la"
VITE_SITE_LOGO="/images/icon/favicon.ico"
VITE_SITE_MAIN_LOGO="/images/icon/logo.png"
VITE_SITE_APPLE_LOGO="/images/icon/apple-touch-icon.png"

# GitHub 数据服务地址；不配置时使用代码中的默认地址
VITE_GITHUB_API="https://gh-api.inp.la/"

# ICP 备案号；留空则不显示
VITE_SITE_ICP=""
```

GitHub 用户名优先从 `src/assets/socialLinks.json` 中名称为 `Github` 的链接解析；未配置时回退到 `VITE_SITE_AUTHOR`。

### 社交链接

编辑 `src/assets/socialLinks.json`。每一项包含显示名称、图标路径和跳转地址：

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

仓库提供 Worker 源码：`workers/github-pinned-repos.js`。它接受 `type=pinned` 或 `type=contributions`、`username` 和可选的 `limit` 参数，并需要以下环境变量：

```text
GITHUB_TOKEN=GitHub personal access token
GITHUB_USERNAME=default GitHub username
```

将 Worker 部署到 Cloudflare 后，把其公开 URL 写入 `VITE_GITHUB_API`。浏览器端不应配置或暴露 `GITHUB_TOKEN`。GitHub 公开动态和公开贡献回退源可能受 API 可用性、网络和速率限制影响。

## Docker

```bash
# 构建并运行
docker compose up --build -d
```

容器默认暴露 `12445` 端口，访问 `http://localhost:12445`。

也可以直接使用 Docker：

```bash
docker build -t home .
docker run --rm -p 12445:12445 home
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
