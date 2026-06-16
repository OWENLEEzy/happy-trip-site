# Itinerary Schema

Use this reference before generating a site.

## Trip Brief

Represent the extracted trip as JSON:

```json
{
  "trip_title": "Osaka Nara Three Day Trip",
  "trip_slug": "osaka-nara-three-day",
  "date_range": "2026-05-09 to 2026-05-11",
  "language": "zh-CN",
  "deploy_to_vercel_prod": true,
  "output_desktop_folder": "~/Desktop/osaka-nara-three-day-travel-site",
  "assumptions": [
    "Missing place links will use Google Maps search URLs."
  ],
  "uncertain_items": [
    "The exact Namba hotel name was not provided."
  ],
  "days": []
}
```

Rules:

- Trip Brief stays factual. Do not hide UI choices in the trip data.
- Provide 3 `ui_options` before generation and generate preview HTML files for them.
- `recommended_option_id` is the agent's recommendation.
- `confirmed_option_id` is required unless the user is still choosing.
- The final generated site may only use the confirmed UI option. Theme Brief is a backward-compatible input alias only.

## UI Brief

Visual style lives in a separate UI Brief. Each option is a complete design contract, not a hidden theme ID. The user must choose one preview, request a recorded mix, or explicitly delegate the recommended default before generation:

```json
{
  "recommended_option_id": "urban-bay-neon",
  "confirmed_option_id": "urban-bay-neon",
  "ui_options": [
    {
      "id": "urban-bay-neon",
      "name": "城市海湾夜行",
      "reason": "Destination, route density, season, and activity mix support this direction.",
      "archetype": "editorial",
      "layout_profile": "bay-garden-evening",
      "palette": {
        "background": "#DFF7F2",
        "surface": "#FFFDF5",
        "ink": "#102A2B",
        "muted": "#557174",
        "accent": "#006D77",
        "accent2": "#FFB000",
        "line": "rgba(16,42,43,.16)"
      },
      "typography": {
        "sans": "system-ui",
        "serif": "serif",
        "display": "system-ui"
      },
      "density": "spacious",
      "navigation": "topbar-drawer",
      "hero_treatment": "split-photo-panel",
      "card_treatment": "block-cards",
      "link_treatment": "route-first-toolbar",
      "map_treatment": "route-panel-first",
      "motion_level": "subtle",
      "motifs": ["bay", "metro", "night-lights"],
      "aesthetic": {
        "texture": "data:image/svg+xml,...feTurbulence...",
        "textureOpacity": 0.12,
        "motif": "data:image/svg+xml,...repeating-motif...",
        "glyph": { "mark": "関西", "rotate": -4 },
        "fontDisplay": "\"Shippori Mincho\", Georgia, serif",
        "fontBody": "\"Noto Sans JP\", system-ui, sans-serif",
        "fontLink": "https://fonts.googleapis.com/css2?family=Shippori+Mincho&display=swap"
      }
    }
  ]
}
```

Rules:

