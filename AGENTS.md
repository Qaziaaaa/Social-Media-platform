# social-Media-platform

## Project State

Full-stack social media platform complete. Backend and frontend both compile with zero TypeScript errors. All core features implemented and tested via Playwright browser audit.

## Commands

### Server (`cd server`)
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev with tsx watch on port 4000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (quick schema sync) |
| `npm run db:seed` | Seed with `tsx prisma/seed.ts` |
| `npm run db:studio` | Launch Prisma Studio |

### Client (`cd client`)
| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev on port 5173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | `tsc -b && vite build` |

## Architecture

- **Server:** Express 5, TypeScript, Prisma ORM, PostgreSQL
- **Client:** React 19, Vite, Tailwind CSS v3, TanStack Query, React Router v7, React Hook Form
- **Auth:** JWT access token (15min, in-memory) + refresh token (7d, httpOnly cookie)
- **Pagination:** Cursor-based on all list endpoints

## Key Conventions

- Feature modules under `server/src/modules/` and `client/src/modules/`
- Services for business logic, controllers are thin handlers
- Repository pattern via Prisma calls in services
- Zod validation on every endpoint, sanitize user content with DOMPurify
- Route handlers wrapped with `asyncHandler` to catch promise rejections
- CORS: client origin at localhost:5173 with credentials

## Database Setup

Requires PostgreSQL running on localhost:5432. Use `docker compose up` or local instance. After DB is up:

```bash
cd server
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

## Installed Skills (do not reinstall)

- `frontend-design` (anthropics/skills) — UI design guidance in `.agents/`
- `vercel-react-best-practices` (vercel-labs/agent-skills) — React performance rules in `.agents/`
