/*
 * Yi Han - portfolio interactions (vanilla, no framework).
 * Modules: process tabs, scroll progress, section nav,
 * scroll reveal, command palette,
 * skill map, and a live code-to-page preview.
 */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const canvasTheme = {
    background: "#f5f5f7",
    ink: "#1d1d1f",
    muted: "#6e6e73",
    primary: "#0066cc",
    secondary: "#248164",
    rose: "#8066a9",
    amber: "#ad6c00",
  };

  document.documentElement.classList.add("js-enabled");

  function initHashPosition() {
    window.addEventListener("load", () => {
      const id = window.location.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }, { once: true });
  }

  /* ---------- AIDLC lifecycle tabs ---------- */
  function initLifecycleTabs() {
    const tabs = $$("[data-lifecycle-target]");
    const panels = $$("[data-lifecycle-panel]");
    if (!tabs.length) return;

    const apply = (target) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.lifecycleTarget === target;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        const active = panel.dataset.lifecyclePanel === target;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    };

    tabs.forEach((tab) =>
      tab.addEventListener("click", () => apply(tab.dataset.lifecycleTarget || "frame")),
    );
    apply("frame");
  }

  /* ---------- Scroll progress + active section ---------- */
  function initScrollSync() {
    const progress = $(".scroll-progress");
    const navLinks = $$("[data-section-link]");

    const onScroll = () => {
      if (!progress) return;
      const page = document.documentElement;
      const max = page.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(page.scrollTop / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const sections = $$("main section[id]");
    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.dataset.sectionLink === entry.target.id;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: 0.02 },
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    const targets = $$(
      ".section-heading, .focus-grid article, .lifecycle-layout, .project-card, .contact-section .section-copy",
    );
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    targets.forEach((node, index) => {
      node.classList.add("reveal");
      node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 60}ms`);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    targets.forEach((node) => observer.observe(node));
  }

  /* ---------- Command palette ---------- */
  function initCommandPalette() {
    const palette = $("#command-palette");
    const backdrop = $("[data-command-backdrop]");
    const input = $("#command-input");
    const openers = $$("[data-command-open]");
    const closeButton = $("[data-command-close]");
    const items = $$("[data-command-item]");
    if (!palette || !backdrop || !input || !items.length) return;

    let lastFocus = null;
    let activeIndex = 0;

    const visibleItems = () => items.filter((item) => !item.hidden);

    const setActive = (index) => {
      const visible = visibleItems();
      if (!visible.length) return;
      activeIndex = (index + visible.length) % visible.length;
      visible.forEach((item, itemIndex) => item.classList.toggle("is-command-active", itemIndex === activeIndex));
      visible[activeIndex].focus({ preventScroll: true });
    };

    const filterItems = () => {
      const query = input.value.trim().toLowerCase();
      items.forEach((item) => {
        const label = `${item.dataset.commandLabel || ""} ${item.textContent || ""}`.toLowerCase();
        item.hidden = Boolean(query && !label.includes(query));
        item.classList.remove("is-command-active");
      });
      activeIndex = 0;
      const visible = visibleItems();
      if (visible[0]) visible[0].classList.add("is-command-active");
    };

    const openPalette = () => {
      lastFocus = document.activeElement;
      palette.hidden = false;
      backdrop.hidden = false;
      document.body.classList.add("command-open");
      input.value = "";
      filterItems();
      window.setTimeout(() => input.focus(), 20);
    };

    const closePalette = () => {
      palette.hidden = true;
      backdrop.hidden = true;
      document.body.classList.remove("command-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    };

    const runCommand = (item) => {
      const target = item.dataset.commandTarget;
      if (!target) return;
      closePalette();
      if (target.startsWith("#")) {
        const node = $(target);
        if (node) node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.pushState) history.pushState(null, "", target);
        return;
      }
      window.location.href = target;
    };

    openers.forEach((opener) => opener.addEventListener("click", openPalette));
    closeButton?.addEventListener("click", closePalette);
    backdrop.addEventListener("click", closePalette);
    input.addEventListener("input", filterItems);
    items.forEach((item) => item.addEventListener("click", () => runCommand(item)));

    document.addEventListener("keydown", (event) => {
      const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommandShortcut) {
        event.preventDefault();
        if (palette.hidden) openPalette();
        else closePalette();
      } else if (!palette.hidden && event.key === "Escape") {
        closePalette();
      } else if (!palette.hidden && event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (!palette.hidden && event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (!palette.hidden && event.key === "Enter") {
        const current = visibleItems()[activeIndex];
        if (current) {
          event.preventDefault();
          runCommand(current);
        }
      }
    });
  }

  /* ---------- Skill capability map ---------- */
  function initSkillMap() {
    const canvas = $("#skill-map-canvas");
    const status = $("#skill-map-status");
    const cards = $$("[data-skill-card]");
    if (!canvas || !cards.length) return;

    const ctx = canvas.getContext("2d");
    const activeName = $("#skill-active-name");
    const selectionState = $("#skill-selection-state");
    const projectLinks = $("#skill-project-links");
    const projects = {
      pansub: { label: "PanSub", href: "#project-pansub" },
      renova: { label: "ReNova", href: "#project-renova" },
      kiwicue: { label: "KiwiCue", href: "#project-kiwicue" },
      tilltally: { label: "TillTally", href: "#project-tilltally" },
      portfolio: { label: "This portfolio", href: "#top" },
      github: { label: "GitHub repositories", href: "https://github.com/hannnnnnnny", external: true },
    };
    const evidence = {
      React: { text: "Builds TillTally's dashboard UI, CSV upload flows, tables, and chart pages.", projects: ["tilltally"] },
      TypeScript: { text: "Types TillTally and KiwiCue so frontend, API, and project setup stay easier to reason about.", projects: ["tilltally", "kiwicue"] },
      Vue: { text: "Builds ReNova's marketplace interface and stateful product screens.", projects: ["renova"] },
      Svelte: { text: "Explores component-driven UI patterns from coursework and smaller experiments.", projects: ["github"] },
      HTML5: { text: "Keeps portfolio and app structure semantic and progressively enhanced.", projects: ["portfolio", "kiwicue"] },
      CSS3: { text: "Handles responsive layout, visual hierarchy, interaction states, and reduced motion.", projects: ["portfolio", "renova", "tilltally"] },
      Vite: { text: "Supports fast local iteration and reproducible frontend builds.", projects: ["renova", "tilltally"] },
      Tailwind: { text: "Drives TillTally's responsive dashboard layout and component styling.", projects: ["tilltally"] },
      Java: { text: "Implements domain logic and backend service structure for ReNova.", projects: ["renova"] },
      "Spring Boot": { text: "Structures APIs, authentication, services, and transactional application flows.", projects: ["renova"] },
      "Node.js": { text: "Runs TypeScript and JavaScript tooling for web application projects.", projects: ["tilltally", "kiwicue"] },
      Express: { text: "Provides TillTally's API routes for imports, dashboards, and reports.", projects: ["tilltally"] },
      "REST API": { text: "Connects frontend workflows to clear backend resources and state transitions.", projects: ["renova", "tilltally"] },
      Maven: { text: "Keeps Java builds and dependencies reproducible across machines.", projects: ["renova"] },
      PostgreSQL: { text: "Backs TillTally's relational model for users, businesses, orders, products, and reports.", projects: ["tilltally"] },
      Prisma: { text: "Models the TillTally schema and runs typed, migrated queries against PostgreSQL.", projects: ["tilltally"] },
      MySQL: { text: "Grounds ReNova's marketplace workflow in an explicit relational data model.", projects: ["renova"] },
      MongoDB: { text: "Supports document-oriented data models for flexible application prototypes.", projects: ["github"] },
      SQLite: { text: "Provides a compact local database option for scripts and portable development workflows.", projects: ["github"] },
      SQL: { text: "Connects filters, relationships, reports, and application state to stored data.", projects: ["renova", "tilltally"] },
      JavaScript: { text: "Powers PanSub's subtitle overlay and this portfolio's interactions.", projects: ["pansub", "portfolio"] },
      Git: { text: "Keeps project history reviewable across the portfolio and selected repositories.", projects: ["github"] },
      GitHub: { text: "Makes source, READMEs, project history, and reviewable changes easy to inspect.", projects: ["github"] },
      npm: { text: "Manages JavaScript tooling and repeatable local project setup.", projects: ["tilltally", "portfolio"] },
      Testing: { text: "Checks syntax, interactions, responsive layout, and edge states before publishing.", projects: ["portfolio", "renova", "tilltally"] },
      Playwright: { text: "Automates real browser flows, interaction checks, and responsive verification.", projects: ["portfolio"] },
      "E2E testing": { text: "Represents the kind of browser-level checks I use to verify real user paths.", projects: ["portfolio"] },
      Docker: { text: "Containerises TillTally's client and server and runs them together via Docker Compose.", projects: ["tilltally"] },
      AIDLC: { text: "Gives me a practical way to frame software and AI-adjacent features around a real user problem.", projects: ["tilltally", "kiwicue"] },
      "Tool design": { text: "Turns a narrow user problem into a small interface that can be tested and improved.", projects: ["kiwicue", "tilltally"] },
      "GitHub Actions": { text: "Runs TillTally's CI pipeline for builds and checks on every push.", projects: ["tilltally"] },
    };
    const nodes = [
      { key: "Frontend", label: "UI", x: 0.18, y: 0.3, color: canvasTheme.primary, text: "Frontend turns product workflows into screens, states, and responsive interactions." },
      { key: "Backend", label: "API", x: 0.72, y: 0.25, color: canvasTheme.amber, text: "Backend work gives the app routes, services, auth, and domain rules." },
      { key: "Database", label: "SQL", x: 0.76, y: 0.72, color: canvasTheme.secondary, text: "Database thinking keeps projects grounded in schema, queries, and relationships." },
      { key: "Engineering", label: "ENG", x: 0.26, y: 0.75, color: canvasTheme.muted, text: "Engineering tools make the work reproducible, testable, and easier to review." },
      { key: "Product", label: "WHY", x: 0.48, y: 0.5, color: canvasTheme.rose, text: "Product thinking helps me choose features around real needs rather than filler." },
    ];
    const links = [
      ["Frontend", "Backend"], ["Backend", "Database"], ["Frontend", "Product"],
      ["Backend", "Product"], ["Database", "Engineering"], ["Engineering", "Frontend"],
      ["Engineering", "Backend"], ["Product", "Engineering"],
    ];
    let activeKey = cards[0].dataset.skillCard || "Data";
    let activeCard = cards[0];
    let pinnedCard = null;
    let rafId = 0;

    const nodeByKey = (key) => nodes.find((node) => node.key === key);

    const renderProjectLinks = (projectKeys) => {
      if (!projectLinks) return;
      projectLinks.replaceChildren();
      if (!projectKeys?.length) {
        const placeholder = document.createElement("span");
        placeholder.className = "skill-project-placeholder";
        placeholder.textContent = "Project evidence pending";
        projectLinks.append(placeholder);
        return;
      }
      projectKeys.forEach((projectKey) => {
        const project = projects[projectKey];
        if (!project) return;
        const link = document.createElement("a");
        link.href = project.href;
        link.textContent = project.label;
        if (project.external) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else if (project.href.startsWith("#project-")) {
          link.addEventListener("click", (event) => {
            const target = $(project.href);
            if (!target) return;
            event.preventDefault();
            requestAnimationFrame(() => {
              target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
              window.history.replaceState(null, "", project.href);
            });
          });
        }
        projectLinks.append(link);
      });
    };

    const setActiveCard = (card) => {
      if (!card) return;
      activeCard = card;
      activeKey = card.dataset.skillCard || "Data";
      const tool = card.dataset.tool || card.getAttribute("aria-label") || "Selected tool";
      const detail = evidence[tool] || {
        text: nodeByKey(activeKey)?.text || "A practical part of the working stack.",
        projects: ["github"],
      };
      cards.forEach((item) => {
        item.classList.toggle("is-skill-active", item === card);
        item.setAttribute("aria-pressed", String(item === pinnedCard));
      });
      if (activeName) activeName.textContent = tool;
      if (selectionState) selectionState.textContent = pinnedCard === card ? "Pinned" : "Preview";
      if (status) status.textContent = detail.text;
      renderProjectLinks(detail.projects);
      draw(performance.now());
    };

    function draw(time) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(rect.width, 260);
      const h = Math.max(rect.height, 170);
      if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = canvasTheme.background;
      ctx.fillRect(0, 0, w, h);

      const pulse = reduceMotion ? 0 : Math.sin(time * 0.003) * 0.35 + 0.65;
      links.forEach(([from, to]) => {
        const a = nodeByKey(from);
        const b = nodeByKey(to);
        const active = from === activeKey || to === activeKey;
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.strokeStyle = active ? hexToRgba(canvasTheme.primary, 0.22 + pulse * 0.28) : "rgba(110, 110, 115, 0.18)";
        ctx.lineWidth = active ? 1.8 : 1;
        ctx.stroke();
      });

      nodes.forEach((node) => {
        const x = node.x * w;
        const y = node.y * h;
        const active = node.key === activeKey;
        ctx.beginPath();
        ctx.fillStyle = active ? hexToRgba(node.color, 0.18) : "rgba(110, 110, 115, 0.08)";
        ctx.arc(x, y, active ? 20 + pulse * 3 : 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.arc(x, y, active ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = active ? canvasTheme.ink : canvasTheme.muted;
        ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.label, x, y + 32);
      });
    }

    const loop = (time) => {
      draw(time);
      rafId = requestAnimationFrame(loop);
    };

    cards.forEach((card) => {
      card.addEventListener("pointerenter", () => setActiveCard(card));
      card.addEventListener("pointerleave", () => {
        if (pinnedCard) setActiveCard(pinnedCard);
      });
      card.addEventListener("focusin", () => setActiveCard(card));
      card.addEventListener("click", () => {
        pinnedCard = pinnedCard === card ? null : card;
        setActiveCard(card);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !pinnedCard) return;
      pinnedCard = null;
      setActiveCard(activeCard || cards[0]);
    });
    window.addEventListener("resize", () => draw(performance.now()));
    setActiveCard(cards[0]);
    if (!reduceMotion) rafId = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else if (!reduceMotion) rafId = requestAnimationFrame(loop);
    });
  }

  /* ---------- Live code-to-page preview ---------- */
  function initBuildDemo() {
    const widget = $("#build-widget");
    const preview = $("#build-preview");
    const toggle = $("#build-toggle");
    const replay = $("#build-replay");
    if (!widget || !preview || !toggle || !replay) return;

    const lines = $$(".code-row", widget);
    const snippets = lines.map((line) => line.dataset.code || "");
    const counter = $(".build-footer span", widget);
    lines.forEach((line, index) => {
      line.dataset.line = String(index + 1).padStart(2, "0");
    });

    if (reduceMotion) {
      toggle.hidden = true;
      replay.hidden = true;
      return;
    }

    let timer = 0;
    let lineIndex = 0;
    let charIndex = 0;
    let paused = false;
    let visible = !("IntersectionObserver" in window);

    function clearTimer() {
      window.clearTimeout(timer);
      timer = 0;
    }

    function reset() {
      lines.forEach((line) => {
        line.textContent = "";
        line.classList.remove("is-typing");
      });
      lineIndex = 0;
      charIndex = 0;
      preview.dataset.stage = "0";
      if (counter) counter.textContent = "00 / 04";
    }

    function schedule(delay) {
      clearTimer();
      if (!paused && visible && !document.hidden) timer = window.setTimeout(tick, delay);
    }

    function tick() {
      if (lineIndex >= lines.length) {
        reset();
        schedule(400);
        return;
      }
      const line = lines[lineIndex];
      const code = snippets[lineIndex];
      line.classList.add("is-typing");
      if (charIndex < code.length) {
        line.textContent = code.slice(0, ++charIndex);
        schedule(42);
        return;
      }
      line.classList.remove("is-typing");
      lineIndex += 1;
      charIndex = 0;
      preview.dataset.stage = String(lineIndex);
      if (counter) counter.textContent = `${String(lineIndex).padStart(2, "0")} / 04`;
      schedule(lineIndex === lines.length ? 2600 : 500);
    }

    function setPaused(next) {
      paused = next;
      widget.dataset.paused = String(next);
      const label = next ? "Play animation" : "Pause animation";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
      if (next) clearTimer();
      else schedule(0);
    }

    toggle.addEventListener("click", () => setPaused(!paused));
    replay.addEventListener("click", () => {
      reset();
      setPaused(false);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimer();
      else schedule(0);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) schedule(0);
        else clearTimer();
      }, { threshold: 0.1 }).observe(widget);
    }

    reset();
    schedule(0);
  }

  /* ---------- helpers ---------- */
  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function initIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  /* ---------- boot ---------- */
  initIcons();
  initHashPosition();
  initLifecycleTabs();
  initScrollSync();
  initScrollReveal();
  initCommandPalette();
  initSkillMap();
  initBuildDemo();
})();
