# Eucalyptus Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portfolio's dark styling with an accessible eucalyptus light theme and deliver it through a merged pull request.

**Architecture:** Keep the current plain HTML, CSS, and JavaScript architecture. Implement the theme by changing shared CSS tokens first, then converting hard-coded dark surfaces and metadata while preserving all DOM and JavaScript contracts.

**Tech Stack:** HTML, CSS, vanilla JavaScript, GitHub Pages, Playwright CLI

## Global Constraints

- Preserve all content, page structure, links, and JavaScript interactions.
- Use `#f7f8f3`, `#245746`, `#e4ece5`, `#24312c`, and `#d97898` as the core palette.
- Support a minimum mobile width of 375px.
- Keep `6da88ebdf9951c1da166a6ba7e8cc87fbbcc5a87` as the documented dark-theme rollback point.
- Do not add dependencies.

---

### Task 1: Convert The CSS Theme

**Files:**
- Modify: `styles.css`

- [ ] Replace dark colour tokens with the approved light palette.
- [ ] Convert hard-coded dark panels, controls, overlays, and decorative effects to light equivalents.
- [ ] Run `git diff --check` and scan CSS for remaining black surface colours.

### Task 2: Update Theme Metadata And Brand Assets

**Files:**
- Modify: `index.html`
- Modify: `assets/favicon.svg`
- Modify: `assets/social-preview.svg`

- [ ] Update browser theme colour and cache versions.
- [ ] Recolour the favicon and social preview for the light theme.
- [ ] Verify all local references resolve.

### Task 3: Browser Verification

**Files:**
- No production files

- [ ] Serve the site locally and inspect desktop layout in Playwright.
- [ ] Test Ctrl+K, project filters, process tabs, and PR workflow controls.
- [ ] Resize to 375px and confirm no horizontal overflow or overlap.
- [ ] Confirm zero console errors and successful local asset requests.

### Task 4: Pull Request And Deployment

**Files:**
- No production files

- [ ] Commit the reviewed theme changes with a focused English message.
- [ ] Push `feat/eucalyptus-light-theme` and open a pull request into `main`.
- [ ] Merge the pull request after checks pass.
- [ ] Confirm GitHub Pages deploys the merged commit and validate the live page.
