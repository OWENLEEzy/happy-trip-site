# Happy Trip Site

This repository contains the `happy-trip-site` skill: a reusable agent workflow for turning rough travel notes into a mobile-first static itinerary website and deploying it to Vercel.

The generated site is meant to be opened on a phone during the trip. The important behavior is one URL for the whole guide: daily route overview, Google Maps route opening, tappable stop pins, and visible link buttons for maps, official pages, bookings, restaurants, videos, Instagram, Xiaohongshu, or other references.

## What Is Included

- Installable skill: `skill/happy-trip-site`
- Static website template generalized for confirmed UI Briefs and confirmed real images
- Trip Brief schema and extraction rules under `skill/happy-trip-site/references`
- Generator, validator, and Vercel deployment wrapper under `skill/happy-trip-site/scripts`
- Unit tests and an end-to-end dry-run fixture under `tests`

## Agent Usage

Use the same skill folder for different agents:

- Codex: copy `skill/happy-trip-site` to `~/.codex/skills/happy-trip-site`
- Claude Code: copy `skill/happy-trip-site` to `~/.claude/skills/happy-trip-site`
- Lobster/龙虾 or other agents: read `skill/happy-trip-site/SKILL.md` first, then load the referenced files only when needed

The skill entrypoint is `skill/happy-trip-site/SKILL.md`.

## OpenAgentSkill Installation

Install from OpenAgentSkill-compatible tooling after this repository is public and indexed:

```bash
npx skills add OWENLEEzy/happy-trip-site
```

Install directly in Codex from the GitHub skill directory:

```text
$skill-installer install https://github.com/OWENLEEzy/happy-trip-site/tree/main/skill/happy-trip-site
```

Manual install paths:

```bash
cp -R skill/happy-trip-site ~/.codex/skills/happy-trip-site
cp -R skill/happy-trip-site ~/.claude/skills/happy-trip-site
```

Minimal prompt:

```text
Create a mobile travel site from this itinerary. Ask follow-up questions until the trip brief is complete, generate three destination-specific UI previews, find real image candidates, then generate and validate the static site after I confirm the UI and media.
```

Validate a generated site before claiming completion:

```bash
python3 skill/happy-trip-site/scripts/validate_site.py "$HOME/Desktop/<trip-slug>-travel-site"
```

## Workflow Contract

The agent should:

1. Extract a Trip Brief from natural-language itinerary text, pasted spreadsheet rows, chat notes, or Markdown.
2. Ask follow-up questions until required trip details are complete.
3. Recommend exactly 3 UI Brief options from the destination, trip tone, season, and activity mix.
4. Generate local UI preview files with real trip content so the user can choose A/B/C, request a mix, or explicitly delegate the recommended default.
5. Search for real image candidates and ask the user to confirm each required Media Brief selection.
6. Show a confirmation summary covering Trip Brief, full UI Brief category choices, Media Brief, output folder, and deployment target before generating files or deploying.
7. Generate a new Desktop folder named `<trip-slug>-travel-site`.
8. Validate the generated static site.
9. Deploy to Vercel production only after confirmation.
10. Return the local folder, preview paths, production URL when applicable, validation status, and assumptions.

Do not generate or deploy before the readiness gate in `skill/happy-trip-site/references/itinerary-schema.md` passes.

## Mobile Link Rules

Every generated trip site must preserve the phone-first link behavior:

- Every itinerary item needs at least one visible external link button.
- User-provided URLs must be preserved and moved into `links`, not buried in prose.
- Items without a URL get a Google Maps search link.
- Every day needs `routeOverview.stops` so the template can render a daily Google Maps route button and tappable stop pins.
- Link labels should stay short enough for mobile buttons, such as `Google Maps`, `官网`, `预约`, `食べログ`, or `小红书`.

`validate_site.py` enforces the link contract after generation.

## Commands

Generate a site from a Trip Brief:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data /path/to/trip-brief.json \
  --ui-brief /path/to/ui-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-root "$HOME/Desktop"
```

Create UI previews before generating the final site:

```bash
python3 skill/happy-trip-site/scripts/create_ui_previews.py \
  --trip-data /path/to/trip-brief.json \
  --ui-brief /path/to/ui-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-dir .tmp/<trip-slug>/ui-previews
```

The generated folder includes `ui-brief.json`, a backward-compatible `theme-brief.json`, `media-brief.json`, `media-manifest.json`, and downloaded image files under `assets/media/`.

UI options are validated as real design choices, not labels. The generator rejects template fallback colors, old demo palettes, duplicate layout profiles, duplicate palettes, and duplicate treatment combinations.

Validate a generated site:

```bash
python3 skill/happy-trip-site/scripts/validate_site.py \
  "$HOME/Desktop/<trip-slug>-travel-site"
```

Deploy with Vercel:

```bash
python3 skill/happy-trip-site/scripts/deploy_vercel.py \
  "$HOME/Desktop/<trip-slug>-travel-site"
```

Dry-run deployment commands:

```bash
python3 skill/happy-trip-site/scripts/deploy_vercel.py \
  "$HOME/Desktop/<trip-slug>-travel-site" \
  --dry-run
