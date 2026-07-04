# Deploy — Forge (Free Tier)

## 1. Client → Vercel

1. Import repo, set **Root Directory** to `client`
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. No env vars needed (client connects via API URL from server)

## 2. Server → Render (Web Service)

1. **Root Directory:** `server`
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **Instance Type:** Free
5. **Env Vars:**
   - `DATABASE_URL` — Neon pooled URL (ends with `?sslmode=require`)
   - `JWT_SECRET` — strong random string
   - `CLIENT_URL` — Vercel deployment URL (e.g. `https://forge.vercel.app`)
   - `NODE_ENV=production`

## 3. Keep Server Warm (Free Tier)

Render free spins down after **15 min idle**. Cold starts take 5–30s. Set up a **cron pinger**:

| Service | Free Tier | How |
|---------|-----------|-----|
| [cron-job.org](https://cron-job.org) | Unlimited jobs, 1-min intervals | Create job → URL `https://your-app.onrender.com/_health` → every **10–14 min** |
| [UptimeRobot](https://uptimerobot.com) | 5 monitors, 5-min intervals | Same endpoint |

> ⚠️ Avoid pinging more than once per 5 min — Render free has CPU quota limits.

## 4. Image Uploads (Optional)

Render's disk is **ephemeral** — uploads disappear on every deploy. For persistence:
1. Set up a free [Cloudinary](https://cloudinary.com) account
2. Add `CLOUDINARY_URL` env var to Render
3. The upload route will auto-detect and proxy uploads if cloudinary is configured

## 5. Verify

- Run `npx playwright test` from repo root to confirm all 24 integration tests pass
- Visit `/_health` on the Render URL — should return `{ success: true, data: { status: "ok" } }`
