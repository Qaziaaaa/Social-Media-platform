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

## UI Redesign v2: Lumina Social (Light Theme)

The application was redesigned from a dark theme to the **Lumina Social** light theme — a premium, airy, professional design system inspired by Material You principles.

### Brand & Style
Professional yet approachable. Characterized by expansive whitespace, a refined indigo-based color palette, and a sophisticated tonal layering system. Emotional response: calm focus, reliability, and effortless navigation.

### Design System Source
The UI folder at `UI/stitch_social_media_platform_monorepo/` contains reference HTML/CSS screens for each page. The design system spec is at `UI/stitch_social_media_platform_monorepo/lumina_social/DESIGN.md`.

### Color Palette (Light Mode)
- **Background:** `#faf8ff` (warm off-white)
- **Surface/cards:** `#ffffff` (pure white) with `#e2e7ff` borders
- **Primary (Indigo):** `#3525cd` — buttons, links, active states
- **Primary Container:** `#4f46e5` — hover states
- **Surface Container Low:** `#f2f3ff` — comment bubbles
- **Text on-surface:** `#131b2e`, **on-surface-variant:** `#464555`
- **Outline:** `#777587`, **outline-variant:** `#c7c4d8`
- **Accent colors:** Emerald (`#006c49`) for follow, Rose (`#95002b`) for likes
- **Error:** `#ba1a1a`

### Typography
- **Headings:** Plus Jakarta Sans (700/800), matched via custom `font-size` tokens (`display-lg` through `headline-md`)
- **Body:** Inter (400/600), with `body-lg` through `label-sm` size tokens
- Uses Tailwind's `fontFamily` extensions (`display`, `body`) and custom `fontSize` definitions matching the design spec exactly

### Layout
- **3-column layout** on desktop: sidebar (256px) | feed (640px max) | widgets (320px)
- **Mobile:** fixed top bar (backdrop-blur) + content + fixed bottom nav bar
- Max content width: 1280px, 8px spacing rhythm
- Cards use `rounded-xl` (16px), buttons use `rounded-lg` (8px)

### Icons
- **Material Symbols** (Google Material Icons) — loaded via Google Fonts stylesheet
- Variable font support (`FILL`, `wght` axes) for filled/outlined states
- Replaced all inline SVG icons with `<span class="material-symbols-outlined">icon_name</span>`

### Components (Redesigned)
- **Button:** Primary (solid indigo `#3525cd`), Secondary (white + outlined), Ghost (transparent). Focus ring with `ring-[3px] ring-primary/20`. Active scale effect.
- **Input:** White background, `border-outline-variant`, indigo focus ring (`ring-[3px] ring-primary/10`), Material icon prefix support.
- **Avatar:** Circular with `ring-2 ring-surface` white border. Fallback shows indigo background with initial.
- **Skeleton:** Shimmer using `surface-container-low` through `surface-container-high` gradient.
- **Card:** `bg-surface` (`#ffffff`) with `rounded-xl` (16px), `ambient-shadow` (12px blur, 8% opacity), `border border-surface-container-high`.
- **Comment Bubble:** `bg-surface-container-low` (`#f2f3ff`) with `rounded-xl rounded-tl-none` for speech-bubble effect.

### Navigation (Redesigned)
- **Desktop Sidebar** (`hidden md:flex`): Brand logo, user avatar+name, nav links with filled icon on active, "Create Post" button, logout link. Sticky, full height, scrollable.
- **Mobile Top Bar** (`md:hidden`): Brand name, notification bell, avatar. Fixed, backdrop-blur.
- **Mobile Bottom Nav** (`md:hidden`): Home, Explore, Profile icons with filled state for active. Fixed bottom with safe-area padding.

