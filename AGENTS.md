You are an expert AI software engineer assistant. You are strictly tasked with writing, maintaining, and debugging code for this specific Next.js application (CodeAudit). Below are the explicit guidelines, structural architectural patterns, and tech stack boundaries you must adhere to.

1. Core Tech Stack
Framework: Next.js 16.2 (App Router configuration)
Runtime/Package Manager: Bun (bun for adding dependencies and running operations)
Component Engine: React 19.2
Styling & UI: Tailwind CSS, Radix UI, Shadcn UI primitives, Recharts (for dashboards), React Activity Calendar (for profile heatmaps)
Authentication: Better Auth (coupled with GitHub OAuth provider)
Database & ORM: Prisma 7 + Cloud Postgre SQL (Neon server serverless database)
Event-Driven Workflows: Inngest (handles asynchronous durable execution, RAG synchronization, and webhooks)
AI Ecosystem: Vercel AI SDK, Google Gemini AI (Defaulting to gemini-3.5-flash model), Google Text Embeddings (text-embedding-005)
Vector DB Engine: Pinecone (Vector dimensions: 768, metrics: cosine)
Payments: Polar SH (Subscriptions & Metered Usage engine)

2. Directory Architecture & Feature-Driven Modular Design
The project strictly implements a Feature-Based Modular Architecture. Each domain functionality resides cleanly within a modular directory containing its specific server actions, component trees, hooks, and helpers. Do not split logic arbitrarily unless requested.
```Plaintext
├── app/                      # App router page routes & layouts
│   ├── api/                  # Native backend handlers
│   │   ├── auth/             # Better Auth engine catch-all
│   │   └── webhooks/         # Webhook entry points
│   └── dashboard/            # Core system workspace
├── components/               # Global cross-feature visual primitives (ui/, providers/)
├── inngest/                  # Dynamic background workflow hub
│   ├── client.ts             # Global Inngest instance configurations
│   └── functions/            # Async state executors (review.ts, repository.ts)
├── lib/                      # Core infrastructure singletons
│   ├── db.ts                 # Prisma Client instantiation (Prisma 7 compatible adapter)
│   ├── auth.ts               # Better Auth framework interface
│   ├── auth-client.ts        # Client-side validation wrapper
│   └── pinecone.ts           # Unified Vector DB instance wrapper
└── modules/                  # Feature-Based Modular Architecture
    ├── auth/                 # Sign-in state visual managers
    ├── dashboard/            # Workspace grids & statistics processing
    ├── ai/                   # AI Prompt context orchestrations & server actions
    ├── repository/           # Infinite scroll tables, GitHub integrations, sync routines
    └── payments/             # Polar entitlement validations & usage limit trackers
```

3. Strict Development Standards
Component Archetypes (Server vs. Client)
Server Components: Default context. Fetch database entries or query structures safely directly in asynchronous Server Components without wrapping paths in API steps.
Client Components: Append 'use client' explicitly only when listening to continuous explicit client events (useState, useEffect), performing transactional inputs (React Hook Form), or calling context hooks (useSession). Keep client scopes as small as possible.
State Syncing Architecture
Leverage TanStack React Query (@tanstack/react-query) to capture and resolve all dynamic asynchronous state transactions across client grids. Never map bare asynchronous raw functions via traditional React hooks unless strictly necessary.
Track mutation updates explicitly via target Cache Invalidation keys (e.g., ['connected-repositories'], ['dashboard-stats']) post-execution.
Database Mutations & Server Actions
Always wrap operations modifying real state models (Prisma transactions) into Next.js Server Actions decorated with the 'use server' directive at the top of the execution file.
Call explicit target cache operations like revalidatePath('/dashboard/settings', 'page') safely directly at the termination of state updates to dynamically invalidate cache artifacts.

4. Feature Domain Implementations & RAG Architecture
GitHub Webhook Interceptions & Routing Rules
Webhook payload triggers parsed from API/webhooks/github/route.ts execute inside a native catch block matching specific structural constraints:
Event processing must switch cleanly on validation maps like checking the raw header boundary: request.headers.get('x-github-event') === 'pull_request'.
Evaluate explicitly on targets like body.action === 'opened' || body.action === 'synchronize' before invoking modular AI payload engines (reviewPullRequest()).

The Codebase Indexing Pipeline (RAG Engine)
When an individual project registers via Inngest repository.connected, it kicks off recursive parsing routines fetching clean base entries using native GitHub API parameters via Octokit:
File parsers must aggressively strip static noise parameters, system configuration formats, block logs, and typical images (.png, .jpg, .zip, .svg, .ico, .pdf). Only parse context text targets.
Chunk operations must format input payload metadata safely via deterministic block models embedding structured payloads safely within Pinecone indexes:
```TypeScript
// Required vector block shape
{
  id: `${repoId}_${filePath}`,
  values: embeddingVector, // Generated via text-embedding-2
  metadata: { repoId, path: filePath, content: truncatedCodeString }
}
```

Prompt Engineering and AI Context Constraints
When compiling the context prompt arrays inside inngest/functions/review.ts targeting gemini-2.5-flash, the payload data must match specific explicit structural markdown segments:
Input Elements Required: Complete Pull Request Diff mappings + Retrieved Vector Semantic context arrays mapped via active Pinecone index fetches.
Response Shapes Demanded: Explicit Markdown output block sequences structuring summaries step-by-step: File-by-file walthroughs, structured formatting (e.g., Mermaid.js sequence flows when context demands interaction paths), code vulnerabilities, structural updates, and a final short creative poem encapsulating code transformations.
Entitlement & Tier Limits Gatekeeping
Enforce active tier checking dynamically by calculating real values inside modules/payments/lib/subscription.ts before running long-running operations:
Free Tier: Constrained directly to maximum boundaries of 5 total repositories and 5 total Pull Request evaluations per specific single repository.
Pro Tier: Entitled safely via metered evaluations to infinite limits (null bounds checks).

5. Explicit Code Generation Archetype Snippets
Type-Safe Singleton Client Models (Prisma 7 Context)
Use this exact pattern when constructing or extending global service singletons (e.g., inside lib/db.ts) to conform with explicit state persistence requirements across server frames:
```TypeScript
import { PrismaClient } from "@prisma/client";
import { PrismaPG } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPG(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Follow these explicit design rules line-by-line during every instruction step. Always maintain extreme safety checking, avoid unvalidated types (any), and reject non-modular additions.
