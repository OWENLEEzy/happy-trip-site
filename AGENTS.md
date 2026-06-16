# Agent Usage

This repository packages one installable skill at `skill/happy-trip-site`.

To install: tell your agent **"Install the happy-trip-site skill from https://github.com/owenleezy/happy-trip-site"** — it clones the repo and copies the skill to the correct path automatically.

For other agents without GitHub access, read `skill/happy-trip-site/SKILL.md` first, then load only the referenced files needed for the current step.

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

No build step is required. Node.js is needed for tests and verifiers; the browser-backed mobile verifier also needs Playwright available in the execution environment.

## Hard Rules

- Do not generate or deploy until the Trip Brief readiness gate passes and the user confirms.
- Generate three real-runtime UI previews before final generation; each must show check-offs, progress, route pins, and visible link buttons.
- Every itinerary item must have at least one visible tappable link button.
- Every day must have `routeOverview.stops` for the route button and numbered pins.
- Generated output file is always `assets/js/travel-data.js` assigning `window.HAPPY_TRIP_DATA` — never `trip-data.js` or any other name.
- Refuse to overwrite an existing output folder unless the user explicitly requests it.
- Validate every preview and final `travel-data.js` with `verify-preview.mjs`, then every rendered `index.html` with `verify-mobile-runtime.mjs` before claiming completion.
- Use Vercel Drop as the default publish handoff: package locally, ask the user to drag the folder to `vercel.com/drop`, then smoke-test the returned URL.
- Return `ready_to_share` / `package_ready` / `blocked`; put the shareable URL first only when the smoke test passes.

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
