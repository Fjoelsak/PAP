# Slides

Lecture slides for **Predictive Analytics**, built with [Slidev](https://sli.dev)
on the shared THM theme (`theme-thm/`). Published on GitHub Pages:
<https://fjoelsak.github.io/PAP/>

## Structure

```
slides/
├─ theme-thm/              shared Slidev theme (slidev-theme-thm): layouts, components, styles
├─ lectures/
│  └─ v01-einfuehrung/     one folder per lecture, each with slides.md and package.json
├─ index/                  templates for the overview page (index.html, seite.yaml, …)
├─ scripts/build-pages.mjs builds all decks, PDFs, notes pages and the overview into dist/
└─ legacy/                 old PowerPoint decks (not committed)
```

## Usage

```bash
npm install                          # once, installs all workspaces
npm run v01                          # open lecture 1 in the browser

npm run build:pages                  # everything for GitHub Pages into dist/
npm run build:pages -- --ohne-pdf    # without PDF export
npm run build:index                  # overview page only
npx serve dist                       # preview the result
```

The PDF export needs Chromium once: `npx playwright install chromium`.
In Git Bash, set `MSYS_NO_PATHCONV=1` when passing `PAGES_BASE=/PAP`,
otherwise the path is rewritten to a Windows path.

## Publishing

Every push to `main` that touches `slides/` runs
`.github/workflows/pages.yml`, which builds all decks and deploys them.
One-time setting in the repository: *Settings → Pages → Source: GitHub Actions*.

## Adding a lecture

1. Create `lectures/vNN-topic/`, copy `package.json` from an existing lecture and change `name`.
2. Start `slides.md` with the headmatter:

   ```yaml
   ---
   theme: slidev-theme-thm
   title: VNN — Topic
   veranstaltung: Predictive Analytics
   dozent: Nicolas Stein
   layout: cover
   ---
   ```

   The title must follow the pattern `VNN — Topic`; the overview page derives number and week from it.
3. Put images into `lectures/vNN-topic/public/` and reference them with a leading `/`.
4. Run `npm install` once so the new workspace is picked up.

The layouts and components of the theme are documented in the comment at the top of each file in `theme-thm/layouts/` and `theme-thm/components/`.
