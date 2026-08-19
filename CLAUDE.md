# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build system, package manager, linter, or test suite in this repository — it is plain static HTML/CSS/JS. To "run" a page, open its `index.html` (or other `.html` file) directly in a browser.

## Architecture

This repository is not a single application. It is a collection of independent, self-contained static site folders, each with its own `index.html`/`style.css`/(optionally) `.js`, no shared code, and no external dependencies or frameworks:

- `hello world/` — a set of learning/demo pages: `index.html` (animated gradient background; button triggers an alert, a background color change, and opens a new window) and `rps.html` (rock-paper-scissors game with animated result display), sharing `style.css`.
- `profile/` — a self-introduction card page: `index.html` + `style.css` (purple `#667eea` theme, centered card layout) + `main.js` (currently just an empty `initApp` function, not yet wired up).

When adding a new page or feature, follow the existing pattern of giving it its own folder with its own `index.html`/`style.css`/`main.js` rather than sharing state or styles across folders.

# 주의
- 주석은 한글로 달아줘
- 진행상태 한국어로 알려줘