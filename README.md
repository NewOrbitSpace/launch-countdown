# Launch Countdown Dashboard

A static countdown page for the NEO Rideshare launch — for laptops, the lobby TV, or anywhere with a browser. Styled via Claude Design using the NewOrbit Design System.

## Structure

- `index.html` — page markup. A corner toggle switches between two published designs: **Dashboard (1a)** and **Mission Control (2)**. Four older exploration variants (Split, Trajectory, Minimal, Rail) remain in the markup but are hidden and not in the toggle.
- `config.js` — **edit this** to set the mission events and launch date
- `style.css` / `script.js` — styling and countdown logic
- `assets/`, `fonts/` — logo and Aeonik Pro fonts used by the site
- `design/` — git-ignored, local-only: the original Claude Design exploration (`Countdown Dashboard Options.dc.html` plus its runtime, design-system bundle, and brand renders). Kept out of the public repo deliberately.

## Design

The page ships two designs, switched by the corner toggle (bottom-right):

- **Dashboard (1a)** — the original NewOrbit-branded layout: large countdown with the milestone strip along the bottom. This is the default.
- **Mission Control (2)** — a NASA-style launch-control display: a big amber seven-segment "COUNTDOWN TO LAUNCH" clock over a milestone status strip. It deliberately does **not** use the NewOrbit brand system — its own dark palette, Barlow type, and a real DSEG7 seven-segment LED face (loaded from a CDN, falling back to the mono stack offline).

The toggle remembers your choice in `localStorage` and also honours `?design=1a` / `?design=2` in the URL. To change which design is shown by default, reorder the entries in the `DESIGNS` array in `script.js` (the first entry is the fallback).

Four earlier exploration variants (Split, Trajectory, Minimal, Rail) are still implemented in the markup but are not in the toggle. To show one, add it to the `DESIGNS` array (or point the `active` class at its `<section class="design ...">` block).

## Local preview

Just open `index.html` in a browser. No build step, no dependencies.

## Deployment (GitHub Pages)

1. Push this repo to GitHub.
2. In the repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
3. The site will be live at `https://<org-or-user>.github.io/<repo-name>/`.

Every push to `main` redeploys automatically.

**Note:** Aeonik Pro is a commercially licensed font. Check the license permits serving it from a public site before deploying publicly (or keep the repo/site private, e.g. via Azure Static Web Apps or Cloudflare Access).
