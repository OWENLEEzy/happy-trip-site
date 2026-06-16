# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

`happy-trip-site` is a reusable **agent skill** that guides an AI agent to turn natural-language travel notes into a static, mobile-first itinerary website. It is not a runnable program — it is an instruction set (`skill/happy-trip-site/SKILL.md`) that agents execute using Write and Bash tools.

The reusable skill lives at `skill/happy-trip-site`. To use it as a Claude Code skill, copy that folder to `~/.claude/skills/happy-trip-site` so `SKILL.md` sits directly inside that path.

## Commands

```bash
# Run helper unit tests
node --test tests/travel-helpers.test.js

# Run layout composer unit tests
node --test tests/travel-layouts.test.js

# Run all tests
node --test tests/*.test.js

# Validate generated trip data (accepts travel-data.js or any preview HTML)
node skill/happy-trip-site/scripts/verify-preview.mjs <path-to-file>

# Validate rendered mobile tap targets in a real browser
node skill/happy-trip-site/scripts/verify-mobile-runtime.mjs <path-to-index-or-preview.html>

# Example: validate the live demo data
node skill/happy-trip-site/scripts/verify-preview.mjs docs/assets/js/travel-data.js
```

No build step. The runtime is plain HTML/CSS/JS. Node.js is needed to run tests and verifiers; the browser-backed mobile verifier also needs Playwright available in the execution environment.

## Architecture

### Two Separate Concerns

1. **Skill instruction set** (`skill/happy-trip-site/`) — guides the agent through a gated workflow. The agent reads these references and acts as the generator.
2. **Static runtime template** (`skill/happy-trip-site/assets/static-template/`) — destination-neutral HTML/CSS/JS that renders any trip from `window.HAPPY_TRIP_DATA`. The generated site is a copy of this template plus a `travel-data.js` the agent writes.

### Runtime Script Load Order

`index.html` loads scripts in this fixed order — changing it breaks the app:

1. `travel-data.js` — assigns `window.HAPPY_TRIP_DATA`
2. `travel-helpers.js` — pure helpers (no DOM); also `require()`-able in tests
3. `travel-ui-components.js` — shared browser helpers (escaping, icons, link pills, image rendering)
4. `travel-map.js` — Leaflet map behavior, lazy-loaded
5. `travel-layouts.js` — layout composer registry
6. `travel.js` — app state and composition; calls `applyUiTokens()` then `applyAesthetic()`

### Key Data Contract

`window.HAPPY_TRIP_DATA` must have:

```js
{
  meta: { tripTitle, tripSlug, dateRange, language, hero, ... },
  ui: { confirmed_option, options: [...] },   // confirmed_option has an `aesthetic` block
  generalResources: {},                        // optional shared links view
  days: [{ n, date, hero, routeOverview, morning, afternoon, evening }]
}
```

`mapStopLabels` on items must byte-match the displayed route stop labels — a mismatch silently drops the numbered badge.

### Layout Composer Registry (`travel-layouts.js`)

`travel-layouts.js` exports `registry`, `pick`, and `resolve`. Each composer (`classic`, `timeline`, `editorial`, `sensory`, `navigator`) receives day parts and returns an HTML string. `resolve({ layout, archetype })` selects the composer: explicit `layout` wins over `archetype`; unknown values fall back to `classic`. The `archetype` field in the confirmed UI option is the normal dispatch path.

### Aesthetic Layer

`buildAesthetic()` in `travel-helpers.js` maps the `aesthetic` block to CSS vars (`--texture-bg`, `--motif-bg`, `--serif`, `--sans`, `--color-accent`, etc.) and a Google-Fonts `href`. It validates hex colors, rejects CSS-injection in URL values, and allowlists `fonts.googleapis.com` only. `applyAesthetic()` in `travel.js` consumes these to set `body::before` (texture), `body::after` (motif), `#destGlyph`, and font vars.

### Verifier (`scripts/verify-preview.mjs`)

Zero-dependency Node.js script. Pass it a preview HTML file **or** `travel-data.js`. It catches silent failures that eyes and grep miss: double-encoded textures (`%2523`), `mapStopLabels` that don't match a route stop, a missing aesthetic block, thin days, and items with no link. Run it on every preview before showing the user, and again on the final generated `travel-data.js`.

### Mobile Runtime Verifier (`scripts/verify-mobile-runtime.mjs`)

Browser-backed Node.js script. Pass it a preview HTML file or final `index.html`. It opens a 390px mobile viewport and fails if core controls (`.menu-btn`, `.it-check`, `.quick-link`, `.map-route-link`, `.route-pin-link`, and enabled `.nav-btn`) are hidden or below 44x44px after CSS cascade. Run it after `verify-preview.mjs`; for final sites, write `mobile-usability-result.json` with `--report`.

### `docs/` — The Live Demo

`docs/` is a deployed GitHub Pages instance (9-day Malaysia + Singapore itinerary). Its JS files mirror the template. Changes to `skill/happy-trip-site/assets/static-template/assets/js/` must be kept in sync with `docs/assets/js/` when the live demo is updated.

## Hard Rules (from SKILL.md)

- Do not generate or deploy until the Trip Brief readiness gate passes and the user confirms.
- Every itinerary item must have at least one visible tappable link button.
- Every day must have `routeOverview.stops` for the route button and numbered pins.
- Generated output file is always `assets/js/travel-data.js` assigning `window.HAPPY_TRIP_DATA` — never `trip-data.js` or any other name.
- Refuse to overwrite an existing output folder unless the user explicitly requests it.
- Return `ready_to_share`, `package_ready`, or `blocked`; put the shareable URL first only when the smoke test passes.

## Extension Points

When adding capabilities, prefer one of:
- Data schema: `references/itinerary-schema.md`
- UI option fields / `aesthetic` block: `references/design-principles.md` + `ui-brief.json`
- Pure logic (unit-tested): `travel-helpers.js`
- Shared browser helpers: `travel-ui-components.js`
- Map behavior: `travel-map.js`
- App composition / layout dispatch: `travel.js`
- Layout composers: `travel-layouts.js`

Do not create a second runtime template unless the product contract itself changes.
