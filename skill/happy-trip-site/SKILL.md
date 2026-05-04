---
name: happy-trip-site
description: Generate mobile-first travel itinerary websites from natural-language trip plans, spreadsheet-pasted itineraries, chat notes, or rough travel schedules. Use when the user wants a phone-readable trip site, itinerary webpage, Vercel-deployed travel page, or one-stop workflow from travel text to production URL. The skill must ask follow-up questions until the trip brief is complete before generating files or deploying.
---

# Happy Trip Site

Turn a natural-language itinerary into a static, mobile-first travel website and deploy it to Vercel production.

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
4. You have prepared 2-4 Theme Brief options based on destination, season, trip tone, and activity mix.
5. The user has confirmed one `confirmed_theme_id`.
6. You have prepared real image candidates for the site hero and every day hero.
7. The user has confirmed one `selected_asset_id` for each required media slot.
8. You have shown the user a confirmation summary covering trip facts, theme choice, media choices, output folder, assumptions, and deployment target.
9. The user explicitly confirms generation. For production deployment, the user must explicitly confirm production deployment.

Delegation does not waive confirmation: user wording such as "you decide", "自己决定", "你可以自己补充", "先生成看看", or "测试 skill 能力" lets you fill factual assumptions, but it does not waive theme or media confirmation. You must still show Theme Brief options, real media choices, and the confirmation summary before creating files, unless the user explicitly says they delegate visual theme and media selection and want immediate generation.

If information is incomplete, ask one to three targeted questions. Explain why the missing information matters. Never use placeholder images, sample images, or the old Kansai visual style as a fallback.

## Workflow

1. Read `references/itinerary-schema.md`.
2. Read `references/extraction-rules.md`.
3. Extract the user's itinerary into a Trip Brief.
4. Ask follow-up questions until blocking fields are complete.
5. Recommend 2-4 Theme Brief options and mark one as recommended.
6. Search for real image candidates for the whole-site hero and every day hero.
7. Show the confirmation summary.
8. After confirmation, write the Trip Brief, Theme Brief, and Media Brief JSON to temporary files.
9. Run `scripts/create_site.py` with `--trip-data`, `--theme-brief`, and `--media-brief`.
10. Run `scripts/validate_site.py` on the generated folder.
11. Read `references/vercel-deploy.md`.
12. Run `scripts/deploy_vercel.py` to deploy with Vercel production.
13. Return the local folder, production URL, validation status, and any assumptions.

## Generated Project Rules

- Create each site in a new Desktop folder named `<trip-slug>-travel-site`.
- Refuse to overwrite an existing folder unless the user explicitly asks for overwrite.
- Keep the generated site self-contained.
- Use Google Maps search links for places without explicit links.
- Keep all important guide references reachable from the single deployed site URL through visible mobile link buttons.
- Preserve vague times such as "上午", "afternoon", or "一整天" instead of inventing clock times.
- Mark inferred route stops in the assumptions list.

## Script Usage

Generate:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data /path/to/trip-brief.json \
  --theme-brief /path/to/theme-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-root "$HOME/Desktop"
```

Validate:

```bash
python3 skill/happy-trip-site/scripts/validate_site.py "$HOME/Desktop/<trip-slug>-travel-site"
```

Deploy:

```bash
python3 skill/happy-trip-site/scripts/deploy_vercel.py "$HOME/Desktop/<trip-slug>-travel-site"
```

## Completion Standard

Only say the work is complete when local validation passes and production smoke testing passes. If Vercel fails, report the failed stage and keep the local generated folder.
