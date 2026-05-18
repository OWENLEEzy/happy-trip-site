# Happy Trip Site Architecture

This skill has two separate responsibilities:

1. Guide an agent through a gated travel-site generation workflow.
2. Package a stable static Travel Runtime that can render many trips from data.

The runtime should stay destination-neutral. New trips should change data, UI tokens, media, and copy, not the page skeleton.

## Repository Shape

```text
skill/happy-trip-site/
  SKILL.md
  references/
    architecture.md
    itinerary-schema.md
    extraction-rules.md
    vercel-deploy.md
  scripts/
    create_ui_previews.py
    create_site.py
    validate_site.py
    deploy_vercel.py
  assets/static-template/
    index.html
    vercel.json
    assets/css/travel.css
    assets/js/travel-ui-components.js
    assets/js/travel-map.js
    assets/js/travel.js
```

Generated sites add `assets/js/travel-data.js` and audit artifacts such as `trip-brief.json`, `ui-brief.json`, `media-brief.json`, `media-manifest.json`, and `generation-result.json`. New sites reference stable network image URLs directly; local media under `assets/media/` remains supported for compatibility.

## Data Flow

1. The agent extracts a factual Trip Brief from user notes.
2. The agent prepares exactly three UI Brief options and preview HTML files.
3. The agent automatically selects stable network image URLs for required hero slots.
4. `create_site.py` validates and normalizes the briefs.
5. `create_site.py` copies the stable static template, writes direct image URLs into `assets/js/travel-data.js`, and records source metadata in `media-manifest.json`.
6. The generated browser app reads `window.HAPPY_TRIP_DATA` and renders the travel tool.
7. `validate_site.py` verifies the generated folder before local completion is claimed.
8. `deploy_vercel.py` deploys only after explicit production confirmation.

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

`ui` contains the confirmed UI option and all selectable UI options. Runtime structure stays fixed; this object controls palette, typography, density, navigation, hero treatment, card treatment, link treatment, map treatment, motion level, and motifs.

`generalResources` contains shared full-trip notes and links. It renders as a separate shared resources view when present.

`days[]` contains one renderable day per itinerary day. Each day should include a hero image asset, route overview, and `morning` / `afternoon` / `evening` item arrays. `mapStopLabels` on items must match displayed route stop labels.

## Static Runtime Files

`index.html` is intentionally small. It loads scripts in this order:

1. `assets/js/travel-data.js`
2. `assets/js/travel-ui-components.js`
3. `assets/js/travel-map.js`
4. `assets/js/travel.js`

`travel-ui-components.js` owns shared browser helpers: escaping, icons, link rendering, image rendering, map label badges, and Google Maps URL construction.

`travel-map.js` owns map behavior: lazy Leaflet loading, marker map rendering, fullscreen mode, map resizing hooks, and fallback rendering when coordinates are absent.

`travel.js` owns application state and composition: active view, sidebar, shared resources view, day view, checklist persistence, route overview, timeline items, quick links, and prev/next day controls.

`travel.css` owns the fixed mobile-first layout, UI-token consumption, drawer/map layer isolation, Leaflet marker styles, fullscreen map styles, timeline cards, link pills, and responsive behavior.

## Generator Responsibilities

`create_site.py` is the production generator. It:

- Accepts `--trip-data`, `--ui-brief`, `--media-brief`, and `--output-root`.
- Accepts `--theme-brief` only as a backward-compatible input alias.
- Refuses to overwrite an existing output folder unless `--force` is provided.
- Normalizes older trip fields such as `cityJp`, `themeJp`, and `jp` into neutral fields.
- Adds Google Maps search links when item links are missing.
- Ensures each day has a route overview.
- Binds itinerary cards to route stop labels when it can infer exact matches.
- Copies the runtime template into `<trip-slug>-travel-site`.
- Writes stable network image URLs by default and only preserves local media paths for compatibility.
- Writes `assets/js/travel-data.js`, not `trip-data.js`.
- Writes audit artifacts, not destination-specific runtime files.

## Validation Responsibilities

`validate_site.py` is the completion gate. It checks:

- Required files and script load order.
- `window.HAPPY_TRIP_DATA` parsing.
- Required `meta`, `ui`, and `days` fields.
- UI Brief consistency, distinct options, and reserved-palette rejection.
- Media manifest source metadata and image URL/local path consistency.
- External link validity and duplicate visible URL rejection.
- Route stop uniqueness and `mapStopLabels` coverage.
- Absence of old prototype strings and destination-specific runtime tokens.
- Presence of runtime module capabilities such as UI components, Leaflet loader, marker map rendering, and fullscreen map support.

## Compatibility Boundaries

Backward compatibility exists at the input edge only:

- `--theme-brief` can still be read as an alias for older callers.
- Old trip fields can still be normalized into neutral fields.

Generated output should use the current contract only:

- `assets/js/travel-data.js`
- `window.HAPPY_TRIP_DATA`
- `ui-brief.json`
- no generated `theme-brief.json`
- no generated `trip-data.js`
- no destination/prototype-specific globals or CSS hooks

## Change Rule

When adding capabilities, prefer one of these extension points:

- Data schema in `itinerary-schema.md`
- UI option fields in `ui-brief.json`
- Media metadata in `media-brief.json` / `media-manifest.json`
- Shared helpers in `travel-ui-components.js`
- Map-specific behavior in `travel-map.js`
- App composition in `travel.js`

Do not create a second runtime template unless the product contract itself changes.
