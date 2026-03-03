# Halacha AI

RAG-based halakhic research system with intelligent multi-AI routing. Retrieves and synthesizes sources from the Jewish legal canon to support learners and poskim.

**This system NEVER issues psak halacha.** It provides research, sources, and structured analysis only.

## 🚀 Quick Launch (Get Running in 5 Minutes)

**For immediate testing with minimal setup:**

```bash
# 1. Clone the repo
git clone https://github.com/MMVFO/halacha-ai.git
cd halacha-ai

# 2. Install dependencies
pnpm install

# 3. Get a FREE Perplexity API key (30 seconds)
# Visit: https://www.perplexity.ai/settings/api
# Click "Generate API Key"

# 4. Configure .env
cp .env.example .env
# Edit .env and add:
# PERPLEXITY_API_KEY=pplx-your_key_here

# 5. Start infrastructure
docker compose up -d

# 6. Start the app
pnpm dev
```

**Windows Users**: Use the batch scripts!
```cmd
setup.bat     # Install dependencies + setup .env
start.bat     # Start everything
stop.bat      # Stop Docker containers
```

Open http://localhost:3000/halacha to test queries immediately.

**Note**: The quick launch uses a pre-embedded test database with ~224K chunks already ingested. For full data ingestion, see **Full Setup** below.

---

## 🤖 Intelligent Multi-AI System

Halacha AI automatically selects the **best AI model for each task**:

- **Practical Mode** (60-70% of queries): Perplexity Sonar Pro → web-grounded, recent responsa, $1-3/1M tokens
- **Deep Analysis** (20-25%): Claude Sonnet 4 → analytical reasoning, $3-15/1M tokens  
- **Posek View** (10-15%): Claude Sonnet 4 → authoritative perspective

**Automatic fallback**: If primary provider fails, system falls back to alternatives  
**Graceful degradation**: Even if all AI fails, you get search results

**Recommended**: Configure all three providers for optimal results:
```bash
# .env
LLM_PROVIDER=auto  # Intelligent routing (recommended)
PERPLEXITY_API_KEY=pplx-your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here  
OPENAI_API_KEY=sk-your_key_here
```

See [MULTI-AI-SYSTEM.md](./MULTI-AI-SYSTEM.md) for detailed documentation.

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- At least one AI API key (Perplexity recommended for budget)

---

## Full Setup (Production)

### 1. Install Dependencies

```bash
git clone https://github.com/MMVFO/halacha-ai.git
cd halacha-ai
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:

**Required**:
- `DATABASE_URL` (PostgreSQL connection)
- `REDIS_URL` (Redis connection)
- `EMBEDDING_API_KEY` (HuggingFace or compatible)
- At least one AI provider key:
  - `PERPLEXITY_API_KEY` (recommended - budget-friendly)
  - `ANTHROPIC_API_KEY` (premium analytical reasoning)
  - `OPENAI_API_KEY` (reliable fallback)

**Optional**:
- `SEFARIA_EXPORT_PATH` (for data ingestion)

### 3. Start Infrastructure

```bash
docker compose up -d
```

This starts:
- PostgreSQL with pgvector extension (port 5433)
- Redis for BullMQ job queue (port 6380)

### 4. Run Database Migrations

```bash
pnpm db:migrate
```

### 5. Download Source Data

**Sefaria Export** (canonical texts):
```bash
git clone https://github.com/Sefaria/Sefaria-Export.git data/Sefaria-Export
```

**Otzaria Library** (Kabbalah corpus - optional):
```bash
# Download from https://github.com/Sefaria/Otzaria
# Place in data/Otzaria/
```

### 6. Ingest Data

Start with Shulchan Arukh:
```bash
pnpm ingest:shulchan-arukh --path ./data/Sefaria-Export
```

Or use the comprehensive ingestion:
```bash
# Windows
ingest.bat

