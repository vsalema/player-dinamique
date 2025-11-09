# m3u8-deploy-ready

This repo is prepared to run headless Puppeteer on a hosted service (Fly.io, Railway, etc.) so you don't need to run locally.

## Key points
- Dockerfile uses `buildkite/puppeteer:latest` which bundles Chromium and required deps.
- Exposes port 3000; server serves `index.html` at repo root and SSE at `/events`.

## Deploy to Fly.io (recommended)
1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Login: `flyctl auth login`
3. Create app: `flyctl launch --name your-app-name --dockerfile Dockerfile`
4. Deploy: `flyctl deploy`
Set `DEFAULT_TARGET` in fly's config if you want a different default.

Docs: https://fly.io/docs/

## Deploy to Railway
1. Create a new project from GitHub repo on Railway.
2. Railway will detect Dockerfile and build.
3. If Chromium fails, ensure the Dockerfile is used (not node buildpack).

## Notes
Some hosts (Vercel, GitHub Pages) are static or serverless and cannot run a persistent Chromium instance.
Use a container-capable host (Fly.io, Railway, Render, DigitalOcean App Platform, Fly, etc.).