### Page Redesigns
- **LoginPage:** Full-height split panel — decorative image left (gradient overlay, tagline), form right (brand anchor, email with mail icon, password with lock icon, remember me checkbox, social login buttons, sign-up link).
- **RegisterPage:** Full-height split panel — testimonial quote left (backdrop-blur card), form right (brand anchor, full name/email/username with @ prefix/password fields, terms checkbox, Google signup, login link).
- **FeedPage:** PostForm (avatar + textarea + image/mood icon buttons + Post button) + PostList (infinite scroll cards). Right sidebar shows trending topics.
- **PostCard:** White card with avatar row, content text, image (bordered), action bar (favorite outlined/filled, chat_bubble, repeat, share) — all with hover scale effects.
- **PostDetailPage:** Single post card expanded + CommentSection below.
- **CommentSection:** Section header with count, comment form (avatar + textarea + Reply button), comment list with speech-bubble style (`bg-surface-container-low rounded-xl rounded-tl-none`), favorite/reply action buttons.
- **ProfilePage:** Cover image (192px/256px), avatar offset (-top-16 with 4px white border), Edit Profile/Follow button, name+bio, stats row (Posts/Followers/Following), tab bar (Posts/Likes/Media), paginated post list.
- **EditProfilePage:** Light theme form with outlined inputs, indigo focus styles, Save/Cancel buttons.
- **404 page:** Large `surface-container-high` heading, muted text, indigo pill button.
- **Widgets sidebar (right):** Trending topics, footer links (About, Help, Privacy, Terms). Sticky, scrollable.

---

## Instagram Gap Analysis & Implementation Roadmap

### Current State vs Instagram

| Area | Current | Instagram Target | Gap |
|------|---------|-----------------|:---:|
| Auth | Email/password, JWT refresh | Email + Google OAuth + password reset | Medium |
| Posts | Text + single image, create/delete | Text + multiple images/video, create/edit/delete/archive | Medium |
| Comments | Flat, create/delete (delete API exists, no UI) | Nested replies, edit, like, pin | Large |
| Likes | Post like/unlike | Post + comment likes | Small |
| Follows | Follow/unfollow, count | Follow + close friends + mute | Medium |
| Search | None | User search, hashtag search, explore page | Large |
| Hashtags | None | Parse, link, search, trending | Large |
| Profile | View, edit text fields | Avatar/cover upload, grid layout, highlights | Medium |
| Notifications | None | Like, follow, comment, mention alerts | Large |
| Messages | None | DMs, group chats, read receipts | Large |
| Stories | None | 24h ephemeral photos/video, reactions | Large |
| Bookmarks | None | Save posts to collections | Large |
| Repost/Share | UI icons only | Repost to feed, share externally | Large |
| Explore | None | Algorithmic discovery, trending content | Large |
| Real-time | None | WebSocket for live updates | Large |

### Implementation Roadmap — 5 Phases

---

## Phase 1: Core Social UI (High Priority — fills existing gaps)

*Estimated effort: 3-5 days*

**Goal:** Complete all half-implemented features and fix UI gaps so every existing backend endpoint has a frontend counterpart.

### 1.1 Delete comment from UI
- **Server:** ✅ Already exists (`DELETE /api/comments/:id`, owner-only)
- **Client:** Add delete button (with confirm) to CommentSection for own comments
- **Files:** `client/src/modules/posts/components/CommentSection.tsx`

### 1.2 Edit post from UI
- **Server:** ✅ Already exists (`PATCH /api/posts/:id`, owner-only)
- **Client:** Add "Edit" option on own PostCard (inline edit or modal)
- **Files:** `client/src/modules/posts/components/PostCard.tsx` + new `EditPostModal.tsx`

### 1.3 Avatar & cover image upload in EditProfilePage
- **Server:** ✅ Already supports `avatar` and `coverImage` fields on User model; upload endpoint exists
- **Client:** Add file input for avatar + cover in EditProfilePage, upload via `/api/upload`, save URL
- **Files:** `client/src/modules/profile/pages/EditProfilePage.tsx`

### 1.4 Comment likes (server + client)
- **Server:** New `CommentLike` model + `POST/DELETE /api/comments/:id/like`
- **Client:** Wire up the favorite button in CommentSection, show count
- **Schema change:** New model
- **Files:** `schema.prisma`, new `comment-like` module, `CommentSection.tsx`

### 1.5 Profile Likes/Media tabs
- **Server:** `GET /api/users/:id/liked-posts` + `GET /api/users/:id/media-posts`
- **Client:** Tab switching on ProfilePage with separate queries
- **Files:** `user.service.ts`, `user.controller.ts`, `user.routes.ts`, `ProfilePage.tsx`

### 1.6 Loading/empty/error states on widgets sidebar
- **Client:** Replace hardcoded trending mock with real data (or remove if no endpoint)
- **Files:** `MainLayout.tsx`

