# June Planner — setup & how it works

A personal planning app built on the "big rocks" framework from the car conversation:
**big rocks → milestones (deadline, hours, priority, status) → scheduled into your time.**
It auto-saves every change to the cloud, so you can open it on any device and always see the latest.

- **App page:** https://inikaiyer.com/planner.html  (served by GitHub Pages)
- **Save/load API:** https://inikaiyer-portfolio.vercel.app/api/planner  (Vercel function — same place your chatbot lives)

## Files
- `planner.html` — the whole app (one file, no build step). Lives on GitHub Pages.
- `api/planner.js` — Vercel serverless function that loads/saves your data to **Vercel KV**.
- `PLANNER_SETUP.md` — this file.

It already works offline: your data is cached in the browser (localStorage), so nothing is ever lost.
The two steps below turn on **cloud sync across devices**.

## One-time setup (≈5 min, in the Vercel dashboard)
Go to https://vercel.com → your **inikaiyer-portfolio** project.

**1. Create the storage (Vercel KV)**
   - Top tabs → **Storage** → **Create Database** → choose **KV** (Upstash Redis) → name it `planner` → Create.
   - When asked, **Connect** it to the `inikaiyer-portfolio` project (all environments).
   - This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the project — you don't copy anything.

**2. Set your private PIN**
   - **Settings** → **Environment Variables** → Add:
     - Key: `PLANNER_PIN`   Value: *(a code only you know, e.g. `2026`)*
   - Save.

**3. Redeploy so the new settings take effect**
   - **Deployments** → newest one → **⋯** → **Redeploy**.

Then open https://inikaiyer.com/planner.html, enter your PIN once (remembered on that device).
On your phone: open it in Safari/Chrome → **Share → Add to Home Screen** for an app icon.

> If you skip step 2 (the PIN), the planner still works but has **no lock** — anyone with the link could edit it.
> Until step 1 is done, the app runs in offline mode (saves only on the current device) and the status dot shows "Offline".

## How to use it
- **Today** — what's overdue / due soon, today's schedule, progress per rock + a month % ring.
- **Rocks** — tap a rock to expand its milestones; tap the circle to cycle To-do → In progress → Done.
  Tap a milestone (or ✎) to set its **deadline, hours, priority, schedule date/time, notes**.
  Move a deadline and the urgency re-sorts automatically — that's the dynamic re-planning.
- **Schedule** — pick a day in June; recurring classes/work are auto-filled. Tap **＋ add** to block time,
  or set a "Schedule on" date/time on any milestone to drop it onto a day.

## Notes
- Single shared document (meant for one editor — you). Multi-user can be added later.
- Recurring commitments (Tech Theater, Bellevue math, work shifts) are defined in `planner.html` in the
  `seed()` function under `recurring` — edit there if class times change.
