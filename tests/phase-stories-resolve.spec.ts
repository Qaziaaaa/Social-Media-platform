import { test, expect } from "@playwright/test";
import path from "path";

const ALICE = { email: "alice@example.com", password: "password123" };
const ADMIN = { email: "admin@example.com", password: "password123" };

async function login(page, { email, password }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
}

async function getToken(page) {
  return page.evaluate(() => localStorage.getItem("social_access_token"));
}

async function api(page, method, url, body?) {
  const token = await getToken(page);
  const opts: Record<string, any> = {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  };
  if (body) opts.data = JSON.stringify(body);
  const res = await page.request.fetch(`http://localhost:4000/api${url}`, opts);
  return res.json();
}

// ── Stories ──────────────────────────────────────────────

test.describe("Stories", () => {
  test("Alice creates a story and views it in the viewer", async ({ browser }) => {
    const ctx = await browser.newPage();
    await login(ctx, ALICE);
    await ctx.goto("/");

    // Click the Add button to open file picker
    const addBtn = ctx.locator("button:has-text('Add')");
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Upload test image
    const fileInput = ctx.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve(__dirname, "test-image.png"));

    // Wait for success toast
    await expect(ctx.locator("text=Story created")).toBeVisible({ timeout: 15000 });

    // Ring should now show "You" button with Alice's avatar
    const youBtn = ctx.locator("button:has-text('You')");
    await expect(youBtn).toBeVisible({ timeout: 10000 });

    // Click on own story to open viewer
    await youBtn.click();

    // Viewer should show the uploaded image
    const viewerImg = ctx.locator(".fixed.inset-0 img[alt='']");
    await expect(viewerImg).toBeVisible({ timeout: 10000 });

    // Progress bar should be present
    const progressBar = ctx.locator(".fixed.inset-0 .rounded-full.bg-white");
    await expect(progressBar.first()).toBeVisible({ timeout: 5000 });

    // Close viewer via Escape
    await ctx.keyboard.press("Escape");
    await expect(ctx.locator(".fixed.inset-0")).not.toBeVisible({ timeout: 5000 });

    await ctx.close();
  });
});

// ── Auto-resolve Reports ─────────────────────────────────

test.describe("Auto-resolve reports", () => {
  test("Admin resolves post report → post is deleted", async ({ browser }) => {
    // ── Login as Alice and create a post ──
    const aliceCtx = await browser.newPage();
    await login(aliceCtx, ALICE);

    const postRes = await api(aliceCtx, "POST", "/posts", {
      content: "Post to be reported and auto-deleted",
    });
    const postId = postRes.data.id;

    // ── Report Alice's own post (just to have a report) ──
    await api(aliceCtx, "POST", "/reports", {
      targetType: "post",
      targetId: postId,
      reason: "Test auto-resolve",
    });

    // ── Admin resolves the report ──
    const adminCtx = await browser.newPage();
    await login(adminCtx, ADMIN);
    await adminCtx.goto("/admin/reports");
    await expect(adminCtx.locator("text=Reports")).toBeVisible({ timeout: 10000 });

    // Click first Resolve button
    const resolveBtn = adminCtx.locator("button:has-text('Resolve')").first();
    await expect(resolveBtn).toBeVisible({ timeout: 10000 });
    await resolveBtn.click();

    // Verify status changed to resolved
    await expect(adminCtx.locator("text=resolved").first()).toBeVisible({ timeout: 10000 });

    // ── Verify post returns 404 ──
    const getRes = await api(adminCtx, "GET", `/posts/${postId}`);
    expect(getRes.success).toBe(false);

    await aliceCtx.close();
    await adminCtx.close();
  });

  test("Admin resolves user report → user suspended", async ({ browser }) => {
    // ── Login as admin to get user IDs ──
    const adminCtx = await browser.newPage();
    await login(adminCtx, ADMIN);

    // Get Alice's user ID via search
    const searchRes = await api(adminCtx, "GET", "/search?q=alice&type=users");
    const aliceId = searchRes.data.users[0].id;

    // ── Login as another context (Alice) to report ──
    // (Can't report self, so this is just setting up the report for admin to resolve)

    // ── Admin creates a report against Alice (simulating a user report) ──
    await api(adminCtx, "POST", "/reports", {
      targetType: "user",
      targetId: aliceId,
      reason: "Suspicious activity",
    });

    // Navigate to admin reports
    await adminCtx.goto("/admin/reports");

    // Resolve the user report
    const resolveBtns = adminCtx.locator("button:has-text('Resolve')");
    await expect(resolveBtns.first()).toBeVisible({ timeout: 10000 });
    await resolveBtns.first().click();
    await expect(adminCtx.locator("text=resolved").first()).toBeVisible({ timeout: 10000 });

    // ── Verify Alice is suspended by checking her profile ──
    await adminCtx.goto(`/profile/${aliceId}`);
    // Profile should still load (user exists) but should show suspended state
    await expect(adminCtx.locator("text=Alice Johnson").first()).toBeVisible({ timeout: 10000 });

    // Verify Alice's posts don't show in feed anymore
    // (the suspended check is server-side, so we verify via API)
    const feedRes = await api(adminCtx, "GET", "/posts?limit=10");
    const alicePosts = feedRes.data.items.filter((p) => p.authorId === aliceId);
    expect(alicePosts.length).toBe(0);

    await adminCtx.close();
  });
});
