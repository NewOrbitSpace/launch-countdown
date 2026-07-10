# Launch Countdown Dashboard

A static countdown page for displaying on laptops, the lobby TV, or anywhere with a browser.

## Structure

- `index.html` — page markup
- `config.js` — **edit this** to set the launch date, title, and messages (currently a placeholder date)
- `style.css` — bare-bones styling (to be replaced via Claude Design + NewOrbit Design System)
- `script.js` — countdown logic

## Local preview

Just open `index.html` in a browser. No build step, no dependencies.

## Deployment (GitHub Pages)

1. Create a repository on GitHub and push this folder.
2. In the repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
3. The site will be live at `https://<org-or-user>.github.io/<repo-name>/`.

Every push to `main` redeploys automatically.

## TODO

- [ ] Set the real launch date in `config.js`
- [ ] Design pass via Claude Design (NewOrbit Design System)
- [ ] Push to GitHub and enable Pages
