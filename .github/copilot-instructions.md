<!-- Copilot instructions for working in this repository -->
# Project snapshot

This repository is a small, static, accessibility-focused portfolio site (no build step). Key folders:

- [index.html](index.html) — site entry, navigation and links to pages.
- [js](js) — client-side scripts (theme, accessibility, UI behaviors).
- [style/styles.css](style/styles.css) — global styles and CSS variables.
- [pages](pages) — secondary site pages (projects, diary, contacts).
- [images](images) and [assets](assets) — static assets (icons, resume.pdf).

High-level architecture: plain HTML pages enhanced with progressive JavaScript. All logic runs client-side (localStorage is used for user settings and cookie flags). There is no bundler, no package.json, and no test harness in the repository.

## What to know up front (quick wins)

- The site is accessibility-first: expect many ARIA attributes, a live region `a11y-live-region`, keyboard shortcuts (Ctrl+Alt+*) and helper classes like `sr-only` and `scalable-button`.
- Primary interactive code lives in `js/javascript.js` and `js/a11.js` (theme toggle, lazy-loading, forms, a11y helpers). Search for `theme-toggle`, `contactForm`, `a11y-live-region` to find important hooks.
- Note: `index.html` currently references `scripts/javascript.js` and `scripts/a11y.js`, but the repository uses `js/` — check paths before editing or update HTML to match `js/`.
- Many UI behaviours depend on exact element IDs (for example `contactForm`, `captcha`, `theme-toggle`, `font-size`). Changing IDs can silently break features.

## Patterns & conventions (do not improvise)

- Naming: BEM-like classes (`header__logo`, `project-gallery-item`) and utility classes (`sr-only`, `img-cover`, `adaptive-table`). Follow existing class patterns when adding styles.
- Accessibility: prefer ARIA and semantic HTML. New interactive widgets should expose `role`, `aria-*` attributes and keyboard handlers like existing controls in `js/a11.js`.
- Persistence: user preferences and cookie choices are stored in `localStorage` keys such as `theme`, `a11ySettings`, `cookiesAccepted`, and `contactFormDraft`. Keep key names consistent.
- Images: responsive `<picture>` + `loading="lazy"` is the standard used across pages — follow that structure for new media.

## Local dev & debugging

- There is no build step. Serve files with any static server to reproduce behavior (recommended):

  ```powershell
  # from repository root (Windows PowerShell)
  python -m http.server 8000
  # or (if node installed)
  npx http-server . -p 8000
  ```

- Use the browser devtools to inspect localStorage keys, event listeners, and keyboard shortcuts. Search for `announceToScreenReader` to trace live-region usage.

## Code edits: safe approach

1. Run a local server and open the page in the browser before changing any ID or class.
2. If modifying interactive code, add a small, isolated change and test keyboard navigation and screen-reader announcements.
3. If you rename an ID used by JS (e.g. `contactForm`), update every place: HTML, `js/*.js`, and any links/anchors.
4. When changing `index.html` script paths, choose one pattern and update all pages to avoid mixed folders (`scripts/` vs `js/`).

## Examples from the codebase (search hints)

- Theme toggle: see `theme-toggle` in [index.html](index.html) and implementation in [js/javascript.js](js/javascript.js).
- Accessibility helpers: `announceToScreenReader` and focus-trap are in [js/a11.js](js/a11.js).
- Contact form flow: IDs `contactForm`, `captcha`, `save-draft` are used across `pages/contacts.html` and `js/javascript.js` — do not change without full test.

## When to ask the repo owner

- If you need to introduce a frontend dependency (React, bundlers, polyfills) — this repo is intentionally unbundled; confirm intent first.
- If you plan to change global persistence keys or storage schema (localStorage), coordinate to provide a migration path.

If anything here is unclear or you want this expanded (e.g., include common edit examples or automated checks), tell me which sections to expand. 
