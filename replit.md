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
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Applications

### To-Do App (`artifacts/todo-app`)
- React + Vite frontend at `/`
- CRUD operations for tasks (add, complete, delete)
- Filter by all/active/completed
- Summary counts (total, active, completed)
- Uses `@workspace/api-client-react` generated hooks

### API Server (`artifacts/api-server`)
- Express 5 backend at `/api`
- Endpoints: `/api/todos` (GET, POST), `/api/todos/:id` (PATCH, DELETE), `/api/todos/summary` (GET), `/api/healthz` (GET)
- Uses Drizzle ORM with PostgreSQL

## Database Schema

### todos
- `id` (serial, PK)
- `title` (text, not null)
- `completed` (boolean, default false)
- `created_at` (timestamp with timezone, default now)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
