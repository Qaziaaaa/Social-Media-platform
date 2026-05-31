# Social Media Platform — Architecture & Implementation Plan

## 1. High-Level Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│  React SPA   │────▶│  Express API    │────▶│ PostgreSQL │
│  (Vite)      │◀────│  (TypeScript)   │◀────│  (Prisma)  │
└──────────────┘     └─────────────────┘     └────────────┘
       │                       │
   Axios +                  JWT Auth
   TanStack Query           Middleware
```

Monorepo with two packages: `client/` (frontend) and `server/` (backend), orchestrated via Docker Compose.

---

## 2. Project Structure

### Server (`server/`)

```
server/
├── prisma/
│   └── schema.prisma          # Data model + migrations
├── src/
│   ├── config/                # env, cors, db, app config
│   │   └── env.ts
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── modules/               # Feature-based modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validator.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.validator.ts
│   │   ├── posts/
│   │   │   ├── post.controller.ts
│   │   │   ├── post.service.ts
│   │   │   ├── post.repository.ts
│   │   │   ├── post.routes.ts
│   │   │   └── post.validator.ts
│   │   ├── comments/
│   │   ├── likes/
│   │   └── follows/
│   ├── types/                 # Shared TS types
│   │   ├── express.d.ts
│   │   └── responses.ts
│   ├── utils/                 # Helpers (pagination, sanitize, etc.)
│   │   ├── pagination.ts
│   │   ├── sanitize.ts
│   │   └── jwt.ts
│   └── index.ts               # Entry point: create app, listen
├── tests/                     # Integration tests
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Client (`client/`)

```
client/
├── public/
├── src/
│   ├── app/                   # Providers, router, query client
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── components/            # Shared UI components
│   │   ├── ui/                # Primitives: Button, Input, Modal, Avatar, Skeleton
│   │   └── layout/            # Navbar, Sidebar, MainLayout
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   │   ├── pages/         # LoginPage, RegisterPage
│   │   │   └── hooks/         # useLogin, useRegister, useAuth
│   │   ├── feed/
│   │   │   ├── pages/         # FeedPage
│   │   │   └── components/    # PostCard, PostList
│   │   ├── profile/
│   │   │   ├── pages/         # ProfilePage, EditProfilePage
│   │   │   └── components/    # ProfileHeader, ProfileTabs
│   │   ├── posts/
│   │   │   ├── pages/         # PostDetailPage
│   │   │   └── components/    # PostForm, PostCard
│   │   └── comments/
│   │       └── components/    # CommentList, CommentForm
│   ├── hooks/                 # Shared hooks: usePaginatedQuery, useDebounce
│   ├── services/              # Axios instance, API client functions
│   │   ├── api.ts
│   │   ├── auth.api.ts
│   │   ├── posts.api.ts
│   │   └── users.api.ts
│   ├── lib/                   # TanStack Query key factory, constants
│   │   └── query-keys.ts
│   ├── utils/                 # formatDate, cn(), validators
│   │   └── cn.ts
│   ├── types/                 # Shared frontend types
│   │   └── index.ts
│   └── main.tsx
├── tests/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── Dockerfile
```

### Root

```
social-media-platform/
├── server/           (Express API)
├── client/           (React SPA)
├── docker-compose.yml
├── .env.example
├── .gitignore
├── AGENTS.md
├── DESIGN.md
└── README.md
```

---

## 3. Data Model (Prisma Schema)

```
User
├── id            UUID  PK
├── username      String  unique
├── email         String  unique
├── passwordHash  String
├── fullName      String
├── bio           String?
├── avatar        String?
├── coverImage    String?
├── posts         Post[]
├── comments      Comment[]
├── likes         Like[]
├── followers     Follow[]  (@relation "following")
├── following     Follow[]  (@relation "follower")
├── createdAt     DateTime
└── updatedAt     DateTime
  INDEX: username, email

Post
├── id            UUID  PK
├── authorId      UUID  FK -> User.id (CASCADE)
├── content       String
├── imageUrl      String?
├── author        User
├── comments      Comment[]
├── likes         Like[]
├── createdAt     DateTime
└── updatedAt     DateTime
  INDEX: authorId, createdAt DESC

Comment
├── id            UUID  PK
├── postId        UUID  FK -> Post.id (CASCADE)
├── authorId      UUID  FK -> User.id (CASCADE)
├── content       String
├── post          Post
├── author        User
└── createdAt     DateTime
  INDEX: postId, authorId

Like
├── id            UUID  PK
├── postId        UUID  FK -> Post.id (CASCADE)
├── userId        UUID  FK -> User.id (CASCADE)
├── post          Post
├── user          User
  UNIQUE: (postId, userId)
  INDEX: postId, userId

Follow
├── followerId    UUID  FK -> User.id (CASCADE)
├── followingId   UUID  FK -> User.id (CASCADE)
├── follower      User   (@relation "follower")
├── following     User   (@relation "following")
├── createdAt     DateTime
  PK: (followerId, followingId)
  INDEX: followerId, followingId
```

---

## 4. API Design (REST)

### Authentication

