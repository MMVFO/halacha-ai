# CLAUDE.md

## Project
Halacha AI — RAG-based halakhic research system. pnpm monorepo (Next.js 15 + workers + shared packages).

## Architecture
- `apps/web` — Next.js 15 frontend + API routes (port 3004)
- `apps/worker` — Ingestion, embedding, linking worker scripts
- `packages/db` — Postgres client, schema types, migrations
- `packages/lib` — Shared utilities (search, transliteration, cross-ref, embeddings)

## Environment
- Platform: Windows 11 (Git Bash)
- Docker: `docker-compose.yml` — Postgres (pgvector) on port 5433, Redis on port 6380
- Container: `halacha-ai-postgres-1`, database: `halacha_ai`, user: `halacha`
- Node >= 20, pnpm 10.x

## Common Commands
- Dev server: `pnpm --filter @halacha-ai/web dev --port 3004`
- TypeScript check: `pnpm --filter @halacha-ai/web exec tsc --noEmit`
- Run worker script: `DATABASE_URL="postgresql://halacha:halacha@localhost:5433/halacha_ai" npx tsx apps/worker/<script>.ts`
- DB shell: `docker exec halacha-ai-postgres-1 psql -U halacha -d halacha_ai`
- Migrations: apply via `docker exec ... psql` piping the SQL file

## Gotchas
- `psql` is not installed locally — always use `docker exec`
- `tsc` and `tsx` don't resolve via bare `pnpm tsc` — use `pnpm --filter <pkg> exec tsc` or `npx tsx`
- Worker scripts need explicit `DATABASE_URL` env var (not auto-loaded from .env)
- Windows: `/dev/stdin` doesn't work in Node — pipe curl output to `$USERPROFILE/tempfile.json` instead
- `halacha_chunks` has 4.6M rows — never scan it directly for aggregates; use `works_summary` materialized view (8K rows)
- After ingesting new data, run `REFRESH MATERIALIZED VIEW CONCURRENTLY works_summary`

## Code Style
- Minimal comments, concise TypeScript
- DB functions in `packages/db/client.ts`, shared logic in `packages/lib/`
- API routes at `apps/web/app/api/<feature>/route.ts`
- SQL: use `unnest()` for batch inserts, `DISTINCT ON` + subquery for dedup with custom ordering
