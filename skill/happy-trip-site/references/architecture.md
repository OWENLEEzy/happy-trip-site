# Happy Trip Site Architecture

This skill has two separate responsibilities:

1. Guide an agent through a gated travel-site generation workflow.
2. Package a stable static Travel Runtime that can render many trips from data.

The runtime should stay destination-neutral. New trips should change data, UI tokens, media, and copy, not the page skeleton. The skill is a pure instruction set — there is no Python pipeline; the agent performs generation, validation, and deployment directly with the Write and Bash tools.

## Repository Shape

```text
skill/happy-trip-site/
  SKILL.md
  references/
    architecture.md
    itinerary-schema.md
    extraction-rules.md
    design-principles.md
    design-reference.css
    vercel-deploy.md
  assets/static-template/
    index.html
    vercel.json
    assets/css/travel.css
    assets/css/layouts/{timeline,editorial,sensory,navigator}.css
    assets/js/travel-helpers.js
    assets/js/travel-ui-components.js
    assets/js/travel-map.js
    assets/js/travel-layouts.js
    assets/js/travel.js
```

Generated sites add `assets/js/travel-data.js` and audit artifacts such as `trip-brief.json`, `ui-brief.json`, `media-brief.json`, `media-manifest.json`, and `mobile-usability-result.json`. New sites reference stable network image URLs directly; local media under `assets/media/` remains supported for compatibility.

## Data Flow

