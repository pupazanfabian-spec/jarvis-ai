# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo SDK 54 (React Native)

## Artifacts

### Jarvis AI (`artifacts/jarvis`)
Expo/React Native mobile AI assistant app (rebranded from Axon AI). Features:
- **Brain Engine v6**: Knowledge base with 270+ Romanian topics, inference engine, entity tracker, temporal memory, constitution/security system, self-learning, semantic similarity with Romanian stemming
- **Multi-AI Provider**: Gemini + OpenAI direct API calls with secure key storage (expo-secure-store)
- **On-device LLM**: Phi-3 via llama.rn for offline use (native build only)
- **Web Search**: Wikipedia RO/EN, DuckDuckGo with 48h SQLite cache
- **Code Generation**: Dev knowledge and code sandbox features
- **Local Database**: SQLite via expo-sqlite for all persistent data
- **Security**: PIN lock, constitution system, manipulation detection
- **UI**: Dark theme chat interface with quick actions, memory modal, file upload, AI provider selector, knowledge browser

Key directories:
- `engine/` — AI brain, knowledge, inference, entities, temporal memory, web search, code generation
- `context/` — React context providers (Brain, LLM, PIN, AIProvider, DevMode)
- `components/` — Chat UI components (ChatBubble, QuickActions, modals, etc.)
- `constants/colors.ts` — Dark theme color palette

### API Server (`artifacts/api-server`)
Express 5 backend with health check endpoint.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/jarvis run dev` — run Jarvis mobile app

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
