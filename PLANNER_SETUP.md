# June Planner — setup & how it works

A personal planning app built on the "big rocks" framework from the car conversation:
**big rocks → milestones (deadline, hours, priority, status) → scheduled into your time.**
It auto-saves every change to the cloud, so you can open it on any device and always see the latest.

Lives at: **https://inikaiyer.com/planner.html** (once deployed)

## Files added to this repo
- `planner.html` — the whole app (one file, no build step)
- `netlify/functions/planner.js` — load/save the data to **Netlify Blobs** (no database to manage)
- `package.json` — adds the `@netlify/blobs` dependency Netlify installs on deploy

## Deploy (one time)
1. Commit & push these files to GitHub — Netlify auto-builds and deploys.
2. **Set your PIN** so the planner is private to you:
   - Netlify dashboard → your site → **Site configuration → Environment variables → Add a variable**
   - Key: `PLANNER_PIN`   Value: *(a number/word only you know, e.g. `2026`)*
   - Save, then **Deploys → Trigger deploy → Deploy site** so the function picks it up.
   - If you ever skip this, the planner has **no lock** and anyone with the link can edit it.
3. Open https://inikaiyer.com/planner.html, enter your PIN once (it's remembered on that device),
   and you're in. On your phone: open it in Safari/Chrome → Share → **Add to Home Screen** for an app icon.

## How to use it
- **Today** — what's overdue / due soon, today's schedule, and progress per rock.
- **Rocks** — tap a rock to expand its milestones. Tap the circle to cycle To-do → In progress → Done.
  Tap a milestone (or ✎) to set its **deadline, hours, priority, schedule date/time, notes**.
  Move a deadline and the urgency/sorting updates automatically — that's the dynamic re-planning.
- **Schedule** — pick a day in June; your recurring classes/work are auto-filled. Tap **＋ add** to
  block time, or set a "Schedule on" date/time on any milestone to drop it onto a day.

## Notes
- Single shared document, so it's meant for one editor (you). Sharing/multi-user can be added later.
- Recurring commitments (Tech Theater, Bellevue math, work shifts) are defined in `planner.html` in the
  `seed()` function under `recurring` — edit there if your class times change.