| Method | Path                | Auth | Description       |
|--------|---------------------|------|-------------------|
| POST   | /api/auth/register  | No   | Create account    |
| POST   | /api/auth/login     | No   | Sign in           |
| POST   | /api/auth/logout    | Yes  | Sign out          |
| POST   | /api/auth/refresh   | No   | Rotate tokens     |
| GET    | /api/auth/me        | Yes  | Current user      |

### Users

| Method | Path                     | Auth | Description        |
|--------|--------------------------|------|--------------------|
| GET    | /api/users               | No   | List (paginated)   |
| GET    | /api/users/:id           | No   | Profile + counts   |
| PATCH  | /api/users/:id           | Yes  | Update own profile |
| POST   | /api/users/:id/follow    | Yes  | Follow             |
| DELETE | /api/users/:id/follow    | Yes  | Unfollow           |

### Posts

| Method | Path                  | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | /api/posts            | No   | Feed (paginated)     |
| GET    | /api/posts/:id        | No   | Single post + author |
| POST   | /api/posts            | Yes  | Create               |
| PATCH  | /api/posts/:id        | Yes  | Update (owner only)  |
| DELETE | /api/posts/:id        | Yes  | Delete (owner only)  |
| GET    | /api/users/:id/posts  | No   | User's posts         |

### Comments

| Method | Path                        | Auth | Description          |
|--------|-----------------------------|------|----------------------|
| GET    | /api/posts/:id/comments     | No   | List (paginated)     |
| POST   | /api/posts/:id/comments     | Yes  | Create               |
| DELETE | /api/comments/:id           | Yes  | Delete (owner only)  |

### Likes

| Method | Path                  | Auth | Description |
|--------|-----------------------|------|-------------|
| POST   | /api/posts/:id/like   | Yes  | Like        |
| DELETE | /api/posts/:id/like   | Yes  | Unlike      |

### Response Format (all endpoints)

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, message: "error description" }

// Validation Error
{ success: false, errors: [{ field: "email", message: "invalid" }] }
```

### Pagination

All list endpoints accept `?cursor=<id>&limit=20`. Response returns:
```typescript
{ success: true, data: [...], nextCursor: "<id>" | null }
```

---

## 5. Authentication Flow

```
Registration:
  1. Client POST /api/auth/register { username, email, password }
  2. Server validates (Zod), hashes password (bcrypt, 12 rounds)
  3. Creates user via Prisma
  4. Generates accessToken (15min) + refreshToken (7d)
  5. Sets refreshToken as httpOnly cookie
  6. Returns { user, accessToken }

Login:
  1. Client POST /api/auth/login { email, password }
  2. Server verifies credentials
  3. Same token generation as registration

Token Refresh:
  1. Axios interceptor catches 401
  2. Client POST /api/auth/refresh (cookie sent automatically)
  3. Server verifies refreshToken, issues new pair
  4. Retries original request

Logout:
  1. Client POST /api/auth/logout
  2. Server clears refreshToken cookie
  3. Client clears in-memory accessToken
```

---

## 6. Frontend Routes

| Path              | Component         | Auth Required | Description     |
|-------------------|-------------------|:-------------:|-----------------|
| /                 | FeedPage          | No            | Global feed     |
| /login            | LoginPage         | No            | Sign in         |
| /register         | RegisterPage      | No            | Create account  |
| /profile/:id      | ProfilePage       | No            | User profile    |
| /profile/:id/edit | EditProfilePage   | Yes           | Edit profile    |
| /posts/:id        | PostDetailPage    | No            | Post + comments |

---

## 7. Component Tree (Key Pages)

### FeedPage
```
FeedPage
├── PostForm (if authenticated)
└── PostList
    ├── PostCard (×N)
    │   ├── Avatar + Author
    │   ├── Content
    │   ├── Image (optional)
    │   ├── LikeButton + Count
    │   ├── CommentCount (link to detail)
    │   └── DeleteButton (if owner)
    └── LoadMore / InfiniteScroll
```

### ProfilePage
```
ProfilePage
├── ProfileHeader
│   ├── CoverImage
│   ├── Avatar
│   ├── Username + FullName
│   ├── Bio
│   ├── FollowButton (if not self)
│   └── Stats (posts, followers, following)
├── EditButton (if self)
└── ProfileTabs
    ├── Posts (PostList)
    └── Likes (PostList)
```

### PostDetailPage
```
PostDetailPage
├── PostCard (expanded)
└── CommentSection
    ├── CommentForm (if authenticated)
    └── CommentList
        └── CommentItem (×N)
            ├── Avatar + Author
            ├── Content
            ├── Timestamp
            └── DeleteButton (if owner)
