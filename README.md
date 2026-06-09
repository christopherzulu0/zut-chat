# ZUT AI Student Support Chatbot

AI-powered student support for **Zambia University of Technology (ZUT)** using Retrieval-Augmented Generation (RAG), Clerk authentication, and a web chat interface.

## Features

- **Landing page** — marketing site with static chat preview; sign-in required to chat
- **Web chat** — natural language Q&A grounded in official university documents (OpenAI + Pinecone)
- **Clerk auth** — students must sign in before using chat
- **Admin dashboard** — upload PDFs, seed knowledge base, view metrics and escalations
- **Human escalation** — “Contact staff” creates tickets; Gmail SMTP alerts admins and emails students on resolve
- **Chat history** — sidebar on `/chat` to resume past conversations (requires PostgreSQL)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Auth | Clerk (`@clerk/nextjs`) |
| RAG | LangChain.js, OpenAI, Pinecone |
| Database | PostgreSQL + Prisma ORM |

## Prerequisites

1. [Clerk](https://dashboard.clerk.com) application
2. [OpenAI API key](https://platform.openai.com/api-keys)
3. [Pinecone](https://www.pinecone.io) — dense index with **768 dimensions**
4. PostgreSQL — Neon, Supabase, or local

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example`).

### Database

```bash
pnpm db:push
pnpm db:generate
```

### Pinecone index

Create a **dense** serverless index with **768 dimensions** and metric **cosine**.

After switching embedding models, run:

```bash
pnpm seed:reset
```

### Seed knowledge base

```bash
pnpm seed
# or wipe and re-seed:
pnpm seed:reset
```

### Admin role in Clerk

**Option A — Clerk metadata (production)**

1. [Clerk Dashboard](https://dashboard.clerk.com) → Users → your user → **Public metadata**:

```json
{ "role": "admin" }
```

2. Clerk Dashboard → **Sessions** → **Customize session token** (so middleware can read the role):

```json
{
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

3. Sign out and sign back in to refresh your session token.

**Option B — env fallback (local dev)**

Add your Clerk user ID to `.env.local`:

```
ADMIN_USER_IDS=user_xxxxxxxxxx
```

Copy the ID from Clerk Dashboard → Users, or from your profile in the app header.

After either option, admins see **Admin** in the header and an **Admin dashboard** button on `/chat`.

### Escalation email (Gmail SMTP)

For demo/FYP volume, use a personal Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification):

```env
GMAIL_USER=your.name@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
ESCALATION_EMAIL=your.name@gmail.com
GMAIL_FROM_NAME=ZUT Student Support
```

- **New ticket** → email sent to `ESCALATION_EMAIL` (your inbox)
- **Resolve ticket** → optional message emailed to the student’s Clerk email

If Gmail vars are missing, notifications fall back to server console logs (`[Escalation]`).

## Development

```bash
pnpm dev
```

- `/` — public landing page
- `/chat` — requires sign-in
- `POST /api/chat` — requires authenticated user (401 if signed out)

If routes 404 after adding API files, run `pnpm dev:clean`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm dev:clean` | Clear `.next` and start dev |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest |
| `pnpm seed` | Seed Pinecone |
| `pnpm seed:reset` | Clear index + re-seed + verify retrieval |
| `pnpm debug:rag` | Check Pinecone scores |
| `pnpm db:push` | Push Prisma schema |

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/chat` | Signed-in user | Chat / escalate |
| `GET /api/chat/conversations` | Signed-in user | List past chats |
| `GET /api/chat/conversations/[id]` | Signed-in user | Load chat messages |
| `POST /api/admin/documents` | Admin | Upload PDF |
| `GET /api/admin/metrics` | Admin | Query metrics |
| `GET /api/admin/escalations` | Admin | Escalation list |
| `PATCH /api/admin/escalations/[id]` | Admin | Update status, notes, resolution |
| `POST /api/seed` | Admin | Seed knowledge base |

## License

Academic project — ZUT Final Year Proposal (Wana Sakashimbi, 2410727).