- The UI Brief must provide 3 options and each option must be shown through a local preview file.
- A confirmed UI option must include all of: `archetype`, `layout_profile`, `palette`, `typography`, `density`, `navigation`, `hero_treatment`, `card_treatment`, `link_treatment`, `map_treatment`, `motion_level`, and `motifs`.
- `layout_profile` is a descriptive metadata label for the visual theme of this option. It does not load CSS at runtime — **`archetype` is what the runtime resolves to a layout composer**. Use `layout_profile` to give the option a memorable destination-specific name (e.g. `kyoto-washi-calm`, `bali-terracotta-sensory`, `iceland-aurora-minimal`), but always set `archetype` to drive actual layout behavior. The three existing profiles (`bay-garden-evening`, `peranakan-tropical-blocks`, `metro-food-clean`) are examples from the Malaysia–Singapore demo — they have no special runtime status; name your three options after the destination's character, not after Southeast Asia geography.
- `archetype` — the canonical identity of the option's structural shape, one of `sensory` / `editorial` / `navigator` (the Navigation-first variant; `navigation-first` is accepted as an alias). The runtime maps it to a layout composer (`travel-layouts.js` → `resolve`): `sensory` → cinematic photo-essay (image-led cards, route plate at the foot), `editorial` → travel-magazine (numbered period sections, route demoted to a foot reference), `navigator` → clear/practical (route block hoisted to the top, items on a scannable time-column checklist). This is how destination analysis reaches the rendered page — set it on every option. An unknown/missing archetype (with no explicit `layout`) falls back to `classic`.
- `layout` — optional power-user override that selects the section-arrangement composer directly, taking precedence over `archetype`. Known values: `classic` (default — hero → route card → morning/afternoon/evening periods), `timeline` (compact hero → one vertical spine of every item, no period headers → compact route chip), `editorial`, `sensory`, `navigator` (the same composers `archetype` resolves to). Omitted → resolve from `archetype`; unknown → `classic`. The same itinerary elements (check-off, progress, route pins, link pills) render in every layout; only their arrangement changes.
- **Treatment values that actually have dedicated CSS** (any other value on these axes renders as the unstyled default, so do not rely on it to differentiate options): `density` → `compact` / `spacious`; `hero_treatment` → `split-photo-panel`; `card_treatment` → `block-cards` / `checklist-rows`; `link_treatment` → `route-first-toolbar`; `map_treatment` → `route-panel-first` / `stop-chips-first`; `motion_level` → `none`. `navigation` has a single mode (topbar drawer + per-day prev/next); it is not a differentiating axis. You may still record other descriptive values, but to guarantee a *visible* difference between options vary the CSS-backed values above, plus `layout_profile`, `palette`, and the `aesthetic` block (which always renders).
- `palette` must include semantic keys: `background`, `surface`, `ink`, `muted`, `accent`, `accent2`, and `line`.
- `palette` must be a visible destination-specific choice. Do not use the template fallback palette or old demo palettes as a selectable UI option.
- The 3 UI options must be materially distinct *in what actually renders*: use 3 distinct `archetype` values (`sensory` / `editorial` / `navigator`), 3 distinct palette signatures, 3 distinct `aesthetic` blocks (texture/motif/glyph/font), and distinct values on the CSS-backed treatment axes listed above (e.g. one option `density: compact` + `card_treatment: checklist-rows` + `map_treatment: stop-chips-first`, another `density: spacious` + `hero_treatment: split-photo-panel` + `card_treatment: block-cards`). Distinctiveness that exists only in treatment strings with no CSS does not count. `layout_profile` names may also differ (and should reflect the destination character) but `layout_profile` alone does not produce visual distinction at runtime.
- `motion_level` must respect `prefers-reduced-motion`; `none` must disable nonessential animation.
- If the user says to use the recommended default, still record the full chosen UI option in `ui-brief.json` and generated `HAPPY_TRIP_DATA.ui`.

### Cultural Aesthetic Block

Each `ui_options[]` entry should carry an `aesthetic` block so the deployed site renders destination personality, not just a palette. The deployed runtime applies it (`travel.js` → `buildAesthetic`) right after the UI tokens. Derive every field from the Four Axes in `design-principles.md`; omit any layer for which nothing clean applies (an omitted layer simply renders nothing).

- `texture`: a feTurbulence SVG `data:` URI for the page grain (`body::before`). Optional. **Safe procedure:** build the raw SVG string with a literal `#` (in `filter="url(#t)"` and `fill="#RRGGBB"`), then URL-encode it exactly once; then assert the result contains `%23t` and NOT `%2523t`, and run `scripts/verify-preview.mjs` which fails the build on `%2523`. **Encoding (silent-failure trap):** the SVG needs an internal filter reference `filter="url(#t)"` and hex fills like `fill="#B45309"`. In the final `data:` URI string the `#` MUST appear as `%23` exactly once. If you copy a ready-encoded data-URI (like those in `design-reference.css`), use it verbatim and do NOT pass it through `encodeURIComponent` again. If you build the URI from a raw SVG string with literal `#`, run `encodeURIComponent` exactly once. Never pre-write `%23` and then encode again — that yields `%2523`, the browser decodes it to `url(%23t)`, the filter ref breaks, and the texture renders as nothing while still passing every "texture present" grep. After generating, sanity-check the string contains `%23t` (not `%2523t`). **Quote trap:** the runtime's `isSafeUrl` rejects any `texture`/`motif` value containing a literal `"` (double quote) and silently falls back to the neutral theme. A correctly URL-encoded data-URI has its quotes as `%22`, so this never triggers if you encode once — but if you hand-write the SVG with raw `"..."` attributes and skip encoding, use single quotes inside the SVG (`width='180'`) like the `design-reference.css` samples. `verify-preview.mjs` now fails on a literal `"` in these fields.
- `textureOpacity`: number, default `0.12` (values below ~0.10 vanish on phones). Only used when `texture` is present.
- `motif`: a repeating-motif SVG `data:` URI for the page motif wash (`body::after`); bake opacity into the SVG fill. Optional.
- `glyph`: `{ "mark": "<1-3 chars>", "rotate": <degrees, default -4> }` for the topbar `#destGlyph` mark. Optional.
- `fontDisplay`: CSS font stack for headings (maps to the runtime `--serif` token). Optional.
- `fontBody`: CSS font stack for body text (maps to `--sans`). Optional.
- `fontLink`: a Google-Fonts stylesheet URL. **Host-allowlisted**: only `https://fonts.googleapis.com/` is injected; any other host is ignored for safety. Optional.