1. The agent extracts a factual Trip Brief from user notes.
2. The agent reads `design-principles.md` and derives exactly three UI options (anchor color + `aesthetic` block per option), then writes preview HTML files.
3. The agent automatically selects stable network image URLs for required hero slots.
4. After explicit confirmation, the agent copies the static template into `$HOME/Desktop/<trip-slug>-travel-site/` with the Write tool.
5. The agent writes `assets/js/travel-data.js`, assigning `window.HAPPY_TRIP_DATA` from the Trip Brief, the UI Brief (including the chosen option's `aesthetic` block), and the Media Brief.
6. The generated browser app reads `window.HAPPY_TRIP_DATA` and renders the travel tool.
7. The agent validates the generated folder with Bash file-existence + grep checks (see SKILL.md step 10) before local completion is claimed.
8. The agent zips a backup then instructs the user to drag the output folder to vercel.com/drop (see `vercel-deploy.md`) only after explicit production confirmation.

## Runtime Contract

The generated data file must assign:

```js
window.HAPPY_TRIP_DATA = {
  meta: {},
  ui: {},
  generalResources: {},
  days: []
};
```

`meta` contains trip-level facts such as `tripTitle`, `tripSlug`, `dateRange`, `language`, `assumptions`, `uncertainItems`, and the whole-site hero.

`ui` contains the confirmed UI option and all selectable UI options. Runtime structure stays fixed; this object controls palette, typography, density, navigation, hero treatment, card treatment, link treatment, map treatment, motion level, and motifs. The confirmed option may also carry an optional `aesthetic` block (texture, motif, glyph, fonts) that the runtime applies to the deployed site.

`generalResources` contains shared full-trip notes and links. It renders as a separate shared resources view when present.

`days[]` contains one renderable day per itinerary day. Each day should include a hero image asset, route overview, and `morning` / `afternoon` / `evening` item arrays. `mapStopLabels` on items must match displayed route stop labels.

## Static Runtime Files

`index.html` is intentionally small. It loads scripts in this order:

1. `assets/js/travel-data.js`
2. `assets/js/travel-helpers.js`
3. `assets/js/travel-ui-components.js`
4. `assets/js/travel-map.js`
5. `assets/js/travel-layouts.js`
6. `assets/js/travel.js`

`travel-helpers.js` owns pure, testable helpers with no DOM dependency: link priority sort (`sortLinksByPriority`), today-match (`matchTodayIndex`), and `buildAesthetic`. It uses a dual browser-global / CommonJS export so the same module loads via `<script>` in the deployed site and via `require()` in the unit tests (`tests/travel-helpers.test.js`). It must load before `travel-ui-components.js` and `travel.js`.

`travel-ui-components.js` owns shared browser helpers: escaping, icons, link rendering (emits `data-priority`), image rendering, map label badges, and Google Maps URL construction.

`travel-map.js` owns map behavior: lazy Leaflet loading, marker map rendering, fullscreen mode, map resizing hooks, and fallback rendering when coordinates are absent.

`travel.js` owns application state and composition: active view, sidebar, shared resources view, day view, checklist persistence, route overview, timeline items, quick links, and prev/next day controls. Its `applyAesthetic()` step runs right after `applyUiTokens()` and consumes the confirmed option's `aesthetic` block to render the cultural layers — texture (`body::before`), motif (`body::after`), glyph (`#destGlyph`), and fonts (`--serif`/`--sans`, with a host-allowlisted Google-Fonts `<link>`). It also highlights today's day tab via `matchTodayIndex`.

`travel.css` owns the fixed mobile-first layout, UI-token consumption, drawer/map layer isolation, Leaflet marker styles, fullscreen map styles, timeline cards, link pills (including `[data-priority]` tiers), the cultural-layer hooks, the print stylesheet, and responsive behavior.

## Generation Responsibilities

The agent is the generator. It:

- Copies the runtime template into `<trip-slug>-travel-site` with the Write tool.
- Refuses to overwrite an existing output folder unless the user explicitly asks for overwrite.
- Adds Google Maps search links when item links are missing.
- Ensures each day has a route overview.
- Binds itinerary cards to route stop labels when it can infer exact matches.
- Writes stable network image URLs by default and only preserves local media paths for compatibility.
- Writes `assets/js/travel-data.js` (not `trip-data.js`) assigning `window.HAPPY_TRIP_DATA`.
- Writes audit artifacts, not destination-specific runtime files.

## Validation Responsibilities

Validation is the completion gate, performed with Bash file-existence + grep checks (see SKILL.md step 10). It confirms:

- Required files exist and load in order (including `travel-helpers.js`).
- `window.HAPPY_TRIP_DATA` is present and assignable in `travel-data.js`.
- The viewport meta tag is present in `index.html`.
- At least one visible link button and a Google Maps entry are present.
- The confirmed UI option is materially distinct, not a reserved/template fallback palette.
- `verify-preview.mjs` passes on the generated data, covering silent data/runtime-contract failures such as broken texture encoding, missing aesthetic blocks, linkless items, and route label mismatches.
- `verify-mobile-runtime.mjs` passes on the rendered `index.html` in a real 390px mobile browser viewport, covering computed tap-target size and visibility after layout CSS overrides.

Record the browser-backed outcome in `mobile-usability-result.json` (`mobile_usability_passed: true/false`); it must be `true` before a URL is treated as shareable. A `verify-preview.mjs` PASS alone is not sufficient because that script intentionally does not load CSS or measure layout.

## Compatibility Boundaries

Backward compatibility exists at the data edge only: old trip fields (such as `cityJp`, `themeJp`, `jp`) can still be normalized into neutral fields when reading user input.

Generated output should use the current contract only:

- `assets/js/travel-data.js`
- `window.HAPPY_TRIP_DATA`
- `ui-brief.json`
- no generated `trip-data.js`
- no destination/prototype-specific globals or CSS hooks

## Change Rule

When adding capabilities, prefer one of these extension points:

- Data schema in `itinerary-schema.md`
- UI option fields in `ui-brief.json` (including the `aesthetic` block)
- Media metadata in `media-brief.json` / `media-manifest.json`
- Pure logic in `travel-helpers.js` (unit-tested)
- Shared helpers in `travel-ui-components.js`
- Map-specific behavior in `travel-map.js`
- App composition in `travel.js`

Do not create a second runtime template unless the product contract itself changes.
