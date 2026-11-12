---
description: Rules for building and deploying Vite SPAs under subpaths alongside Next.js on Firebase Hosting
globs: ["admin-portal/**", "disney-plus-main/**", "firebase.json"]
---

# Vite SPA & Firebase Static Deployment Invariants

## 1. Subpath Asset Directory Preservation
When building a Vite app with `base: '/<subpath>/'` (e.g. `/admin/`):
- Vite references assets at `/<subpath>/assets/index-[hash].js`.
- During packaging into the static export root (`out/`), **always** ensure the nested assets folder is created and populated:
  - Copy `admin-portal/dist/*` to `out/<subpath>/`
  - Copy `admin-portal/dist/assets/*` to `out/<subpath>/assets/`
  - Copy `admin-portal/dist/assets/*` to `out/assets/` as fallback
- Never rely on a flattened copy without the `<subpath>/assets/` directory.

## 2. Catch-all Rewrite Verification
- Catch-all rewrites in `firebase.json` (`/admin/** -> /admin/index.html`) must only catch non-asset routes.
- Pre-flight check: Before declaring deployment complete, run a curl / Invoke-WebRequest against the deployed asset URL (e.g., `/admin/assets/index-*.js`) and verify it returns valid JavaScript (not `<!doctype html>`).

## 3. Windows Path Casing for Next.js
- On Windows systems, always execute build scripts with uppercase drive letters (`cd /d C:\...`).
- Never mix lowercase `c:\` and uppercase `C:\` to prevent duplicate React instances and SSR dispatcher crashes (`TypeError: Cannot read properties of null (reading 'useMemo')`).