# Unix/Mac
pnpm ingest:all
```

This processes ~18,634 files across 14 categories:
- Tanakh, Mishnah, Talmud
- Shulchan Arukh, Rema, Mishnah Berurah
- Responsa, Midrash, Kabbalah, Apocrypha

### 7. Generate Embeddings

**Start the embedding worker**:
```bash
pnpm worker
```

**Enqueue embedding jobs**:
```bash
# Windows
enqueue-embeddings.bat

# Unix/Mac  
pnpm db:enqueue-embeddings
```

The worker processes chunks through your embedding API (HuggingFace/TEI) and stores vectors in pgvector.

**Note**: With 224K+ chunks, this takes several hours. Progress logged to console.

### 8. Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000/halacha

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and data flow.

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full schema reference.

See [MULTI-AI-SYSTEM.md](./MULTI-AI-SYSTEM.md) for AI routing details.

---

## Monorepo Structure

```
apps/web/        — Next.js frontend + API routes
apps/worker/     — BullMQ embedding worker
packages/db/     — Database client + migrations
packages/lib/    — Shared utilities (search, prompts, embeddings, LLM routing)
scripts/         — Data ingestion and repo monitoring
```

---

## Research Modes

| Mode | Audience | AI Model | Description |
|------|----------|----------|-------------|
| **Practical** | Learners | Perplexity Sonar Pro | Opinions by sefer, conflicts noted, minhagim mentioned, web-grounded |
| **Deep Analytic** | Advanced | Claude Sonnet 4 | Sugya map, opinion matrix, conditional frameworks, deep reasoning |
| **Posek View** | Poskim | Claude Sonnet 4 | Mar'ei mekomot, shittot table, unresolved tensions, authoritative |

The system **automatically selects** the optimal AI model for each mode. See [MULTI-AI-SYSTEM.md](./MULTI-AI-SYSTEM.md) for details.

---

## Corpus Tiers

- **canonical** — Shulchan Arukh, Mishneh Torah, Mishnah Berurah, etc.
- **apocrypha** — Sefaria Apocrypha collection (opt-in, zero authority weight)
- **pseudepigrapha** — Enoch, Jubilees, etc. (opt-in, zero authority weight)  
- **academic** — Modern scholarly works (opt-in, zero authority weight)
- **private** — Personal notes and commentary (user-specific)

---

## Community Support

35+ granular Jewish communities with hierarchical relationships:
- Ashkenazi (Lithuanian, Chabad, Satmar, etc.)
- Sephardi (Syrian, Moroccan, Iraqi, etc.)
- Mizrahi (Yemenite, Persian, etc.)
- Modern Orthodox, Conservadox, etc.

Community selection weights source authority and minhag relevance.

---

## Troubleshooting

### "No LLM API key configured"

**Solution**: Add at least one provider key to `.env`:
```bash
PERPLEXITY_API_KEY=pplx-your_key_here
```

Get keys from:
- Perplexity: https://www.perplexity.ai/settings/api
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

### "Embedding API error"

**Solution**: Configure HuggingFace API key:
```bash
EMBEDDING_API_KEY=hf_your_key_here
```

Get key from: https://huggingface.co/settings/tokens

### "No relevant sources found"

**Cause**: Database not ingested yet  
**Solution**: Run ingestion scripts (see step 6 above)

### Database Connection Issues

**Check Docker**:
```bash
docker ps  # Verify postgres and redis are running
docker compose logs postgres  # Check postgres logs
```

**Reset Database**:
```bash
docker compose down -v  # Delete volumes
docker compose up -d    # Fresh start
pnpm db:migrate         # Re-run migrations
```

---

## Resources

- [RESOURCES.md](./RESOURCES.md) — 26+ curated Jewish text sources
- [KABBALAH-RESOURCES.md](./KABBALAH-RESOURCES.md) — Comprehensive Kabbalah corpus research
- [MULTI-AI-SYSTEM.md](./MULTI-AI-SYSTEM.md) — AI routing architecture and configuration

---

## License

Private — All rights reserved.