The three preview options must differ on the cultural layer (texture/motif/glyph/font), not only on palette.

### Beginner UI Brief Fields

Every new UI Brief should include:

- `sharing_context`: object with `id`, `label`, and `source`.
- `fit_statement`: on every `ui_options[]` entry, one beginner-readable sentence saying who the style fits.
- `beginner_traits`: on every `ui_options[]` entry, 3 to 5 plain-language traits.
- `style_revision`: object with `requested`, `applied_to_option_id`, and `summary`.
- `completion_states`: object with `sharing_context_confirmed`, `style_selected`, and `style_revision_recorded`.

## Media Brief

Media choices live in a separate Media Brief. By default the agent selects stable network image URLs automatically; do not ask the user to approve individual image slots unless the user explicitly requests media control. Do not use placeholders.

Rules:

- `siteHero` must include direct image metadata.
- Every day must have a `dayHeroes.day-N` image.
- Each image must include `url`, `alt`, `query`, and at least one of `source_name` or `source_url`.
- `url` must start with `http://` or `https://`.
- Local media paths under `assets/media/` remain supported for older generated projects, but new generation should not download images by default.
- Add a `reason` to every image documenting how its content was verified (e.g. `"Wikipedia article Kek Lok Si lead image"`).
- Keep every image slot distinct: do not reuse a day's hero photo as that day's first item image, and avoid repeating the same file across days. Each anchor item that carries an image should show its own subject, so the page never looks like one photo on repeat.

### Choosing images (content MUST be verified, not just the URL)

A `curl 200` proves the URL is *alive*, not that the photo shows the right place. Opaque-ID images (Unsplash/Pexels `photo-<id>`) are the main failure mode: an agent cannot see what they depict and ships mismatched heroes. Pick each image from these content-verifiable sources, in order:

**Hard rule for hero + day-hero slots: it MUST be a specific, recognizable named landmark** (a temple, peak, old-town street, bridge, named tower) drawn from sources 1–3 below. Anonymous city skylines, generic beaches/streets/sunsets, and food-only close-ups are NOT acceptable hero or day-hero images — they make the site read as a stock recolor instead of a bespoke destination guide. Build each hero query from the landmark's proper name, not "`<city> skyline`". If no verified landmark photo can be found for a hero slot, ask the user rather than substituting generic scenery.

1. **Wikipedia REST API (strongest for natural landmarks, temples, old towns).** Fetch `https://en.wikipedia.org/api/rest_v1/page/summary/<Article_Title>` and use `originalimage.source` (or `thumbnail.source` if no original). The article title *is* the subject, so the lead image is usually on-topic. Example title forms: `Kek_Lok_Si`, `Penang_Hill`, `Batu_Caves`. **WARNING: for companies, brands, and modern towers the REST lead image is frequently a corporate logo, coat-of-arms, SVG, or map — NOT a photo.** `Petronas_Towers` and `Kuala_Lumpur_Tower` are known offenders that return logos. Confirm the URL ends in `.jpg`/`.png` and depicts a photograph (reject anything whose filename contains `logo`, `seal`, `coat_of_arms`, or ends in `.svg`); if it fails, fall back to Commons file search (step 2).
2. **Wikimedia Commons file search.** Fetch `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=5&srsearch=<place>`; choose a result whose **filename contains the landmark keywords** (e.g. `File:Kek_Lok_Si_Temple_Penang.jpg`), then use the stable redirect `https://commons.wikimedia.org/wiki/Special:FilePath/<Exact_File_Name>?width=1600`. Never hand-build `/thumb/<hash>/` paths, and never reconstruct a `…/NNNpx-<File>` thumbnail URL (arbitrary widths return HTTP 400). If the Wikipedia REST `originalimage.source` from step 1 is itself a `/thumb/…` URL, take its filename and rebuild it as `Special:FilePath/<File>?width=1600` — that endpoint resizes server-side and always resolves.
3. **Official tourism / venue page** — copy the direct image URL from an authoritative page.
4. **Unsplash / Pexels — NOT for hero or day-hero slots** (see the hard rule above). Allowed only as a last resort for an *item-level* secondary photo that genuinely has no specific landmark (a generic "local breakfast" or "market stall" card). For ANY opaque-ID source you must first open the source page and confirm its title/description matches the subject before using it; if you cannot confirm the content, discard it.
5. **Modern tower / building with no clean Commons photo** (e.g. KL Tower / Menara KL often returns only logos and other-building skylines): accept a content-verified *city skyline* photo that visibly includes that structure, or use the structure's own Commons category page result, and set the `alt`/`reason` to the skyline framing. Better an honest "the tower in its skyline" than a logo. Never ship the logo.

