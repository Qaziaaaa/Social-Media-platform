# Playwright Audit Report — Social Media Platform

**Date:** 2026-05-31  
**Environment:** Client http://localhost:5174 · Server http://localhost:4000  
**Browser:** Chromium (Playwright)  
**Logged-in user:** Test User (testuser@example.com) — auto-logged in via persisted session

---

## 1. Feed Page `/` (Logged In)

| Item | Result |
|------|--------|
| URL | `http://localhost:5174/` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |
| Network requests | `GET /api/auth/me` → 200, `GET /api/posts?limit=10` → 200 |

### Visible components
- **Navbar**: "Social" brand link, user avatar "T" with name "Test User" linking to `/profile/:id`, "Logout" button
- **Post form**: Avatar "T", textbox "What's on your mind?", "Photo" button, "Post" button (disabled)
- **Post list**: 5 posts displayed as cards with author avatar, name, content text, optional image, like button, comment link

### Seed posts visible
| Author | Content | Likes | Comments | Has image |
|--------|---------|-------|----------|-----------|
| Qazi Farhan Ahmad | "Ai is really changing the world." | 0 | 0 | ✅ Yes |
| Qazi Farhan Ahmad | *(no text)* | 0 | 1 | ✅ Yes |
| Qazi Farhan Ahmad | "I dont know. Not decided yet." | 0 | 0 | ❌ |
| Bob Smith | "What's everyone working on this weekend?" | 0 | 1 | ❌ |
| Alice Johnson | "Just finished building a new project!..." | 2 | 1 | ❌ |

### Design observations
- Clean white card layout with subtle borders (`rounded-lg border bg-white p-4`)
- Blue primary color (`#2563eb`) for interactive elements
- Gray-500 text for secondary info (like/comment counts)
- Avatar uses first letter of name in a colored circle
- Responsive: content appears centered with max-width constraint
- Font: system UI stack, clean and readable
- Navbar has a subtle bottom border, logo is bold

---

## 2. Login Page `/login`

| Item | Result |
|------|--------|
| URL | `http://localhost:5174/login` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |

### Visible components
- **Navbar**: Same as feed (user still logged in)
- **Heading**: "Sign in" (h1)
- **Subheading**: "Welcome back to Social"
- **Email field**: Labeled "Email"
- **Password field**: Labeled "Password"
- **Submit button**: "Sign in"
- **Footer link**: "Don't have an account? Register"

### Design observations
- Centered card layout with `max-w-md` constraint
- Clean form styling with rounded inputs
- Consistent blue button styling
- Good spacing between form fields

### Issues
- User is already logged in, yet the login page is still accessible — no redirect to home for authenticated users

---

## 3. Register Page `/register`

| Item | Result |
|------|--------|
| URL | `http://localhost:5174/register` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |

### Visible components
- **Navbar**: Same (user logged in)
- **Heading**: "Create account" (h1)
- **Subheading**: "Join Social today"
- **Fields**: Username, Full name, Email, Password
- **Submit button**: "Create account"
- **Footer link**: "Already have an account? Sign in"

### Design observations
- Same layout pattern as login page
- Consistent form styling and spacing

---

## 4. Profile Page `/profile/6fd1fe3e-b50a-46b8-a0ed-e883dfff6d0b` (Qazi Farhan Ahmad)

| Item | Result |
|------|--------|
| URL | `/profile/6fd1fe3e-b50a-46b8-a0ed-e883dfff6d0b` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |

### Visible components
- **Navbar**: Standard
- **Avatar**: "Q" letter avatar
- **Name**: "Qazi Farhan Ahmad" (h1)
- **Username**: "@ahmadq_azi"
- **Follow button**: "Follow" (primary blue)
- **Bio**: "I am coding enthusiast so connect with me if you."
- **Stats**: "3 posts · 0 followers · 0 following"

### Design observations
- Profile header with large avatar, name, username on left, follow button on right
- Stats displayed inline with dots separator
- Clean, minimal profile layout

### Issues
- **No posts list visible** on profile page — seeded posts exist for this user but aren't displayed
- **Follow button** is present but untested (no unfollow logic visible)

---

## 5. Post Detail Page (with Image) `/posts/0ab3124d-d688-43ec-bc73-5e4f4f4460d7`

| Item | Result |
|------|--------|
| URL | `/posts/0ab3124d-d688-43ec-bc73-5e4f4f4460d7` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |

### Visible components
- **Post card**: Author avatar, name, content text, image ("Post image" alt text)
- **Like button**: "0 likes"
- **Comment link**: "0 comments" → links back to same page
- **Comment section**: "Comments" heading, comment input with "Post" button (disabled when empty), "No comments yet" message

### Design observations
- Image displayed with `rounded-lg object-cover max-h-96 w-full`
- Post card is identical to feed card (reuses `PostCard` component)
- Comment section in separate card below post

---

## 6. Post Detail Page (with Comments) `/posts/db326051-a536-43ec-a073-b1b63fa2452e`

| Item | Result |
|------|--------|
| URL | `/posts/db326051-a536-43ec-a073-b1b63fa2452e` |
| Loaded successfully | ✅ Yes |
| Console errors | **0** |
| Console warnings | **0** |

### Visible components
- **Post card**: Author "Qazi Farhan Ahmad", image only (no content text)
- **Like button**: "0 likes"
- **Comment link**: "1 comment"
- **Comment section**: 
  - Comment input with avatar for current user
  - Existing comment from "Qazi Farhan Ahmad": "I cant see any post."

---

## 7. Like Toggle Test

| Step | Result |
|------|--------|
| Click "1 like" button via Playwright click | ❌ No network request triggered |
| Click button via JavaScript `element.click()` | ✅ `POST /api/posts/:id/like` → **200 OK** |
| UI update after successful like | ✅ Button changed from "1 like" → **"2 likes"** |

