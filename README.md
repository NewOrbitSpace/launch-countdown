# Launch Countdown Dashboard

A static countdown page for the NEO Rideshare launch — for laptops, the lobby TV, or anywhere with a browser. Styled via Claude Design using the NewOrbit Design System.

## Structure

- `index.html` — page markup; contains all five design variants
- `config.js` — **edit this** to set the mission events and launch date
- `style.css` / `script.js` — styling and countdown logic
- `assets/`, `fonts/` — logo and Aeonik Pro fonts used by the site
- `design/` — git-ignored, local-only: the original Claude Design exploration (`Countdown Dashboard Options.dc.html` plus its runtime, design-system bundle, and brand renders). Kept out of the public repo deliberately.

## Picking a design

The page currently ships all five design options (Mission control, Split, Trajectory, Minimal, Rail) with a switcher nav in the corner. Once a design is chosen, delete the other `<section class="design ...">` blocks and the switcher nav in `index.html`, and the switcher section at the bottom of `script.js`.

## Local preview

Just open `index.html` in a browser. No build step, no dependencies.

## Deployment (GitHub Pages)

1. Push this repo to GitHub.
2. In the repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
3. The site will be live at `https://<org-or-user>.github.io/<repo-name>/`.

Every push to `main` redeploys automatically.

**Note:** Aeonik Pro is a commercially licensed font. Check the license permits serving it from a public site before deploying publicly (or keep the repo/site private, e.g. via Azure Static Web Apps or Cloudflare Access).
