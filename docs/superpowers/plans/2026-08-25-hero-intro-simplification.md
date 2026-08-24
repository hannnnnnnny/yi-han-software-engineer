# Hero Intro Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crowded hero introduction with a direct name, full-stack role, and one concise sentence about building useful software.

**Architecture:** Preserve the current static HTML, CSS, and JavaScript structure. Change only the hero copy and its existing typography classes, leaving all interaction selectors and surrounding sections intact.

**Tech Stack:** HTML, CSS, vanilla JavaScript, GitHub Pages, Playwright CLI

## Global Constraints

- Use the approved copy exactly: `Yi Han`, `Full-stack Software Engineer`, and `I build useful, interesting software that makes everyday life a little easier.`
- Remove the hero eyebrow, student identity, and hero technology list.
- Preserve navigation, actions, proof items, PR workflow, projects, skills, and JavaScript behaviour.
- Keep the eucalyptus light theme and support a minimum width of 375px.
- Add no dependencies.

---

### Task 1: Simplify Hero Content And Hierarchy

**Files:**
- Modify: `index.html:65-74`
- Modify: `styles.css:349-389`
- Modify: `styles.css:1869-1883`
- Modify: `styles.css:1968-1975`

**Interfaces:**
- Consumes: Existing `.hero-title`, `.hero-statement`, `.hero-context`, and `hero-rise` animation classes.
- Produces: The same DOM hooks with shorter content and a clearer visual hierarchy.

- [x] **Step 1: Confirm the old copy exists before editing**

Run:

```powershell
rg -n "Software Engineer \| Yi Han|Master of IT student|I like finding real needs" index.html
```

Expected: Matches on the current hero heading, statement, and context.

- [x] **Step 2: Replace the hero copy**

Use this markup inside `.hero-text`:

```html
<h1 id="hero-title" class="hero-title"><span class="reveal-line"><span class="reveal-inner" style="--rise-delay: 90ms">Yi Han</span></span></h1>
<p class="hero-statement hero-rise" style="--rise-delay: 230ms">Full-stack Software Engineer</p>
<p class="hero-context hero-rise" style="--rise-delay: 340ms">I build useful, interesting software that makes everyday life a little easier.</p>
```

- [x] **Step 3: Reduce the role typography**

Set `.hero-statement` to a system sans-serif role line with `font-size: 1.6rem`, `line-height: 1.25`, and `margin-bottom: 0.8rem`. Limit `.hero-context` to `560px`. Use `1.45rem` for `.hero-statement` below 700px and remove the separate below-420px override.

- [x] **Step 4: Run static checks**

Run:

```powershell
node --check app.js
git diff --check
rg -n "Full-stack Software Engineer|I build useful, interesting software" index.html
```

Expected: JavaScript and diff checks pass, and both approved hero lines are present.

### Task 2: Verify Responsive Presentation

**Files:**
- No production files

**Interfaces:**
- Consumes: The updated static page.
- Produces: Browser evidence that the simplified hero remains readable and interactive.

- [x] **Step 1: Serve the repository locally**

Run:

```powershell
python -m http.server 4175
```

Expected: The site responds at `http://127.0.0.1:4175/`.

- [x] **Step 2: Check desktop, tablet, and mobile**

Use Playwright CLI at `1440x1000`, `768x900`, and `375x812`. At each size confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth`; visually confirm the role line is smaller than the name and the supporting sentence does not overlap adjacent content.

- [x] **Step 3: Recheck the command palette**

Press `Control+K` and confirm `#command-palette` opens with focus on `#command-input`. Press `Escape` and confirm it closes.

- [x] **Step 4: Commit the implementation**

Run:

```powershell
git add index.html styles.css docs/superpowers/plans/2026-08-25-hero-intro-simplification.md
git commit -m "refactor: simplify portfolio hero introduction"
```

Expected: A focused commit containing the approved hero change and implementation plan.

### Task 3: Merge And Verify GitHub Pages

**Files:**
- No production files

**Interfaces:**
- Consumes: The verified feature branch.
- Produces: A merged pull request and deployed GitHub Pages update.

- [ ] **Step 1: Push and create the pull request**

Push `feat/clarify-hero-intro` and open a pull request into `main` titled `refactor: simplify portfolio hero introduction`.

- [ ] **Step 2: Review and merge**

Confirm the PR contains only the specification, plan, hero copy, and hero typography changes. Merge after checks pass.

- [ ] **Step 3: Verify the deployment**

Wait for the GitHub Pages workflow for the merge commit. Open the deployed site with a cache-busting query, confirm the new three-line hierarchy is live at desktop and 375px, and confirm zero browser console errors.
