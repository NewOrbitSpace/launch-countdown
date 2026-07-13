# Launch Countdown Dashboard

A static countdown page for the NEO Rideshare launch — for laptops, the lobby TV, or anywhere with a browser. Styled via Claude Design using the NewOrbit Design System.

## Structure

- `index.html` — page markup; the published design is Mission control (1a). The other four variants (Split, Trajectory, Minimal, Rail) remain in the markup but are hidden.
- `config.js` — **edit this** to set the mission events and launch date
- `style.css` / `script.js` — styling and countdown logic
- `assets/`, `fonts/` — logo and Aeonik Pro fonts used by the site
- `design/` — git-ignored, local-only: the original Claude Design exploration (`Countdown Dashboard Options.dc.html` plus its runtime, design-system bundle, and brand renders). Kept out of the public repo deliberately.

## Design

The published page shows the **Mission control (1a)** design. The other four variants (Split, Trajectory, Minimal, Rail) are still implemented in `index.html`, `style.css`, and `script.js`, but the corner switcher nav has been removed so the published page only ever shows 1a. Only the `<section class="design d1a active">` block is displayed; the rest stay hidden. To switch the published design, move the `active` class to a different `<section class="design ...">` block in `index.html`.

## Local preview

Just open `index.html` in a browser. No build step, no dependencies.

## Deployment (GitHub Pages)

1. Push this repo to GitHub.
2. In the repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
3. The site will be live at `https://<org-or-user>.github.io/<repo-name>/`.

Every push to `main` redeploys automatically.

**Note:** Aeonik Pro is a commercially licensed font. Check the license permits serving it from a public site before deploying publicly (or keep the repo/site private, e.g. via Azure Static Web Apps or Cloudflare Access).
