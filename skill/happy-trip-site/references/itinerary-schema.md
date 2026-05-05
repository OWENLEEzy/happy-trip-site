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
- The final generated site may only use the confirmed UI option. Theme Brief is a compatibility alias only.

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
      "hero_treatment": "full-bleed-photo",
      "card_treatment": "timeline-cards",
      "link_treatment": "pill-cluster",
      "map_treatment": "embed-with-stop-chips",
      "motion_level": "subtle",
      "motifs": ["bay", "metro", "night-lights"]
    }
  ]
}
```

Rules:

- The UI Brief must provide 3 options and each option must be shown through a local preview file.
- A confirmed UI option must include all of: `layout_profile`, `palette`, `typography`, `density`, `navigation`, `hero_treatment`, `card_treatment`, `link_treatment`, `map_treatment`, `motion_level`, and `motifs`.
- `layout_profile` controls layout, module treatment, labels, and destination-specific visual motifs. It is not decorative metadata.
- Supported layout profiles are `bay-garden-evening`, `peranakan-tropical-blocks`, and `metro-food-clean`.
- `palette` must include semantic keys: `background`, `surface`, `ink`, `muted`, `accent`, `accent2`, and `line`.
- `palette` must be a visible destination-specific choice. Do not use the template fallback palette or old demo palettes as a selectable UI option.
- The 3 UI options must be materially distinct: at least 3 distinct `layout_profile` values, 3 distinct palette signatures, and 3 distinct treatment combinations across density, navigation, hero, cards, links, map, and motion.
- `motion_level` must respect `prefers-reduced-motion`; `none` must disable nonessential animation.
- If the user says to use the recommended default, still record the full chosen UI option in `ui-brief.json` and generated `TRIP_SITE_DATA.ui`.

## Media Brief

Media choices live in a separate Media Brief. Every required media slot must be confirmed and must point to a real selected asset. Do not use placeholders.

Rules:

- `siteHero.confirmed` must be `true`.
- Every day must have a confirmed `dayHeroes.day-N`.
- Every selected candidate must include `remote_url`, `local_path`, `source`, `matched_query`, and at least one of `credit` or `usage_note`.
- `local_path` must be under `assets/media/`.
- Generation fails if a confirmed image cannot be downloaded.
- Do not use placeholder images, sample images, generated blank cards, or old Kansai visual assets as final media.

```json
{
  "siteHero": {
    "confirmed": true,
    "selected_asset_id": "site-hero-01",
    "candidates": [
      {
        "asset_id": "site-hero-01",
        "remote_url": "https://example.com/site-hero.jpg",
        "local_path": "assets/media/site-hero-01.jpg",
        "source": "Source site name",
        "credit": "Photographer or owner",
        "usage_note": "License or usage note",
        "matched_query": "destination skyline",
        "reason": "Matches the whole-trip visual direction.",
        "width": 1600,
        "height": 1000
      }
    ]
  },
  "dayHeroes": {
    "day-1": {
      "confirmed": true,
      "selected_asset_id": "day-1-hero-01",
      "candidates": []
    }
  }
}
```

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
  "subtitle": "Shinsaibashi walk",
  "note": "Use the user's note when provided. Keep inferred details short.",
  "links": [
    {
      "type": "maps",
      "label": "Google Maps",
      "url": "https://maps.google.com/?q=Shinsaibashi+Osaka"
    }
  ]
}
```

## Link Contract

Links are not optional decoration. The deployed page should work as the single phone entry point for the trip, so every important reference must become a visible tappable button.

Allowed `links[].type` values:

- `maps`: Google Maps or other map/search links.
- `web`: official websites, ticket pages, booking pages, generic references.
- `tabelog`: restaurant review or reservation pages.
- `video`: YouTube, Bilibili, TikTok, Reels, or other video references.
- `ig`: Instagram references.
- `xhs`: Xiaohongshu references.

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
- The confirmed UI Brief option has all required UI categories and a supported `layout_profile`.
- The UI options are visibly distinct and do not reuse reserved default palettes.
- `selected_asset_id` exists for the site hero and every day hero.
- The user has seen 3 UI previews and confirmed one UI option, requested a recorded mix, or explicitly delegated the recommended default.
- The user has confirmed a real image for the whole-site hero and each day hero.
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
- Media: <siteHero selected_asset_id>, <day hero selected_asset_id list>
- Output folder: <output_desktop_folder>
- Deployment: <local only or Vercel production>
- Included: day navigation, timeline checklist, route overview, map/search links, mobile layout
- Assumptions: <short list>
- Unresolved optional items: <short list>

Please confirm before I generate and deploy.
```
