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

- Provide 2-4 `theme_options` before generation.
- `recommended_theme_id` is the agent's recommendation.
- `confirmed_theme_id` is required and must match one option id.
- The final generated site may only use the confirmed theme tokens.

## Theme Brief

Trip Brief stays factual. Visual style lives in a separate Theme Brief, and the user must choose one option before generation:

```json
{
  "recommended_theme_id": "urban-bay-neon",
  "confirmed_theme_id": "urban-bay-neon",
  "theme_options": [
    {
      "id": "urban-bay-neon",
      "name": "城市海湾夜行",
      "reason": "Destination, route density, season, and activity mix support this direction.",
      "palette": {
        "background": "#F6F4EE",
        "surface": "#FFFFFF",
        "ink": "#171A1F",
        "muted": "#67717D",
        "accent": "#0E7C86",
        "accent2": "#D34F2F",
        "line": "rgba(23,26,31,.14)"
      },
      "typography": {
        "sans": "system-ui",
        "serif": "serif",
        "display": "system-ui"
      },
      "motifs": ["bay", "metro", "night-lights"]
    }
  ]
}
```

Rules:

- `siteHero.confirmed` must be `true`.
- Every day must have a confirmed `dayHeroes.day-N`.
- Every selected candidate must include `remote_url`, `local_path`, `source`, `matched_query`, and at least one of `credit` or `usage_note`.
- `local_path` must be under `assets/media/`.
- Generation fails if a confirmed image cannot be downloaded.
- Do not use placeholder images, sample images, generated blank cards, or old Kansai visual assets as final media.

## Media Brief

Media choices live in a separate Media Brief. Every required media slot must be confirmed and must point to a real selected asset. Do not use placeholders.

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
  "cityJp": "Osaka",
  "title": "Arrive in Osaka",
  "themeJp": "旅の始まり",
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
  "jp": "心斎橋散策",
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
- `confirmed_theme_id` exists and matches a Theme Brief option.
- `selected_asset_id` exists for the site hero and every day hero.
- The user has confirmed one visual theme from Theme Brief options.
- The user has confirmed a real image for the whole-site hero and each day hero.
- Desktop output behavior is confirmed.
- Vercel production deployment is confirmed.
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
- Theme: <confirmed_theme_id>
- Media: <siteHero selected_asset_id>, <day hero selected_asset_id list>
- Output folder: <output_desktop_folder>
- Deployment: Vercel production
- Included: day navigation, timeline checklist, route overview, map/search links, mobile layout
- Assumptions: <short list>
- Unresolved optional items: <short list>

Please confirm before I generate and deploy.
```
