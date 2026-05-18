# Simplified Network Image Flow Design

Date: 2026-05-18
Status: proposed

## Summary

`happy-trip-site` should stay focused on整理攻略 into a phone-readable travel webpage. The skill should not make users manage images, approve every media slot, or reason about asset pipelines.

Keep the UI Brief choice because it affects readability and page quality. Simplify media: the agent should find stable network images automatically, write image URLs into the generated data, and avoid per-image user confirmation.

## Decision

Use this default flow:

1. User provides travel notes, tables, links, or rough itinerary text.
2. Agent extracts a factual Trip Brief.
3. Agent asks only for blocking trip facts.
4. Agent prepares exactly three UI Brief options.
5. User chooses A/B/C or delegates the recommended option.
6. Agent automatically selects network images for the whole-site hero and each day hero.
7. Agent shows a short final confirmation summary.
8. Agent generates and validates the static site.
9. Agent deploys only after explicit production confirmation.

The media step should be automatic. It should not ask the user to choose individual images unless the user explicitly wants control.

## Product Goal

Minimize user effort while preserving the value of the generated guide:

- The user should paste an攻略 and make at most one style choice.
- The generated page should still feel tailored, readable, and useful on a phone.
- Important links should remain visible and tappable.
- Images should make the guide easier to scan, not become a separate production workflow.

## UI Brief

Keep the three-option UI Brief.

Rules:

- Always create exactly three materially different UI options.
- The user can choose A/B/C.
- The user can say "use recommended", "你选", or equivalent to use the recommended option.
- The confirmation summary should show only the chosen UI option's essential categories: palette, density, navigation, hero treatment, card treatment, link treatment, map treatment, and motion level.
- UI previews can remain useful, but they should not create a long approval loop.

## Image Source Strategy

Default to external network image URLs.

Preferred source order:

1. Official tourism or venue pages.
2. Wikimedia Commons.
3. Unsplash.
4. Pexels.
5. Other stable public image hosts only when the first four cannot cover the route.

The agent should choose images automatically from stable sources. It should use destination-level or city-level images when exact place images are unavailable.

Do not use Codex image generation by default. Image generation can remain an optional fallback only when the user asks for generated visuals or no suitable network image can be found.

## Image Data Contract

Each selected image should be represented as simple metadata:

```json
{
  "url": "https://example.com/image.jpg",
  "source_name": "Wikimedia Commons",
  "source_url": "https://example.com/source-page",
  "alt": "Marina Bay skyline in Singapore",
  "query": "Singapore Marina Bay skyline"
}
```

Generated runtime data should reference image URLs directly. It should not require `selected_asset_id`, local image paths, downloaded files, or user-confirmed media slots.

The generated site can still write `media-manifest.json`, but that file becomes an audit record. It should not be a user confirmation gate.

## Workflow Changes

Remove the current Media Brief hard gate:

- Do not require the user to confirm one `selected_asset_id` for each hero slot.
- Do not stop generation because media confirmation is missing.
- Do not require images to be copied into `assets/media/`.
- Do not require `validate_site.py` to check local media files.

Replace it with automatic image selection:

- Build one query for the whole-trip hero from trip title, destination, and route theme.
- Build one query per day from city, main place names, and day theme.
- Select a stable image URL for each required slot.
- Store source metadata in generated data and `media-manifest.json`.
- Mention in the final summary that images will use automatically selected stable network sources.

## Runtime Changes

The Travel Runtime should render image URLs directly:

- If an image URL starts with `http://` or `https://`, use it as-is.
- If an image has a local path, continue to support it for backward compatibility.
- Render `alt` text from image metadata.
- Show source text only when useful and unobtrusive.

The runtime should not care whether an image came from Wikimedia, Unsplash, Pexels, an official site, or a local file.

## Validation Changes

Validation should become a lightweight contract check:

- Image URL exists.
- Image URL starts with `http://` or `https://`, or a local path exists for compatibility.
- `alt` exists.
- At least one of `source_name` or `source_url` exists.
- `media-manifest.json` entries match generated data where practical.

Validation should not download images or block on remote availability. Remote image stability is accepted as a product tradeoff.

## Final Confirmation Summary

Before generation, show a short summary:

```text
I will generate:
- Trip: <trip_title>
- Days: <count>
- UI: <chosen option>
- Images: automatically selected stable network images
- Output folder: <path>
- Deployment: <local only or Vercel production>
- Assumptions: <short list>

Please confirm before I generate.
```

Do not list every image unless the user asks.

## Non-Goals

- Do not build an image asset management system.
- Do not require per-image user approval.
- Do not default to generated images.
- Do not download images into the generated site by default.
- Do not add complex browser image smoke tests.
- Do not remove UI Brief selection.

## Acceptance Criteria

- A user can paste an itinerary and proceed after choosing a UI option or delegating the recommended option.
- The skill can generate a site with network image URLs and no local image downloads.
- The generated page renders hero images from external URLs.
- `validate_site.py` passes without checking local image files for external image slots.
- `media-manifest.json` records image source metadata for auditability.
- The docs no longer describe media confirmation as a hard gate.
- Existing link, route, UI Brief, and deployment confirmation rules remain intact.
