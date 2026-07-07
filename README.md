# CodeAudit

Live deployment: [code-audit-navy.vercel.app](https://code-audit-navy.vercel.app)

This project is currently under development.

CodeAudit is an AI-powered automated code review and codebase audit platform. It registers and indexes GitHub repositories, performs vector embeddings on codebase contents for semantic retrieval (RAG), processes pull request webhooks to automatically review diffs, and generates structured walkthroughs, security analysis, flow charts, and feedback.

## Technology Stack

### Framework and Runtime
- Next.js (App Router)
- React
- Bun (Package manager and runtime)

### Database and Storage
- Prisma ORM
- PostgreSQL (Neon Serverless Database)
- Pinecone (Vector database for repository codebase indexing using cosine metric and 768-dimension vectors)

### Authentication and Billing
- Better Auth (integrated with GitHub OAuth provider)
- Polar.sh (Subscriptions and metered usage engine)

### AI and Event-Driven Pipelines
- Vercel AI SDK
- Google Gemini AI (gemini-3.5-flash and gemini-2.5-flash models)
- Google Text Embeddings (text-embedding-2)
- Inngest (Background execution of webhook handlers and codebase indexing routines)

### Styling and User Interface
- Tailwind CSS
- Radix UI and Shadcn UI primitives
- Recharts (for dashboard analytics)
- React Activity Calendar (for contribution activity maps)

## Directory Structure

The project implements a Feature-Based Modular Architecture. Each domain's functionality resides in a modular directory containing its specific actions, components, hooks, and helper functions.

- app/ - Next.js App Router page routes, layouts, and API/webhook handlers
- components/ - Global, reusable visual primitives (under components/ui) and provider wrappers
- inngest/ - Background workflow handlers and dynamic executors (indexing, webhook reviews)
- lib/ - Core infrastructure singletons (database connection, authentication, vector DB clients)
- modules/ - Feature-specific logic directories:
  - auth/ - Authentication states and visual login components
  - dashboard/ - Workspace analytics grids and stats processors
  - ai/ - Prompt orchestration and server actions
  - repository/ - GitHub integration routines, repository synchronization, scroll tables
  - payments/ - Subscription entitlement validations and usage tracking

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- Bun (recommended package manager)
- Node.js (supported version)
- A running Inngest Dev Server

### Installation

Install dependencies using Bun:

```bash
bun install
```

### Database Migration

Ensure your database is up to date:

```bash
bun prisma db push
```

### Local Development

1. Start the Inngest local development agent:

```bash
npx inngest-cli@latest dev
```

2. Run the Next.js development server:

```bash
bun run dev
```

Open http://localhost:3000 in your browser to view the application.

## Development Standards

- Component Selection: Default to Next.js Server Components. Only use Client Components ('use client') for interactivity, state hooks (useState, useEffect), or authentication wrappers. Keep client component scopes as small as possible.
- State Synchronization: Use TanStack React Query to manage and synchronize dynamic asynchronous state transactions across client components.
- Database Mutations: Always wrap state-modifying actions inside Next.js Server Actions using the 'use server' directive. Call target page revalidation (e.g. revalidatePath) to clear cache items.
- Webhooks: GitHub webhooks are parsed under app/api/webhooks/github/route.ts and routed to background workers inside Inngest.