```

## Verification

Run the local tests:

```bash
python3 -m unittest discover -s tests -v
```

Validate the skill package:

```bash
python3 /Users/owenlee/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /Users/owenlee/Desktop/happy-trip-site/skill/happy-trip-site
```

Run an end-to-end local dry run:

```bash
rm -rf /tmp/happy-trip-site-ui-media-e2e
mkdir -p /tmp/happy-trip-site-ui-media-e2e/media-source
python3 - <<'PY'
import base64, json
from pathlib import Path
root = Path("/tmp/happy-trip-site-ui-media-e2e")
png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=")
for name in ["site-hero.png", "day-1-hero.png"]:
    (root / "media-source" / name).write_bytes(png)
ui = {
    "recommended_option_id": "urban-bay-neon",
    "confirmed_option_id": "urban-bay-neon",
    "ui_options": [{
        "id": "urban-bay-neon",
        "name": "城市海湾夜行",
        "reason": "Dense city route with food, transit, and night walking.",
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
        "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
        "density": "spacious",
        "navigation": "topbar-drawer",
        "hero_treatment": "full-bleed-photo",
        "card_treatment": "timeline-cards",
        "link_treatment": "pill-cluster",
        "map_treatment": "embed-with-stop-chips",
        "motion_level": "subtle",
        "motifs": ["bay", "metro", "night-lights"]
    }, {
        "id": "street-blocks",
        "name": "街区色块",
        "reason": "Neighborhood color-block direction.",
        "layout_profile": "peranakan-tropical-blocks",
        "palette": {
            "background": "#FFF8F0",
            "surface": "#FFFFFF",
            "ink": "#1E1B18",
            "muted": "#766A5D",
            "accent": "#008B8B",
            "accent2": "#F06C4F",
            "line": "rgba(30,27,24,.16)"
        },
        "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
        "density": "standard",
        "navigation": "topbar-drawer",
        "hero_treatment": "split-photo-panel",
        "card_treatment": "block-cards",
        "link_treatment": "pill-cluster",
        "map_treatment": "stop-chips-first",
        "motion_level": "expressive",
        "motifs": ["blocks", "street-color", "local-food"]
    }, {
        "id": "metro-food-clean",
        "name": "地铁美食清单",
        "reason": "Route-first utility direction.",
        "layout_profile": "metro-food-clean",
        "palette": {
            "background": "#F4F6F2",
            "surface": "#FFFFFF",
            "ink": "#182024",
            "muted": "#667176",
            "accent": "#0B7A3B",
            "accent2": "#D9472E",
            "line": "rgba(24,32,36,.14)"
        },
        "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
        "density": "compact",
        "navigation": "bottom-day-tabs",
        "hero_treatment": "command-board",
        "card_treatment": "checklist-rows",
        "link_treatment": "route-first-toolbar",
        "map_treatment": "route-panel-first",
        "motion_level": "none",
        "motifs": ["metro", "food", "checklist"]
    }]
}
media = {
    "siteHero": {
        "confirmed": True,
        "selected_asset_id": "site-hero-01",
        "candidates": [{
            "asset_id": "site-hero-01",
            "remote_url": (root / "media-source" / "site-hero.png").resolve().as_uri(),
            "local_path": "assets/media/site-hero-01.png",
            "source": "Local e2e fixture",
            "credit": "Fixture image",
            "usage_note": "Used for local smoke validation.",
            "matched_query": "Osaka skyline",
            "reason": "Matches whole-trip hero."
        }]
    },
    "dayHeroes": {
        "day-1": {
            "confirmed": True,
            "selected_asset_id": "day-1-hero-01",
            "candidates": [{
                "asset_id": "day-1-hero-01",
                "remote_url": (root / "media-source" / "day-1-hero.png").resolve().as_uri(),
                "local_path": "assets/media/day-1-hero-01.png",
                "source": "Local e2e fixture",
                "credit": "Fixture image",
                "usage_note": "Used for local smoke validation.",
                "matched_query": "Dotonbori night",
                "reason": "Matches day 1 city walking."
            }]
        }
    }
}
(root / "ui-brief.json").write_text(json.dumps(ui, ensure_ascii=False, indent=2) + "\n")
(root / "media-brief.json").write_text(json.dumps(media, ensure_ascii=False, indent=2) + "\n")
PY
python3 skill/happy-trip-site/scripts/create_ui_previews.py \
  --trip-data tests/fixtures/osaka-nara-trip-brief.json \
  --ui-brief /tmp/happy-trip-site-ui-media-e2e/ui-brief.json \
  --media-brief /tmp/happy-trip-site-ui-media-e2e/media-brief.json \
  --output-dir /tmp/happy-trip-site-ui-media-e2e/ui-previews
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data tests/fixtures/osaka-nara-trip-brief.json \
  --ui-brief /tmp/happy-trip-site-ui-media-e2e/ui-brief.json \
  --media-brief /tmp/happy-trip-site-ui-media-e2e/media-brief.json \
  --output-root /tmp/happy-trip-site-ui-media-e2e
python3 skill/happy-trip-site/scripts/validate_site.py \
  /tmp/happy-trip-site-ui-media-e2e/osaka-nara-three-day-travel-site
python3 skill/happy-trip-site/scripts/deploy_vercel.py \
  /tmp/happy-trip-site-ui-media-e2e/osaka-nara-three-day-travel-site \
  --dry-run
```

## Reference Docs

- Design spec: `docs/superpowers/specs/2026-05-04-happy-trip-site-design.md`
- Skill contract: `skill/happy-trip-site/SKILL.md`
- Trip schema: `skill/happy-trip-site/references/itinerary-schema.md`
- Extraction rules: `skill/happy-trip-site/references/extraction-rules.md`
- Vercel deployment notes: `skill/happy-trip-site/references/vercel-deploy.md`
