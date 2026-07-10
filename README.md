# HomePage

A developer-focused personal homepage built with Vue 3. It brings together projects, a GitHub contribution graph, and recent public GitHub activity in a responsive, PWA-enabled interface.

<p><b>English</b> | <a href="README.zh-CN.md">简体中文</a></p>

![Home preview](./screenshots/main.png)

> This is a secondary development of [imsyy/home](https://github.com/imsyy/home). The music player, weather, time capsule, Hitokoto, and settings modules from the upstream project have been removed in favor of project and GitHub data presentation.

## Features

- Random local wallpapers and a loading animation
- Configurable site identity, social links, and ICP registration
- Combined GitHub pinned repositories and local project links
- GitHub contribution graph for the last year
- Recent public GitHub activity timeline
- Paginated project cards, mouse-wheel navigation, and responsive mobile layouts
- PWA asset caching and update notifications

## Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Swiper](https://swiperjs.com/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Cloudflare Workers](https://workers.cloudflare.com/) (optional, for GitHub GraphQL data)

## Deployment

### Create a GitHub Token

The Worker uses this token to request GitHub GraphQL data; it is never exposed to the browser.

1. Open [GitHub token settings](https://github.com/settings/personal-access-tokens/new).
2. Create a **fine-grained personal access token**, choose an expiration date, and set the resource owner to your account.
3. Select **Public Repositories (read-only)**. No additional permissions are required for public pinned repositories and contribution data.
4. Generate and copy the token immediately. GitHub will not show it again.

### Deploy a Full Cloudflare Worker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/INP146/HomePage)

The button is the shortest route:

1. Click the button.
2. Sign in to Cloudflare and connect GitHub or GitLab.
3. Fill in the Worker name, the token created above, and these public site fields:
   - `VITE_GITHUB_USERNAME`
   - `VITE_SITE_AUTHOR`
   - `VITE_SITE_KEYWORDS`
   - `VITE_SITE_ICP`
   - `VITE_SOCIAL_EMAIL`, `VITE_SOCIAL_TWITTER`, `VITE_SOCIAL_TELEGRAM`, `VITE_SOCIAL_QQ`, `VITE_SOCIAL_BILIBILI`
4. Deploy.

To deploy from your local checkout instead:

1. Install dependencies with `pnpm install`.
2. Run `pnpm exec wrangler secret put GITHUB_TOKEN --config wrangler.jsonc` and paste the token created above.
3. Change the Worker name in `wrangler.jsonc` if needed, then run:

   ```bash
   pnpm deploy:cloudflare
   ```

### Deploy a Separate API Worker

Use this only when the frontend is hosted separately.

1. Install dependencies with `pnpm install`.
2. Run `pnpm exec wrangler secret put GITHUB_TOKEN --config workers/wrangler.jsonc` and paste the token created above.
3. Change the Worker name in `workers/wrangler.jsonc` if needed.
4. Deploy the API:

   ```bash
   pnpm deploy:api
   ```

5. Copy `.env.example` to `.env`, set `VITE_GITHUB_USERNAME` and the other site fields, then set `VITE_GITHUB_API` to the deployed Worker URL.
6. Run `pnpm build` and upload `dist/` to your static host.

Use `.dev.vars` and `workers/.dev.vars` only for local `wrangler dev` testing. Do not commit them.

## Run Locally

Node.js 18 or later is recommended.

```bash
# Install dependencies
pnpm install

# Start the development server (port 3000 by default)
pnpm dev

# Create a production build
pnpm build

# Preview the production build
pnpm preview
```

The static output is written to `dist/` and can be deployed to any static hosting provider.

## Configure the Site

For local development or a separately hosted frontend, copy `.env.example` to `.env`. Restart the development server or rebuild after changing it.

```dotenv
# Site information
VITE_SITE_NAME="HomePage"
VITE_SITE_AUTHOR="INP146"
VITE_SITE_KEYWORDS="INP146,INP"
VITE_GITHUB_USERNAME="INP146"

# Core social links: email address, Twitter/Telegram usernames, QQ number, and Bilibili user ID
VITE_SOCIAL_EMAIL=""
VITE_SOCIAL_TWITTER=""
VITE_SOCIAL_TELEGRAM=""
VITE_SOCIAL_QQ=""
VITE_SOCIAL_BILIBILI=""
VITE_SITE_LOGO="/images/icon/favicon.ico"
VITE_SITE_MAIN_LOGO="/images/icon/logo.png"
VITE_SITE_APPLE_LOGO="/images/icon/apple-touch-icon.png"

# GitHub data API; the code has a default when it is omitted
VITE_GITHUB_API="https://gh-api.inp.la/"

# ICP registration; leave empty to hide it
VITE_SITE_ICP=""
```

GitHub profile, activity, contributions, and the GitHub social link all use `VITE_GITHUB_USERNAME`.

### Social Links

GitHub, Email, Twitter, Telegram, QQ, and Bilibili links are generated from the environment variables above. Use `src/assets/socialLinks.json` only for additional social links:

```json
{
  "name": "Github",
  "icon": "/images/icon/github.png",
  "url": "https://github.com/your-account"
}
```

### Project Links

Edit `src/assets/siteLinks.json` to add projects. The page fetches GitHub pinned repositories first, then merges and de-duplicates these local entries by link.

```json
{
  "icon": "Github",
  "name": "My Project",
  "description": "A short project description.",
  "link": "https://github.com/your-account/my-project"
}
```

`icon` may be one of `Github`, `Blog`, `Cloud`, `CompactDisc`, `Compass`, `Book`, `Fire`, or `LaptopCode`. It can also be an image URL, a `data:` URL, or an image path under `public/`.

### Wallpapers and Icons

- Put wallpapers in `public/images/` as `background1.jpg` through `background4.jpg`; the current component selects one at random.
- Site icons live in `public/images/icon/`. Replace the files or update the paths in `.env`.

## GitHub Data

The page uses the following sources:

| Content             | Source                                          | Notes                                                                                                          |
| ------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Pinned repositories | Worker at `VITE_GITHUB_API`                     | Reads GitHub GraphQL pinned repositories. Local project links remain available when the Worker is unavailable. |
| Contribution graph  | Worker, then a public contribution API fallback | Shows the past 365 days; an empty calendar is shown when no data is available.                                 |
| Public activity     | GitHub REST API                                 | Fetches recent public events directly and displays up to three.                                                |

## Docker

```bash
# Build and run
docker compose up --build -d
```

The container listens on port `12445`: `http://localhost:12445`.

Or use Docker directly:

```bash
docker build -t homepage .
docker run --rm -p 12445:12445 homepage
```

## Acknowledgements, Copyright, and License

This project is a secondary development of [imsyy/home](https://github.com/imsyy/home). Thanks to the original author, [imsyy](https://github.com/imsyy), for the open-source project and design foundation. This repository is not an official upstream release.

Copyright ownership is declared as follows:

```text
Copyright (c) 2022 imsyy              # Upstream project and retained original content
Copyright (c) 2026 @INP146            # Secondary development in this repository
```

Redistributions of this project or substantial portions of it must retain both copyright notices and the full [MIT License](./LICENSE).

Unless otherwise noted, this project and the retained upstream code are released under the [MIT License](./LICENSE), and are provided "as is" without warranty of any kind.
