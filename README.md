# ZUT AI Student Support Chatbot

AI-powered student support for **Zambia University of Technology (ZUT)** using Retrieval-Augmented Generation (RAG), Clerk authentication, and Africa's Talking USSD.

## Features

- **Web chat** — natural language Q&A grounded in official university documents (OpenAI + Pinecone)
- **Clerk auth** — sign-in for students; guest mode with rate limits for prospects
- **Admin dashboard** — upload PDFs, seed knowledge base, view metrics and escalations
- **USSD** — feature-phone access via Africa's Talking (`/api/ussd`)
- **Human escalation** — “Contact staff” creates tickets and optional email alerts

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Auth | Clerk (`@clerk/nextjs`) |
| RAG | LangChain.js, OpenAI, Pinecone |
| Database | PostgreSQL + Prisma ORM |
| USSD | Africa's Talking |

## Prerequisites

1. [Clerk](https://dashboard.clerk.com) application (keyless mode works locally without keys)
2. [OpenAI API key](https://platform.openai.com/api-keys) — `OPENAI_API_KEY` (defaults: `gpt-4o-mini` chat, `text-embedding-3-small` embeddings)
3. [Pinecone](https://www.pinecone.io) — dense index with **768 dimensions** (see `OPENAI_EMBEDDING_DIMENSION`)
4. PostgreSQL — Neon, Supabase, or local
5. [Africa's Talking](https://africastalking.com) — USSD service code and API credentials

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example`).

### Database

Set `DATABASE_URL` in `.env.local`, then apply the Prisma schema:

```bash
pnpm db:push
# or for versioned migrations:
pnpm db:migrate
```

Generate the Prisma client after schema changes:

```bash
pnpm db:generate
```

### Pinecone index

Create a **dense** serverless index (not sparse) named `zut-student-support` (or match `PINECONE_INDEX`):

| Setting | Value |
|---------|--------|
| Vector type | **Dense** (standard vector search) |
| Dimensions | **768** (`text-embedding-3-small` with `OPENAI_EMBEDDING_DIMENSION=768`) |
| Metric | cosine |

Sparse indexes are not supported — seed will fail with `Upserting dense vectors is not supported for sparse indexes`.

> **After changing embedding models**, re-seed (`pnpm seed`) so Pinecone vectors match the new embedding space. If every chat reply says it could not find information, the index is likely empty or still has old Gemini vectors — run `pnpm seed` again.

**Chat always says “could not find reliable information”?**

Console shows `[rag] Low retrieval: { topScore: 0.04, ... }`? Your Pinecone index still has **old Gemini vectors** while chat uses **OpenAI** embeddings (scores stay near 0.04).

```bash
pnpm seed:reset
```

That deletes all vectors and re-seeds with OpenAI, then verifies similarity ≥ 0.35.

1. `pnpm debug:rag` — check index dimension matches `OPENAI_EMBEDDING_DIMENSION` (768).
2. Optional: lower `RAG_MIN_SCORE` in `.env` only if scores are healthy (≥ 0.35) but slightly below 0.5.

### Seed knowledge base

Seeding loads:

- Hardcoded FAQ snippets in `lib/rag/ingest.ts` (fees, admissions, ID, etc.)
- All markdown files in [`data/knowledge/`](data/knowledge/), including:
  - [`academic-calendar-2026-2027.md`](data/knowledge/academic-calendar-2026-2027.md) — full academic calendar (split into semester chunks for RAG)
  - [`zut-faq.md`](data/knowledge/zut-faq.md) — FAQ by topic

After adding or editing files in `data/knowledge/`, **re-seed** so Pinecone picks up the changes:

As an admin user (set `publicMetadata.role` to `admin` in Clerk):

1. Sign in → **Admin** → **Seed sample knowledge base**

Or CLI:

```bash
pnpm seed
```

**Seed fails with connect timeout or exit code `3221226505`?**

1. Confirm keys are in `.env` or `.env.local` (`OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`).
2. In the [Pinecone console](https://app.pinecone.io), open your index and copy its **host** URL into `.env`:
   ```env
   PINECONE_HOST=https://your-index-xxxx.svc.region.pinecone.io
   ```
   This avoids calling `api.pinecone.io` during seed (common on restricted networks).
3. Test outbound HTTPS from PowerShell:
   ```powershell
   curl.exe -I --max-time 15 "https://api.openai.com"
   curl.exe -I --max-time 15 "https://api.pinecone.io"
   ```
   If these time out, use another network or a VPN — the app cannot reach OpenAI/Pinecone from your machine.
4. Optional: slow seed? Increase `OPENAI_EMBED_DELAY_MS` (e.g. `500`).

Place new official documents as `.md` files under `data/knowledge/` (or upload PDFs via Admin).

### Admin role in Clerk

In [Clerk Dashboard](https://dashboard.clerk.com) → Users → select user → **Public metadata**:

```json
{ "role": "admin" }
```

## Development

```bash
pnpm dev
```

### `POST /api/chat` returns 404

Usually a **stale Turbopack dev cache** — the route exists (`app/api/chat/route.ts`) but the running dev server did not register API routes.

1. Stop all `next dev` processes (close terminals or `taskkill` the Node PID shown in the terminal).
2. Clear the cache and restart:

```bash
pnpm dev:clean
```

3. Confirm the dev log shows `POST /api/chat 200` (not an HTML 404 page).

If port 3000 is busy, Next may use **3001** — use the URL printed in the terminal.

Open [http://localhost:3000](http://localhost:3000).

## USSD (Africa's Talking)

1. Register a USSD service code in the AT dashboard.
2. Set callback URL to `https://<your-host>/api/ussd`.
3. Configure `.env.local`:

```
AT_API_KEY=...
AT_USERNAME=sandbox
AT_USSD_SERVICE_CODE=*384*123#
AT_USSD_WEBHOOK_SECRET=optional-shared-secret
```

**Local testing with ngrok:**

```bash
ngrok http 3000
# Paste https URL + /api/ussd into AT dashboard
```

**Simulate a request:**

```bash
curl -X POST http://localhost:3000/api/ussd \
  -d "sessionId=test1&phoneNumber=%2B260970000000&serviceCode=*384*1%23&text="
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm seed` | Seed Pinecone from sample ZUT docs |
| `pnpm benchmark` | Run latency/accuracy benchmark |
| `pnpm db:push` | Push Prisma schema to Postgres |
| `pnpm db:migrate` | Create/run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/chat` | Public (guest limits) | Chat / escalate |
| `POST /api/ussd` | Public (AT webhook) | USSD handler |
| `POST /api/admin/documents` | Admin | Upload PDF |
| `GET /api/admin/metrics` | Admin | Query metrics |
| `GET /api/admin/escalations` | Admin | Escalation list |
| `POST /api/seed` | Admin | Seed knowledge base |

## Deployment (Vercel)

1. Import repo to Vercel.
2. Add all environment variables from `.env.example`.
3. Set USSD callback to `https://<vercel-domain>/api/ussd`.
4. Use Neon/Supabase for `DATABASE_URL`.

## Project objectives

1. **Increase access to academic information** — 24/7 web + USSD channels  
2. **Support basic phones** — USSD menu and short free-text questions  
3. **Reduce access costs** — low-data USSD; no campus visit for routine FAQs  

## License

Academic project — ZUT Final Year Proposal (Wana Sakashimbi, 2410727).
