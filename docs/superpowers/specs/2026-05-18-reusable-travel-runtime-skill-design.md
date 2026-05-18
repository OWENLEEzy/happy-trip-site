# Reusable Travel Runtime Skill Design

Date: 2026-05-18
Status: implemented

## Summary

`happy-trip-site` should become a reusable skill that turns travel notes, pasted tables, or rough schedules into a mobile-first static travel site and an optional Vercel production URL.

The core change is architectural: the skill should stop generating new page structures per trip. It should use one stable, destination-neutral Travel Runtime, then vary only data, UI tokens/config, generated media, and copy. This keeps the product reusable and reduces regressions in maps, navigation, links, and mobile layout.

The runtime must not contain prototype-specific names, copy, fields, or visual defaults. Any existing source site is only a reference for the interaction model.

## Goals

- Accept travel notes or spreadsheet-like itinerary text as the main input.
- Generate a static SPA-style travel tool with one active day at a time.
- Keep the runtime skeleton stable across destinations.
- Support destination-specific UI customization through a recorded UI Brief.
- Use stable network image URLs as the default media source.
- Validate the generated site before claiming local completion.
- Deploy to Vercel production only after explicit production deployment confirmation.

## Travel Runtime

The static template should use destination-neutral files:

```text
skill/happy-trip-site/assets/static-template/
  index.html
  vercel.json
  assets/css/travel.css
  assets/js/travel-data.js
  assets/js/travel-ui-components.js
  assets/js/travel-map.js
  assets/js/travel.js
```

The runtime should provide a fixed product skeleton:

- Topbar with current view status.
- Sidebar drawer for the shared resource page and day navigation.
- A shared `generalResources` view for full-trip notes.
- One active day view at a time.
- Day hero, route overview, timeline checklist, link pills, and prev/next day controls.
- Leaflet marker maps with fullscreen support.
- `mapStopLabels` badges that bind itinerary cards to map marker numbers.
- `localStorage` state for active view and completed checklist items, namespaced by `tripSlug`.
- Menu-open layer isolation so maps and global controls never cover the drawer or scrim.

The runtime should use these browser globals:

- `window.HAPPY_TRIP_DATA`
- `window.HappyTripUIComponents`
- `window.HappyTripMap`

The runtime and generated output must not include destination/prototype-specific globals, UI copy, CSS hooks, localStorage keys, or schema fields.

## Data Contract

The generated data should be written to `assets/js/travel-data.js` as:

```js
window.HAPPY_TRIP_DATA = {
  meta: {},
  ui: {},
  generalResources: {},
  days: []
};
```

`meta` stores factual trip-level data:

- `tripTitle`
- `tripSlug`
- `dateRange`
- `language`
- `assumptions`
- `uncertainItems`

`ui` stores the confirmed UI option from the UI Brief. Runtime structure stays fixed; UI options can change palette, typography, density, hero treatment, card tone, link treatment, map visual treatment, ambient effects, motifs, and copy tone.

`generalResources` is optional but recommended. It should hold full-trip guidance such as transit, luggage, payment, weather, entry requirements, shared guide links, or hotel rules. High-risk or time-sensitive content must be marked for user verification instead of stated as permanent fact.

Each `days[]` entry should contain:

- `n`, `date`, `city`, `areaLabel`, `title`, and `themeLabel`
- `hero` with direct image URL, alt text, source name/source URL, and query metadata
- `routeOverview` with `title`, `mode`, and `stops`, or grouped `sections`
- `morning`, `afternoon`, and `evening` item arrays

Each item can contain:

- `time`, `tag`, `tagText`, `title`, `subtitle`, and `note`
- `image`
- `sections`
- `mapStopLabels`
- `links`

Route and link rules:

- `routeOverview.stops[].label` is the visible marker-number source.
- `item.mapStopLabels[]` must exactly match displayed stop labels.
- Real destinations, restaurants, hotels, shops, meeting points, and arrival/departure anchors should have their own items when they are part of the route.
- Ordinary transfer stations should stay in notes unless they are actual route anchors.
- Destination cards own maps, official, booking, and restaurant links.
- Guide/reference cards own research links such as video, social, blog, or route guides.
- Visible URLs should have one owner in the timeline.
- Movement cards explain transit and should not duplicate destination links by default.

## UI Brief Flow

The skill should use a recommended-default flow:

1. Extract a factual Trip Brief from user notes.
2. Ask for missing blocking facts.
3. Create exactly three UI Brief options.
4. Generate three local preview HTML files using real trip content.
5. If the user says "use the recommended default" or equivalent, select the recommended option automatically.
6. Otherwise, ask the user to choose A/B/C or request a recorded mix.
7. Record the full confirmed UI option in `ui-brief.json` and `HAPPY_TRIP_DATA.ui`.
8. Show a final confirmation summary before generation.

UI previews are selection aids, not complete sites. Each preview must show:

- Real trip title and destination context.
- A real network hero image selected by the agent.
- One route summary.
- One or two real itinerary cards.
- Link pills.
- A visible UI option summary.

The three options must be materially distinct in palette, typography, density, card tone, hero treatment, map visual treatment, motifs, and copy tone. They must not use fallback palettes or old demo palettes as selectable designs.

## Media Strategy

The default media source is stable external network image URLs. The agent selects images automatically and does not ask the user to approve individual slots unless the user explicitly requests media control.

Priority order:

1. Official tourism or venue pages.
2. Wikimedia Commons.
3. Unsplash.
4. Pexels.
5. Other stable public image hosts only when the first four cannot cover the route.

Media should be recorded as:

```json
{
  "url": "https://example.com/image.jpg",
  "source_name": "Wikimedia Commons",
  "source_url": "https://example.com/source-page",
  "alt": "Marina Bay skyline in Singapore",
  "query": "Singapore Marina Bay skyline"
}
```

Rules:

- The manifest must store the URL, source metadata, alt text, and query.
- Image generation is optional fallback only when the user asks for generated visuals or no suitable network image can be found.
- If generated images are used, they must never be described as documentary photos.
- The skill should stop and ask only when no acceptable network or explicitly requested generated fallback can be selected.

## Generation Workflow

Generation should write these artifacts into the generated site folder:

- `index.html`
- `vercel.json`
- `assets/css/travel.css`
- `assets/js/travel-data.js`
- `assets/js/travel-ui-components.js`
- `assets/js/travel-map.js`
- `assets/js/travel.js`
- `trip-brief.json`
- `ui-brief.json`
- `media-brief.json`
- `media-manifest.json`
- `generation-result.json`

The generator should copy the stable runtime, write direct image URLs into `travel-data.js`, write `media-manifest.json` as an audit record, and preserve the source briefs for auditability. It should not download images into `assets/media/` by default.

Vercel deployment remains a separate confirmed step. Local generation and validation can complete without deployment.

## Validation

Validation must cover more than file presence.

Generated project checks:

- Required files exist.
- HTML loads scripts in order: data, UI components, map, app.
- `window.HAPPY_TRIP_DATA` parses.
- Image URLs exist, use `http://` or `https://`, include alt text, and include source metadata. Local `assets/media/` paths remain valid for compatibility.
- No placeholder, sample, old demo, or prototype-specific strings remain.

Data checks:

- `meta.tripTitle`, `meta.tripSlug`, and `meta.language` exist.
- At least one day exists.
- Each day has at least one itinerary item.
- Each day has route stops or route sections.
- Stop labels are unique inside each displayed route section.
- Every `mapStopLabels` value matches a displayed stop label.
- Every route stop has a matching destination or movement card unless explicitly exempted.
- Every visible link has a valid external URL.
- Duplicate visible URLs are rejected.
- Guide/reference and destination link ownership rules are enforced.

UI checks:

- Three UI options exist.
- Recommended and confirmed option IDs match real options.
- Confirmed option is embedded in `HAPPY_TRIP_DATA.ui`.
- Palette and typography tokens are complete.
- Options are visually distinct.
- Ambient effects use an allowlist.
- Audio defaults to disabled. If enabled, it must use local assets and require user interaction.

Runtime checks:

- Syntax checks pass for all runtime JavaScript files.
- Route/card coverage check passes.
- Link ownership check passes.
- Interactive map smoke check confirms Leaflet loader, marker map, fullscreen control, and map resizing hooks.
- Mobile smoke checks cover 390x844 and 375x812, including drawer above map, no incoherent overlap, and tappable link buttons.

## Non-Goals

- Do not create multiple runtime templates for v1.
- Do not expose prototype-specific design language in the reusable skill.
- Do not require external photo search by default.
- Do not deploy to production without explicit confirmation.
- Do not generate a marketing landing page instead of the usable travel tool.

## Assumptions

- The current map-over-drawer fix should be preserved in the new runtime.
- Existing generated-site validation should be replaced or expanded, not removed.
- Backward compatibility with older `theme-brief` inputs can remain as a temporary alias, but new work should use `ui-brief`.
- Image generation outputs must be copied into the generated project before the site references them.
- Users can still request documentary photos, but that becomes an explicit mode rather than the default.
