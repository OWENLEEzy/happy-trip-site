---
name: happy-trip-site
description: Generate mobile-first travel itinerary websites from natural-language trip plans, spreadsheet-pasted itineraries, chat notes, or rough travel schedules. Use when the user wants a phone-readable trip site, itinerary webpage, Vercel-deployed travel page, or one-stop workflow from travel text to production URL. The skill must ask follow-up questions until the trip brief is complete before generating files or deploying.
license: MIT
---

# Happy Trip Site

Turn a natural-language itinerary into a static, mobile-first travel website. Generate locally first; deploy to Vercel production only after explicit production deployment confirmation.

## Mobile Link Contract

The generated site is meant to be used on a phone while traveling. Treat one-tap external navigation as core functionality:

- Every itinerary item must expose at least one visible link pill; preserve user-provided links and add Google Maps search links when missing.
- Every day must include a route overview with an "open in Google Maps" directions link and tappable stop pins.
- Link labels should be short enough for mobile buttons, such as `Google Maps`, `官网`, `食べログ`, `小红书`, or `预约`.
- Do not hide key references in notes only. If the user provides a URL, place it in the `links` array so it becomes a tappable button.

## Hard Gate

Do not create files, run generation scripts, link a Vercel project, or deploy until all of these are true:

1. You have extracted a Trip Brief.
2. You have run the Readiness Checklist in `references/itinerary-schema.md`.
3. Blocking trip gaps have been resolved through conversation.
4. You have prepared a UI Brief with 3 previewable UI options based on destination, season, trip tone, and activity mix.
5. You have generated local UI preview files, such as `.tmp/<trip-slug>/ui-previews/option-a.html`, `option-b.html`, and `option-c.html`, showing real trip content rather than abstract swatches.
6. The user has chosen one `confirmed_option_id`, requested a mix that you have recorded as a full UI option, or explicitly delegated the recommended default.
7. The confirmed UI option and the other preview options are materially distinct: do not reuse template fallback colors, old demo palettes, or identical layout/category combinations under different IDs.
8. You have prepared real image candidates for the site hero and every day hero.
9. The user has confirmed one `selected_asset_id` for each required media slot.
10. You have shown the user a confirmation summary covering trip facts, full UI Brief category choices, media choices, output folder, assumptions, and deployment target.
11. The user explicitly confirms generation. For production deployment, the user must explicitly confirm production deployment.

Delegation does not hide UI decisions: user wording such as "你选", "用推荐默认", "自己决定", "先生成看看", or "测试 skill 能力" can delegate the recommended UI option, but the final input and generated output must still contain the complete UI Brief. Media confirmation remains independent unless the user explicitly delegates media selection too.

If information is incomplete, ask one to three targeted questions. Explain why the missing information matters. Never use placeholder images, sample images, or the old Kansai visual style as a fallback.

## Workflow

1. Read `references/itinerary-schema.md`.
2. Read `references/extraction-rules.md`.
3. Extract the user's itinerary into a Trip Brief.
4. Ask follow-up questions until blocking fields are complete.
5. Recommend exactly 3 UI Brief options and mark one as recommended.
6. Generate UI preview files with `scripts/create_ui_previews.py` and show the user the local paths.
7. Search for real image candidates for the whole-site hero and every day hero.
8. Show the confirmation summary, including the chosen UI option's `layout_profile`, `palette`, `typography`, `density`, `navigation`, `hero_treatment`, `card_treatment`, `link_treatment`, `map_treatment`, `motion_level`, and `motifs`.
9. After confirmation, write the Trip Brief, UI Brief, and Media Brief JSON to temporary files.
10. Run `scripts/create_site.py` with `--trip-data`, `--ui-brief`, and `--media-brief`.
11. Run `scripts/validate_site.py` on the generated folder.
12. If deployment was requested, read `references/vercel-deploy.md`.
13. If deployment was confirmed, run `scripts/deploy_vercel.py` to deploy with Vercel production.
14. Return the local folder, preview paths, validation status, deployment URL when applicable, and any assumptions.

## Generated Project Rules

- Create each site in a new Desktop folder named `<trip-slug>-travel-site`.
- Refuse to overwrite an existing folder unless the user explicitly asks for overwrite.
- Keep the generated site self-contained.
- Use Google Maps search links for places without explicit links.
- Keep all important guide references reachable from the single deployed site URL through visible mobile link buttons.
- Preserve vague times such as "上午", "afternoon", or "一整天" instead of inventing clock times.
- Mark inferred route stops in the assumptions list.
- Treat template and old demo fallback palettes as invalid UI choices. A user-selected UI must be visibly destination-specific, not a recolored copy of the starter template.

## Script Usage

Generate:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data /path/to/trip-brief.json \
  --ui-brief /path/to/ui-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-root "$HOME/Desktop"
```

Create UI previews before generation:

```bash
python3 skill/happy-trip-site/scripts/create_ui_previews.py \
  --trip-data /path/to/trip-brief.json \
  --ui-brief /path/to/ui-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-dir .tmp/<trip-slug>/ui-previews
```

`--theme-brief` remains accepted by `create_site.py` only as a backward-compatible alias. New work should use `--ui-brief`.

Validate:

```bash
python3 skill/happy-trip-site/scripts/validate_site.py "$HOME/Desktop/<trip-slug>-travel-site"
```

Deploy:

```bash
python3 skill/happy-trip-site/scripts/deploy_vercel.py "$HOME/Desktop/<trip-slug>-travel-site"
```

## Completion Standard

Only say local generation is complete when local validation passes. Only say deployment is complete when production smoke testing also passes. If Vercel fails, report the failed stage and keep the local generated folder.