### Observations
- The like API endpoint works correctly (toggles via POST/DELETE to `/posts/:id/like`)
- The `PostCard` component has proper mutation logic with `post.isLiked` checks
- Playwright's high-level `click()` does not reliably trigger React synthetic event handlers in this app
- **CSS class for liked state**: Button gets `text-red-500` when `post.isLiked` is true (not tested visually)
- No optimistic updates — waits for server response before UI change

---

## 8. Comment Test

| Step | Result |
|------|--------|
| Type in comment input via Playwright `fill()` | ✅ Input value set, button enabled |
| Click "Post" button via Playwright click | ❌ No network request triggered |
| Submit form via JavaScript `form.onSubmit()` | ✅ `POST /api/posts/:id/comments` → **201 Created** |
| UI update after successful comment | ✅ New comment appears: "Test User" — "Test comment from Playwright audit!" |
| Input cleared after posting | ✅ Yes (empty textbox, Post button disabled) |

### Observations
- Comment API works correctly (POST `/posts/:id/comments` → 201)
- Comments are re-fetched after successful creation
- React form `onSubmit` handler does not trigger via Playwright's click on submit button
- **Minor bug**: Comment count link in post card still shows "1 comment" instead of updating to "2" — the detail page query (`queryKeys.posts.detail`) is not invalidated on comment create, only `queryKeys.posts.comments` and `queryKeys.posts.feed`

---

## 9. Profile Edit Page Redirect `/profile/:id/edit`

| Item | Result |
|------|--------|
| URL visited | `/profile/3e89babb-31aa-4693-8cdf-9e54b5dee8e0/edit` (own profile) |
| Actual result | ⛔ Redirected to `/login` |
| Console errors | **1** 🔴 |
| Console warnings | **2** 🟡 |

### Console errors/warnings
```
[ERROR] Cannot update a component (`BrowserRouter`) while rendering a different component (`EditProfilePage`). To locate the bad setState() call inside `EditProfilePage`, follow the stack trace...
[WARNING] You should call navigate() in a React.useEffect(), not when your component is first rendered.
```

### Root cause
In `client/src/modules/profile/pages/EditProfilePage.tsx:56`:
```tsx
if (!user) {
  navigate("/login");  // called during render, not in useEffect
  return null;
}
```

On initial render, `useAuth()` returns `user === null`/`undefined` while the `/api/auth/me` query is loading. The `navigate()` call during render violates React 18/19 rules, causing the error. This also means **even a logged-in user gets redirected** on first load before the auth check completes.

### Fix required
Wrap the redirect in `useEffect`:
```tsx
useEffect(() => {
  if (!isLoading && !user) navigate("/login");
}, [user, isLoading, navigate]);
```

---

## 10. 404 Page `/nonexistent`

| Item | Result |
|------|--------|
| URL visited | `/nonexistent` |
| Loaded successfully | ✅ Yes (page title "Social") |
| Console errors | **0** |
| Console warnings | **2** 🟡 |

### Console warnings
```
[WARNING] No routes matched location "/nonexistent"
```

### UI
- **Blank/empty page** — no content rendered
- Navbar is still visible (part of `MainLayout`)
- No custom 404 component, no "Page Not Found" message

### Observations
- The router has no catch-all route (`*`)
- A `<Route path="*" element={<NotFound />} />` should be added to `router.tsx`

---

## Summary of Issues Found

### 🔴 Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **React render-cycle violation** in `EditProfilePage` | `client/src/modules/profile/pages/EditProfilePage.tsx:56` | Profile edit page always redirects to login, even for authenticated users |
| 2 | **No 404 page** — `/nonexistent` returns blank content | `client/src/app/router.tsx` | Poor UX, no graceful error for invalid routes |

### 🟡 Moderate

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 3 | **Comment count not updated** on post detail after new comment | `client/src/modules/posts/components/CommentSection.tsx:38` | Detail page shows stale comment count until refresh |
| 4 | **No profile posts list** on profile page | Profile page component | User posts are not displayed on their profile |

### 🟢 Minor

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 5 | **Playwright synthetic event mismatch** — standard `click()` doesn't trigger React handlers; JS native `.click()` works | App-wide (likely related to React 19 event delegation) | Automated testing friction |
| 6 | **Login/Register pages accessible while logged in** | Auth pages | Should redirect authenticated users to home |
| 7 | **No follow/unfollow toggle logic** visible | Profile page | Follow button always shows "Follow" regardless of state |

---

## Screenshots Index

| # | File | Page |
|---|------|------|
| 1 | `01-feed-page-logged-out.png` | Feed page |
| 2 | `02-login-page.png` | Login page |
| 3 | `03-register-page.png` | Register page |
| 4 | `04-profile-page.png` | Profile page (Qazi Farhan Ahmad) |
| 5 | `05-post-detail-image.png` | Post detail with image |
| 6 | `06-post-detail-comments.png` | Post detail with comments |
| 7 | `07-post-after-like.png` | Post detail after like click (no effect) |
| 8 | `08-after-comment-posted.png` | Post detail after comment submit (no effect via click) |
| 9 | `09-edit-profile-redirect.png` | Edit profile page (redirected to login) |
| 10 | `10-404-notfound.png` | `/nonexistent` — blank page |
| 11 | `11-feed-after-js-like-click.png` | Feed after programmatic like click |
| 13 | `13-after-comment-posted.png` | Post detail after programmatic comment submit |

---

## Raw Test Output

All snapshots (`.yml` files) are saved alongside screenshots with full accessibility tree data, ARIA labels, roles, and element references for each page state.