**Deliverable:** All existing backend endpoints have a working frontend. No more greyed-out or non-functional UI elements.

---

## Phase 2: Discovery & Navigation (Medium Priority)

*Estimated effort: 5-7 days*

**Goal:** Users can search for content, discover new people, and navigate via hashtags.

### 2.1 Explore/Search page
- **Server:** `GET /api/search?q=&type=users|posts|hashtags` — full-text search across users and posts
- **Client:** New `/explore` route with search bar, user results, post results, trending section
- **Files:** New `search` module (server), new `ExplorePage` + `SearchBar` component (client)

### 2.2 User search endpoint
- **Server:** Add `search` query param to `GET /api/users` with `WHERE username ILIKE` or `fullName ILIKE`
- **Files:** `user.service.ts`

### 2.3 Hashtag system
- **Server:** Parse `#hashtag` from post content on create/edit, store in `Hashtag` model + join table `PostHashtag`. Endpoint: `GET /api/hashtags/:tag/posts`
- **Client:** Render hashtags as clickable links in PostCard, linked to search/explore
- **Schema change:** New `Hashtag` + `PostHashtag` models
- **Files:** Multiple — new `hashtag` module, update `post.service.ts`, `PostCard.tsx`

### 2.4 User recommendations ("You might like")
- **Server:** `GET /api/users/suggestions` — recommend users not followed, based on shared follows
- **Client:** Show in right sidebar widget, replace hardcoded data
- **Files:** `user.service.ts`, `MainLayout.tsx`

### 2.5 Real trending widget
- **Server:** `GET /api/trending` — return most-used hashtags or most-liked posts
- **Client:** Wire up trending widget in sidebar
- **Files:** New `trending` service/route, `MainLayout.tsx`

**Deliverable:** Users can search, discover, and navigate via hashtags. Explore page replaces dead `/explore` link.

---

## Phase 3: Engagement & Content (Medium Priority)

*Estimated effort: 5-8 days*

**Goal:** Richer content interactions — nested replies, bookmarks, reposts, and content tagging.

### 3.1 Nested/reply comments
- **Schema:** Add `parentId` (self-relation) to `Comment` model
- **Server:** Update comment creation to support `parentId`. Return nested structure on GET
- **Client:** Indent replies under parent comments in CommentSection
- **Schema change:** Comment model gets optional `parentId` FK
- **Files:** `schema.prisma`, `comment.service.ts`, `CommentSection.tsx`

### 3.2 Bookmark / Saved posts
- **Schema:** New `Bookmark` model (`userId` + `postId`, unique constraint)
- **Server:** `POST/DELETE /api/posts/:id/bookmark`, `GET /api/users/me/bookmarks`
- **Client:** Bookmark icon on PostCard (fills on save), bookmarks page/list
- **Schema change:** New model
- **Files:** New `bookmark` module, `PostCard.tsx`, new `BookmarksPage.tsx`

### 3.3 Repost / Share
- **Schema:** Add `originalPostId` (self-relation) to `Post` model
- **Server:** `POST /api/posts/:id/repost` — creates a new post with `originalPostId`, copies content
- **Client:** Repost icon on PostCard, show "X reposted" indicator
- **Schema change:** Post model gets optional `originalPostId` FK
- **Files:** `schema.prisma`, `post.service.ts`, `PostCard.tsx`

### 3.4 Pin post to profile
- **Server:** Add `isPinned` field to Post, `PATCH /api/posts/:id/pin`
- **Client:** Pin icon on own posts, pinned post shows first on profile
- **Schema change:** Post model gets `isPinned` boolean
- **Files:** `schema.prisma`, `post.service.ts`, `ProfilePage.tsx`

### 3.5 Post likes list
- **Server:** `GET /api/posts/:id/likes` — return users who liked
- **Client:** Clicking like count shows a small modal/list
- **Files:** `like.service.ts`, `PostCard.tsx`

**Deliverable:** Content interactions feel complete — nested conversations, save for later, share content, pin important posts.

---

## Phase 4: Real-time & Communication (High Value)

*Estimated effort: 7-10 days*

**Goal:** Real-time notifications and direct messaging — the two biggest engagement drivers.

