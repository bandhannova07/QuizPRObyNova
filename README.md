# QuizPRO by Nova (Production)

Monorepo containing:
- `frontend/`: Next.js (TypeScript, Tailwind CSS) deployed to Netlify
- `backend/`: Node.js + Express (TypeScript) with Prisma (Postgres), deployed to Render

This repo is production-ready with CI/CD, Sentry, structured logging, security middleware, and testing (Jest + Cypress).

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Cypress, Sentry
- Backend: Node.js, Express, TypeScript, Prisma (Postgres), Redis (Upstash), Jest, Sentry, Pino logging
- DB: PostgreSQL on Render
- Cache/Session: Redis (Upstash)
- Auth: Username + Email + Country at signup, email verification, JWT access + refresh cookies
- CI/CD: GitHub Actions -> Netlify (frontend) + Render (backend)

## Environments & Secrets
Configure secrets in providers (do not commit):

Frontend (Netlify) required variables:
- NEXT_PUBLIC_API_URL=https://api.example.com
- NEXT_PUBLIC_SENTRY_DSN=
- SENTRY_AUTH_TOKEN= (for sourcemaps, optional)

Backend (Render) required variables:
- NODE_ENV=production
- PORT=10000 (Render assigns)
- DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
- REDIS_URL=rediss://:PASSWORD@HOST:PORT
- JWT_SECRET=replace_with_long_random
- REFRESH_TOKEN_SECRET=replace_with_long_random
- CORS_ORIGIN=https://app.example.com
- SENTRY_DSN=
- EMAIL_FROM=no-reply@example.com
- EMAIL_PROVIDER=mock (or sendgrid)
- SENDGRID_API_KEY= (if using sendgrid)
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=60

## Install
- Node.js LTS and pnpm or npm

## Commands
Frontend:
- cd frontend && pnpm i && pnpm build

Backend:
- cd backend && pnpm i
- pnpm prisma:generate
- pnpm prisma:migrate
- pnpm prisma:seed
- pnpm build

## Database (Prisma)
See `backend/prisma/schema.prisma`. Run migrations and seed with:
```
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

## Deployment
- Netlify: uses `netlify.toml` with base `frontend/`. Set `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in GitHub if using API. Otherwise, connect repo and auto-deploy on main.
- Render: deploy backend via `render.yaml` using rootDirectory `backend/`. Set `RENDER_API_KEY` in GitHub for CI-triggered deploys or connect service in Render.

One-liners:
- Deploy to prod (CI): `gh workflow run deploy.yml -r main -f env=production`
- Rollback backend (Render): `render releases rollback <SERVICE_ID>`

## OpenAPI
See `backend/openapi.yaml` for API endpoints.

## Testing
- Unit/Integration: `cd backend && pnpm test`
- E2E: `cd frontend && pnpm cypress:run`

## Production Launch Checklist
See bottom section of this README for the checklist.

---

# Production Launch Checklist
- Env vars configured in Netlify and Render
- DB migrated and seed executed on production DB
- Backups configured on Render Postgres and tested restore
- Sentry DSNs set and alerts connected (email/Slack)
- Rate-limiter and WAF rules configured
- SSL & DNS validated on custom domains
- Email verification working end-to-end
- Spam/moderation basics functioning
- Load testing passes (500 concurrent users) with acceptable latency
- Accessibility audit (WCAG AA)
- Lighthouse budget met (<= 2s TTFB on 4G)
- Admin panel protected (role + optional IP allowlist)
- Uptime monitor configured (UptimeRobot)