```

---

## 8. Security Architecture

| Measure              | Implementation                         |
|----------------------|----------------------------------------|
| Password hashing     | bcrypt (12 salt rounds)                |
| JWT signing          | HS256 with env secret                  |
| Access token expiry  | 15 minutes                             |
| Refresh token expiry | 7 days (httpOnly cookie)               |
| Input validation     | Zod schemas on every endpoint          |
| Rate limiting        | express-rate-limit (100/15min general) |
| Security headers     | helmet middleware                      |
| CORS                 | Configured for client origin only      |
| SQL injection        | Prisma (parameterized queries)         |
| XSS prevention       | DOMPurify on user content              |
| CSRF protection      | SameSite=Strict on cookies             |

---

## 9. Implementation Phases

### Phase 1 — Foundation
Initialize monorepo, configure TypeScript, ESLint, Prettier, Prisma, Docker Compose, env templates, Vite + Tailwind.

### Phase 2 — Authentication Backend + Frontend
Auth module (controller, service, validator, routes), JWT middleware, auth API client, login/register pages, protected route HOC, auth context.

### Phase 3 — User Profiles
User module (CRUD), avatar/cover upload (multer → local storage), follow/unfollow, profile page, edit profile page.

### Phase 4 — Posts
Post module (CRUD), feed with cursor pagination, image upload, feed page, post creation form, post detail page.

### Phase 5 — Comments
Comment module (CRUD), paginated comment list, comment form, delete own comments.

### Phase 6 — Likes
Like/unlike module, optimistic UI updates via TanStack Query, like button with count.

### Phase 7 — Polish, Testing, Docs
Error boundaries, skeleton loaders, empty states, toast notifications, integration tests (auth, posts, comments, likes, follows), README, API docs.

---

## 10. Key Design Decisions

1. **Cursor pagination over offset** — Stable for real-time feeds where new posts shift offsets.
2. **Module-based folders (not layers)** — Features are cohesive; controller/service/repository live together.
3. **Repository pattern** — Prisma calls abstracted behind repositories for testability.
4. **httpOnly refresh token** — Prevents XSS from stealing long-lived tokens.
5. **In-memory access token** — Not stored in localStorage; set via login response, held in JS memory.
6. **Optimistic updates for likes** — TanStack Query `onMutate` updates cache immediately, rolls back on error.
7. **Local file uploads** — `uploads/` directory served statically; swap to S3/CDN for production.
8. **DOMPurify on content** — Sanitize user HTML before rendering to prevent XSS.

---

## Audit Summary

A full Playwright audit was conducted across all 10 pages of the application. Key findings:

## Frontend Bug Fixes

1. **EditProfilePage redirect loop** — Moved `navigate()` into a `useEffect` block to prevent render-cycle redirect conflicts.
2. **Stale comment count** — Comment mutation now invalidates the post detail query key in addition to the comments query key, so the post card shows the updated count.
3. **Profile page missing posts** — ProfilePage was not fetching the user's posts. Added a separate `useInfiniteQuery` with query key `["users", id, "posts"]` and a paginated list below the profile card.
4. **Follow toggle unreliable** — The server's getUserById was using a Prisma `select` spread that caused type errors and didn't work. Fixed by making a separate `follow.findUnique` call to check the follow status.
5. **404 missing** — Added a catch-all route with a styled 404 page and "Go home" link.
6. **Auth page redirects** — LoginPage and RegisterPage now use `useEffect` to redirect logged-in users to `/`.

## UI Redesign: Dark Theme

### Color Palette
- **Background:** `#0b0b10` (near-black with subtle blue tint)
- **Surface/cards:** `#13131a` with `#1e1e2a` borders
- **Primary accent:** Purple gradient (`#6d28d9` → `#8b5cf6`)
- **Secondary accent:** Cyan/teal (`#22d3ee`) used sparingly for contrast
- **Text primary:** `#e2e8f0`, **secondary:** `#94a3b8`, **muted:** `#64748b`, **placeholder:** `#475569`
- **Error:** `#ef4444` / `#dc2626`

### Typography
- **Headings:** Plus Jakarta Sans (Google Fonts), loaded with `font-display: swap`
- **Body:** DM Sans
- Implemented via `tailwind.config.ts` font family extensions and CSS variables.

### Components
- **Button:** Three variants — `primary` (purple gradient with shadow), `secondary` (surface border), `ghost` (text only). Loading spinner on all.
- **Input:** Dark surface background, subtle border, focus ring in purple/30.
- **Avatar:** Gradient border ring (`from-primary-dark to-primary`), configurable sizes (sm/md/lg).
- **Skeleton:** Shimmer animation with `bg-gradient-to-r` moving across.
- **Card:** Utility class `.card` in `index.css` — `bg-[#13131a]` with `rounded-xl`, `border`, `p-4`.
- **Navbar:** Glass-morphism effect (`backdrop-blur-md`, `bg-[#0b0b10]/80`), fixed top, sticky, with gradient accent line at bottom.

### Page-level Dark Theme Changes
- **Auth pages (Login/Register):** Gradient illustration panel on the left (dark), form on the right (dark card), with dark inputs and branded button.
- **Feed page:** Card-based post list with shimmer loading skeletons, empty state message.
- **Post detail page:** Full-width post card with comment section below.
- **Profile page:** Cover image area (gradient fallback), avatar overlapping, stats row, edit/follow button, paginated post list.
- **Edit profile page:** Dark card form with dark textarea and inputs.
- **404 page:** Large `#2a2a44` heading, muted text, gradient button.
