# Social Media Platform

Full-stack social media platform built with React, Express, PostgreSQL, and Prisma.

## Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS v3, TanStack Query, React Router v7, React Hook Form, Zod
**Backend:** Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL
**Auth:** JWT (access + refresh tokens), bcrypt, httpOnly cookies

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- npm

### Setup

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment
cp .env.example server/.env

# Initialize database
cd server
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# Start development
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

### Docker

```bash
docker compose up
```

### Default Seed Users

| Email              | Password     |
|--------------------|--------------|
| alice@example.com  | password123  |
| bob@example.com    | password123  |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out (auth)
- `POST /api/auth/refresh` — Rotate tokens
- `GET /api/auth/me` — Current user (auth)

### Users
- `GET /api/users` — List users (paginated)
- `GET /api/users/:id` — Get profile
- `PATCH /api/users/:id` — Update profile (auth, owner)
- `GET /api/users/:id/posts` — User's posts (paginated)

### Posts
- `GET /api/posts` — Feed (paginated)
- `GET /api/posts/:id` — Get post
- `POST /api/posts` — Create (auth)
- `PATCH /api/posts/:id` — Update (auth, owner)
- `DELETE /api/posts/:id` — Delete (auth, owner)

### Comments
- `GET /api/posts/:id/comments` — List comments (paginated)
- `POST /api/posts/:id/comments` — Create (auth)
- `DELETE /api/comments/:id` — Delete (auth, owner)

### Likes
- `POST /api/posts/:id/like` — Like (auth)
- `DELETE /api/posts/:id/like` — Unlike (auth)

### Follows
- `POST /api/users/:id/follow` — Follow (auth)
- `DELETE /api/users/:id/follow` — Unfollow (auth)

## Architecture

```
client/              React SPA (Vite)
server/              Express API
 ├── prisma/         Schema + migrations
 ├── src/
 │   ├── config/     Environment config
 │   ├── middleware/  Auth, validation, error handling
 │   ├── modules/    Feature modules (auth, users, posts, etc.)
 │   ├── utils/      Helpers (JWT, pagination, sanitize)
 │   └── database/   Prisma client
 └── tests/
```

## Scripts

### Server
| Command                  | Description          |
|--------------------------|----------------------|
| `npm run dev`            | Start dev server     |
| `npm run build`          | Compile TypeScript   |
| `npm run db:migrate`     | Run Prisma migration |
| `npm run db:seed`        | Seed database        |
| `npm run db:studio`      | Open Prisma Studio   |
| `npm test`               | Run tests            |
| `npm run typecheck`      | TypeScript check     |

### Client
| Command                  | Description          |
|--------------------------|----------------------|
| `npm run dev`            | Start Vite dev server|
| `npm run build`          | Production build     |
| `npm test`               | Run tests            |
| `npm run typecheck`      | TypeScript check     |