### 4.1 Notifications system
- **Schema:** New `Notification` model (`id`, `userId` [recipient], `actorId`, `type` [like|follow|comment|mention|repost], `postId?`, `commentId?`, `read`, `createdAt`)
- **Server:** Create notifications on like, follow, comment, repost. `GET /api/notifications` (paginated), `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- **Client:** New NotificationsPage, notification badge on bell icon, dropdown in sidebar
- **Schema change:** New model
- **Files:** New `notification` module, `Navbar.tsx`, new `NotificationsPage.tsx`

### 4.2 WebSocket integration
- **Install:** `socket.io` on server, `socket.io-client` on client
- **Server:** Emit events on new notification, new message, feed update
- **Client:** Connect on auth, listen for real-time updates
- **Files:** New `socket` module/server setup, client socket hook

### 4.3 Direct Messages
- **Schema:** New `Conversation`, `ConversationParticipant`, `Message` models
- **Server:** `POST /api/conversations`, `POST /api/conversations/:id/messages`, `GET /api/conversations`, `GET /api/conversations/:id/messages`
- **Client:** New MessagesPage, conversation list, chat view with real-time delivery
- **Schema change:** 3 new models
- **Files:** New `message` module, new `MessagesPage.tsx`, `ChatView.tsx`, `ConversationList.tsx`

### 4.4 Notification generation (backend hooks)
- Integrate notification creation into: `like.service.ts` (on like), `comment.service.ts` (on comment), `follow.service.ts` (on follow), `post.service.ts` (on repost)
- **Files:** Update existing services

**Deliverable:** Live notifications keep users engaged. DMs provide private communication. WebSocket enables real-time updates across the app.

---

## Phase 5: Polish & Infrastructure

*Estimated effort: 5-10 days*

**Goal:** Production readiness — stories, dark mode, cloud storage, testing, and deployment config.

### 5.1 Stories (ephemeral content)
- **Schema:** New `Story` model (`id`, `userId`, `imageUrl`, `createdAt`, `expiresAt`)
- **Server:** `POST /api/stories`, `GET /api/stories/feed` (unexpired stories from followed users + latest 24h)
- **Client:** Story rings at top of feed, tap-through viewer, auto-expire after 24h
- **Schema change:** New model
- **Files:** New `story` module, `StoryViewer.tsx`, `StoryRings.tsx`

### 5.2 Dark mode toggle
- **Client:** Add `darkMode: "class"` to tailwind config, create a dark theme color palette, add toggle in Navbar
- **Server:** No changes needed
- **Files:** `tailwind.config.ts`, `index.css`, `Navbar.tsx`, `index.html`

### 5.3 Cloud storage (S3-compatible)
- **Server:** Replace multer local storage with `multer-s3` or `@aws-sdk/client-s3`
- **Files:** `upload.config.ts`

### 5.4 Testing suite
- **Server:** Vitest + supertest for API integration tests (auth flow, CRUD endpoints)
- **Client:** Vitest + React Testing Library for component tests, MSW for API mocking
- **Files:** New `*.test.ts` files throughout both packages

### 5.5 CI/CD
- **GitHub Actions:** Lint → typecheck → test → build on push/PR
- **Files:** New `.github/workflows/ci.yml`

### 5.6 Accessibility audit & fixes
- **Client:** Add `aria-*` attributes, keyboard navigation, focus management, screen reader labels
- **Files:** Updated throughout

### 5.7 Production deployment config
- **Server:** Docker multi-stage builds, health check endpoint, graceful shutdown
- **Client:** Nginx config for SPA routing, caching headers
- **Infra:** docker-compose.prod.yml, env templates

**Deliverable:** Production-ready app with stories, dark mode, cloud storage, tests, and CI/CD.

---

## Summary by Scope

| Phase | New Server Modules | New Client Pages | Schema Changes | Est. Days |
|:-----:|:------------------:|:----------------:|:--------------:|:---------:|
| 1 | 1 (comment-like) | 0 | 1 model | 3-5 |
| 2 | 3 (search, hashtag, trending) | 1 (explore) | 2 models | 5-7 |
| 3 | 2 (bookmark, repost) | 1 (bookmarks) | 4 fields/models | 5-8 |
| 4 | 3 (notification, message, socket) | 3 | 5 models | 7-10 |
| 5 | 1 (story) | 1 (stories) | 1 model | 5-10 |
| **Total** | **10** | **6** | **13 models/fields** | **25-40** |