After choosing, `curl -sIL -o /dev/null -w '%{http_code}' "<url>"` must print `200`. Drop or replace any URL that does not. Liveness check and content verification are both required.
- Do not use placeholder images, sample images, generated blank cards, or old Kansai visual assets as final media.

```json
{
  "siteHero": {
    "url": "https://example.com/site-hero.jpg",
    "source_name": "Wikimedia Commons",
    "source_url": "https://example.com/source-page",
    "alt": "Gardens by the Bay Supertree Grove, Singapore",
    "query": "Gardens by the Bay Supertree Grove",
    "reason": "Named landmark — Wikipedia article Gardens by the Bay lead image.",
    "width": 1600,
    "height": 1000
  },
  "dayHeroes": {
    "day-1": {
      "url": "https://example.com/day-1.jpg",
      "source_name": "Official tourism site",
      "source_url": "https://example.com/day-1-source",
      "alt": "Gardens by the Bay at dusk",
      "query": "Singapore Gardens by the Bay dusk"
    }
  }
}
```

## Generated Runtime Data (`HAPPY_TRIP_DATA`)

The Trip Brief, UI Brief, and Media Brief above are *authoring* inputs. The generated `assets/js/travel-data.js` assigns a single `window.HAPPY_TRIP_DATA` object whose field names differ from the brief field names. Map them carefully — the deployed runtime falls back to a neutral gray theme when it cannot find the fields it actually reads.

```js
window.HAPPY_TRIP_DATA = {
  meta: {
    tripTitle: "槟城 · 怡保 · 吉隆坡 六日游",   // from Trip Brief trip_title
    tripSlug: "penang-ipoh-kl-six-day",         // from trip_slug
    dateRange: "2026-07-04 to 2026-07-09",      // from date_range
    language: "zh-CN",                           // from language
    hero: { /* Media Brief siteHero, verbatim: url, alt, query, source_name, source_url */ },
    assumptions: [],                             // from assumptions
    uncertainItems: []                           // from uncertain_items
  },
  ui: {
    recommended_option_id: "peranakan-jade-heritage",
    confirmed_option_id: "peranakan-jade-heritage",
    confirmed_option: { /* the ONE chosen ui_options[] entry, full object */ }
  },
  generalResources: { title: "Shared resources", /* optional shared notes + links */ },
  days: [ /* one Day object per itinerary day (see Day section) */ ]
};
```

Brief → runtime field mapping (the camelCase rename is the most common cause of a silent gray fallback):

| Authoring brief field | Runtime field the template reads |
| --- | --- |
| `trip_title` | `meta.tripTitle` |
| `trip_slug` | `meta.tripSlug` |
| `date_range` | `meta.dateRange` |
| `language` | `meta.language` |
| `assumptions` / `uncertain_items` | `meta.assumptions` / `meta.uncertainItems` |
| Media Brief `siteHero` | `meta.hero` |
| Media Brief `dayHeroes.day-N` | `days[N-1].hero` |
| UI Brief chosen `ui_options[]` entry | `ui.confirmed_option` (the **object**, not the array; `confirmedOption` is an accepted alias) |

The runtime reads only `ui.confirmed_option`, never `ui.ui_options[]`. Day and Item objects already use runtime casing (`n`, `date`, `city`, `areaLabel`, `title`, `themeLabel`, `routeOverview`, `morning`/`afternoon`/`evening`, and item `time`/`tag`/`tagText`/`title`/`subtitle`/`note`/`mapStopLabels`/`links`), so copy them through as shown in the Day and Item sections below.

