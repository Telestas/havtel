# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`havtel-web` is the public storefront (React 18 + TypeScript + Vite) for the **Havtel ecommerce** platform. It's one of three deployable apps in the `havtel-infra` monorepo (siblings: `havtel-api` backend, `havtel-backoffice` admin panel) — each lives in its own git repo. When working from the monorepo root, also see the root `CLAUDE.md` for cross-app orchestration (dev-up, deploy, env vars).

See this repo's own `README.md` (Spanish) for the functional feature breakdown (catálogo, carrito, checkout, cuenta de usuario). Stack: Tailwind CSS, Stripe.js for client-side payment, Framer Motion for animation.

## Common commands

Before running anything that needs `npm`/`node`, the dev toolchain lives in user-space — source nvm first (see auto-memory `dev_env_toolchain.md`).

```bash
npm install
npm run dev      # → http://localhost:3000 (Vite)
npm run build
npm run lint      # type-check only: tsc --noEmit
npm test          # vitest run  (npm run test:watch for watch mode)
```

From the monorepo root, `./dev-up.sh` starts this app (plus the API, Postgres/Redis/MinIO, and the backoffice) in one shot, and `./tests.sh web` runs just this repo's tests.

There is no ESLint/Prettier step — `lint` is purely `tsc --noEmit`. The Vite `@` alias resolves to this repo's root directory. Vitest only collects tests under `src/tests/**`.

## Architecture

Single-file SPA: `src/App.tsx` holds the whole application, `src/main.tsx` is the entry point. Connects to the API at `http://localhost:8000/api/v1` by default.

Form validation is custom throughout (not native `required`) — name/apellido rejects digits, phone requires international format with a 7-digit minimum, address fields carry inline per-field error messages. Match this pattern rather than reaching for native HTML validation or a form library when touching forms.

Auth: JWT with automatic refresh-token rotation.
