# Halacha AI

RAG-based halakhic research system. Retrieves and synthesizes sources from the Jewish legal canon to support learners and poskim.

**This system NEVER issues psak halacha.** It provides research, sources, and structured analysis only.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/MMVFO/halacha-ai.git
cd halacha-ai
pnpm install

# 2. Copy env and fill in your API keys
cp .env.example .env

# 3. Start infrastructure
docker compose up -d

# 4. Run database migrations
pnpm db:migrate

# 5. Download Sefaria Export (for ingestion)
git clone https://github.com/Sefaria/Sefaria-Export.git data/Sefaria-Export

# 6. Ingest data (start with Shulchan Arukh OC)
pnpm ingest:shulchan-arukh --path ./data/Sefaria-Export

# 7. Start embedding worker
pnpm worker

# 8. Start dev server
pnpm dev
```

Open http://localhost:3000/halacha to begin.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and data flow.

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full schema reference.

## Monorepo Structure

```
apps/web/        — Next.js frontend + API routes
apps/worker/     — BullMQ embedding worker
packages/db/     — Database client + migrations
packages/lib/    — Shared utilities (search, prompts, embeddings)
scripts/         — One-off ingestion scripts
```

## Research Modes

| Mode | Audience | Description |
|------|----------|-------------|
| Practical | Learners | Opinions by sefer, conflicts noted, minhagim mentioned |
| Deep Analytic | Advanced | Sugya map, opinion matrix, conditional frameworks |
| Posek View | Poskim | Mar'ei mekomot, shittot table, unresolved tensions |

## Corpus Tiers

- **canonical** — Shulchan Arukh, Mishneh Torah, Mishnah Berurah, etc.
- **apocrypha** — Sefaria Apocrypha collection (opt-in, zero authority weight)
- **pseudepigrapha** — Enoch, Jubilees, etc. (opt-in, zero authority weight)
- **academic** — Modern scholarly works (opt-in, zero authority weight)

## License

Private — All rights reserved.