## Day

Each day must follow this shape:

```json
{
  "n": 1,
  "date": "05/09",
  "city": "Osaka",
  "areaLabel": "Namba / Nara",
  "title": "Arrive in Osaka",
  "themeLabel": "旅程开场",
  "routeOverview": {
    "title": "Daily Route Overview",
    "mode": "transit",
    "zoom": 11,
    "stops": [
      {
        "label": "Namba",
        "query": "Namba Osaka",
        "inferred": true
      }
    ]
  },
  "morning": [],
  "afternoon": [],
  "evening": []
}
```

## Item

Each item must follow this shape:

```json
{
  "time": "下午",
  "tag": "walk",
  "tagText": "散策",
  "title": "Walk around Shinsaibashi",
  "subtitle": "心斎橋・道頓堀",
  "note": "Start from the covered arcade and walk south to Dotonbori. Allow 90 min; if it rains, the arcade is fully sheltered. Cash still useful at smaller stalls.",
  "mapStopLabels": ["心斎橋筋商店街"],
  "image": { "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Shinsaibashi.jpg?width=1600", "alt": "Shinsaibashi arcade", "source_name": "Wikimedia Commons" },
  "sections": [
    {
      "kicker": "必吃",
      "title": "Dotonbori street food",
      "points": ["たこ焼き at Kukuru", "Ichiran ramen (24h)", "Glico sign photo spot"]
    },
    {
      "kicker": "动线",
      "title": "Getting there",
      "note": "Namba Station exit 14, 5 min on foot."
    }
  ],
  "links": [
    {
      "type": "maps",
      "label": "Google Maps",
      "url": "https://maps.google.com/?q=Shinsaibashi+Osaka",
      "priority": "primary"
    }
  ]
}
```

**Field guidance — write useful density, not filler.** The benchmark site carries a substantive paragraph plus structured detail on every item; sparse one-line cards are the main thing that makes generated output look like a hollow template. Per item:

- `note` — preserve the user's own note verbatim; in addition, write a substantive 1–3 sentence inferred note covering **what to do, timing/logistics, and a fallback or tip**. Do not pad with generic filler; every sentence must add real, place-specific value.
- `time` — display-only label (e.g. `上午`, `14:30`, `傍晚`). The runtime groups items by which array they sit in (`morning`/`afternoon`/`evening`), NOT by this string, so place each item in the array matching its real time and keep the `time` label consistent with that array.
- `subtitle` — a short secondary line (local-language name, district, or one-phrase descriptor) when natural.
- `mapStopLabels` — list the route-overview stop label(s) this item corresponds to, so the runtime can stamp the numbered map-sequence badge (`it-map-seq`) onto the item title. **Labels must match a `routeOverview.stops[].label` byte-for-byte** (watch for trailing spaces, full-width vs half-width punctuation, and casing). On any mismatch the badge silently does not render and the item falls back to plain stop-label chips — a quiet, wrong-looking degradation rather than an error, so verify the labels resolve. **Omit `mapStopLabels` entirely for items that are not one of the route's numbered stops** (a meal, a rest, a wind-down) — the runtime handles its absence cleanly. Do NOT attach a nearby stop's label just to satisfy the field; that mis-numbers the route.
- `image` — for anchor items, a content-verified photo (see "Choosing images"); renders as `it-media` with a sepia-grain treatment.
- `sections[]` — for the day's anchor stops, 1–2 structured sub-cards rendered as a 2-column grid (`it-sections`). Each has `kicker` (short eyebrow, e.g. 必吃/动线/门票), `title`, and EITHER `points` (a bullet list of concrete specifics) OR `note` (a short paragraph), plus optional `image`. This is the single highest-leverage richness lever — use it on every major attraction.
- `tag` — pick from the runtime's colored vocabulary so the tag pill is themed, not neutral: `landmark`, `garden`, `food`, `museum`, `culture`, `walk`, `beach`, `transit`, `rest`. `tagText` is the human label shown (any language). (A tag outside this list still renders, tinted with the destination accent rather than a semantic color.)

## General Resources

`generalResources` powers the "全程通用攻略" view (transit passes, SIM/eSIM, money, packing, etiquette). It is the cross-day reference page and should be as structured as the daily cards, not a flat link dump:

