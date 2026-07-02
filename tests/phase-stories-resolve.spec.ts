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
    const ctx = await browser.newPage({ baseURL: "http://localhost:5173" });
    await login(ctx, ALICE);
    await ctx.goto("/");

    // Click the Add button — file chooser dialog opens programmatically
    const addBtn = ctx.locator("button:has-text('Add')");
    await expect(addBtn).toBeVisible({ timeout: 10000 });

    await addBtn.click();

    // Upload test image — the StoryRing has the first hidden file input
    const fileInput = ctx.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.resolve(__dirname, "test-image.png"));

    // Wait for success toast
    await expect(ctx.locator("text=Story created")).toBeVisible({ timeout: 15000 });

    // The story ring should show Alice's own story ring (avatar with "Alice" name)
    const storyBtn = ctx.locator("button:has-text('Alice')");
    await expect(storyBtn).toBeVisible({ timeout: 10000 });

    // Click on own story ring to open viewer
    await storyBtn.click();

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
  test("Admin resolves report → update is deleted", async ({ browser }) => {
    // ── Login as Alice and create an update ──
    const aliceCtx = await browser.newPage({ baseURL: "http://localhost:5173" });
    await login(aliceCtx, ALICE);

    const updateRes = await api(aliceCtx, "POST", "/updates", {
      content: "Update to be reported and auto-deleted",
    });
    const updateId = updateRes.data.id;

    // ── Report Alice's own update ──
    await api(aliceCtx, "POST", "/reports", {
      targetType: "update",
      targetId: updateId,
      reason: "Test auto-resolve",
    });

    // ── Login as admin and resolve via API (more reliable than UI click) ──
    const adminCtx = await browser.newPage({ baseURL: "http://localhost:5173" });
    await login(adminCtx, ADMIN);

    // List reports and get the matching report ID
    const reportsRes = await api(adminCtx, "GET", "/admin/reports");
    const report = reportsRes.data.find((r) => r.targetId === updateId);
    expect(report).toBeDefined();

    // Resolve via API
    const resolveRes = await api(adminCtx, "PATCH", `/admin/reports/${report.id}`, {
      status: "resolved",
    });
    expect(resolveRes.success).toBe(true);

    // ── Verify update returns 404 ──
    const getRes = await api(adminCtx, "GET", `/updates/${updateId}`);
    expect(getRes.success).toBe(false);

    await aliceCtx.close();
    await adminCtx.close();
  });

  test("Admin resolves user report → user suspended", async ({ browser }) => {
    // ── Login as admin ──
    const adminCtx = await browser.newPage({ baseURL: "http://localhost:5173" });
    await login(adminCtx, ADMIN);

    // Get Alice's user ID via search
    const searchRes = await api(adminCtx, "GET", "/search?q=alice&type=users");
    const aliceId = searchRes.data.users[0].id;

    // Check if there's an existing pending report for Alice; if not, create one
    let reportId;
    const existingReports = await api(adminCtx, "GET", "/admin/reports?status=pending");
    const existingReport = existingReports.data.find(
      (r) => r.targetType === "user" && r.targetId === aliceId,
    );
    if (existingReport) {
      reportId = existingReport.id;
    } else {
      const reportRes = await api(adminCtx, "POST", "/reports", {
        targetType: "user",
        targetId: aliceId,
        reason: "Suspicious activity",
      });
      expect(reportRes.success).toBe(true);
      reportId = reportRes.data.id;
    }

    // Resolve the user report via API
    const resolveRes = await api(adminCtx, "PATCH", `/admin/reports/${reportId}`, {
      status: "resolved",
    });
    expect(resolveRes.success).toBe(true);

    // ── Verify Alice is suspended via profile API ──
    const userRes = await api(adminCtx, "GET", `/users/${aliceId}`);
    expect(userRes.data.suspended).toBe(true);

    // ── Verify Alice's updates don't show in the feed ──
    const feedRes = await api(adminCtx, "GET", "/updates?limit=20");
    const aliceUpdates = feedRes.data.items.filter((p) => p.authorId === aliceId);
    expect(aliceUpdates.length).toBe(0);

    await adminCtx.close();
  });
});
