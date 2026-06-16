# Agent Usage

This repository packages one installable skill at `skill/happy-trip-site`.

For Codex, install or copy that folder into `~/.codex/skills/happy-trip-site`.
For Claude Code, install or copy the same folder into `~/.claude/skills/happy-trip-site`.
For other agents, read `skill/happy-trip-site/SKILL.md` first, then load only the referenced files needed for the current step.

## Commands

```bash
# Run all unit tests
node --test tests/*.test.js

# Validate generated trip data or preview HTML
node skill/happy-trip-site/scripts/verify-preview.mjs <path-to-file>

# Validate rendered mobile tap targets in a real browser
node skill/happy-trip-site/scripts/verify-mobile-runtime.mjs <path-to-index-or-preview.html>

# Validate the live demo data
node skill/happy-trip-site/scripts/verify-preview.mjs docs/assets/js/travel-data.js
```

No build step is required. Node.js is needed for tests and verifiers; the browser-backed mobile verifier also needs Playwright available in the execution environment.

## Core Rules

- Do not generate or deploy until the Trip Brief readiness gate passes and the user confirms.
- Generate three real-runtime UI previews before final generation; each must show check-offs, progress, route pins, and visible link buttons.
- Use Vercel Drop as the default publish handoff: package locally, ask the user to drag the generated folder to `vercel.com/drop`, then smoke-test the returned URL.
- Keep every important guide reference as a visible tappable link in the generated page.
- Validate every preview and final `travel-data.js` with `verify-preview.mjs`, then validate every rendered preview/final `index.html` with `verify-mobile-runtime.mjs` before claiming completion.
- Do not claim `ready_to_share` unless validation, style confirmation, mobile usability, URL smoke test, and backup package are complete. Otherwise report `package_ready` or `blocked`.

## Runtime Notes

Generated sites copy `skill/happy-trip-site/assets/static-template/` and add `assets/js/travel-data.js`.

`index.html` loads scripts in this order:

1. `travel-data.js`
2. `travel-helpers.js`
3. `travel-ui-components.js`
4. `travel-map.js`
5. `travel-layouts.js`
6. `travel.js`

`mapStopLabels` on items must byte-match the displayed route stop labels. A mismatch silently drops the numbered badge, so verifier coverage is required.