```json
{
  "title": "全程通用攻略",
  "summary": "One-line what-this-covers.",
  "links": [ { "type": "link", "label": "Grab", "url": "https://...", "priority": "primary" } ],
  "sections": [
    {
      "kicker": "交通",
      "title": "Getting around Penang & KL",
      "note": "Optional short intro paragraph.",
      "points": ["Grab is cheapest in George Town", "KL: use Touch 'n Go for LRT/MRT"],
      "steps": [
        { "title": "Buy a Touch 'n Go card", "body": "At any LRT station counter, RM10 + top-up." },
        { "title": "Top up at machines", "body": "Cash or card; keep RM20+ for the airport line." }
      ],
      "links": [ { "type": "maps", "label": "Nearest counter", "url": "https://...", "priority": "secondary" } ]
    }
  ]
}
```

- `sections[].kicker` — short eyebrow label (renders as `resource-card-meta`); `category` is an accepted alias.
- `sections[].points` — bulleted specifics (renders as `resource-points`); the legacy `items` array is still accepted as points.
- `sections[].steps` — ordered procedure, each `{ title, body }`, rendered as numbered `resource-step` cards (the benchmark's signature for how-to guides).
- `sections[].image` — optional content-verified photo (`resource-card-image`).
- Use `steps` for anything procedural (buying a pass, airport→hotel, refund) and `points` for at-a-glance lists. A flat note-only resource card is the thin fallback to avoid.

## Link Contract

Links are not optional decoration. The deployed page should work as the single phone entry point for the trip, so every important reference must become a visible tappable button.

Allowed `links[].type` values:

- `maps`: Google Maps or other map/search links.
- `web`: official websites, ticket pages, booking pages, generic references.
- `tabelog`: restaurant review or reservation pages.
- `video`: YouTube, Bilibili, TikTok, Reels, or other video references.
- `ig`: Instagram references.
- `xhs`: Xiaohongshu references.

Optional `links[].priority` values (controls visual tier and ordering; the runtime sorts critical-first within every link cluster):

- `critical`: must-do references such as booking confirmations or required timed tickets. Rendered as a filled red pill and sorted first.
- `primary`: the default when `priority` is omitted. Rendered as a filled anchor-color pill.
- `secondary`: supporting references. Rendered as an outlined pill and sorted last.

Rules:

- Preserve user-provided URLs exactly.
- Use short mobile labels; prefer `Google Maps`, `官网`, `预约`, `食べログ`, `小红书`.
- If an item has no URL, add a Google Maps search link using the best place query.
- Each day should include `routeOverview.stops` so the template can render one daily Google Maps directions button plus tappable stop pins.

## Readiness Checklist

Blocking requirements:

- `trip_title` exists or can be safely derived.
- `trip_slug` is lowercase letters, numbers, and hyphens.
- At least one day exists.
- Each day has at least one main item.
- Each day has at least two of: date, day number, city or area.
- Every itinerary item has at least one external link.
- Every day has `routeOverview.stops` for mobile route opening.
- `confirmed_option_id` exists and matches a UI Brief option, or the user is still in preview selection.
- The confirmed UI Brief option has all required UI categories and a valid `archetype` value (`sensory`, `editorial`, or `navigator`).
- The UI options are visibly distinct and do not reuse reserved default palettes.
- Network image metadata exists for the site hero and every day hero.
- The user has seen 3 UI previews and confirmed one UI option, requested a recorded mix, or explicitly delegated the recommended default.
- Desktop output behavior is confirmed.
- If deployment is requested, Vercel production deployment is confirmed.
- Major ambiguous places are resolved enough to avoid publishing misleading content.

Optional gaps:

- Missing exact hotel address.
- Missing official restaurant links.
- Missing exact times.

Optional gaps do not block generation. List them in the confirmation summary.

## Confirmation Summary

Before generation, show:

```text
I will generate:
- Trip: <trip_title>
- Days: <count>
- UI: <confirmed_option_id>
- UI Brief: <layout_profile>, <palette summary>, <typography>, <density>, <navigation>, <hero_treatment>, <card_treatment>, <link_treatment>, <map_treatment>, <motion_level>, <motifs>
- UI previews: <option-a path>, <option-b path>, <option-c path>
- Images: automatically selected stable network images
- Output folder: <output_desktop_folder>
- Deployment: <local only or Vercel production>
- Included: day navigation, timeline checklist, route overview, map/search links, mobile layout
- Assumptions: <short list>
- Unresolved optional items: <short list>

Please confirm before I generate and deploy.
```
