---
name: happy-trip-site
description: Generate mobile-first travel itinerary websites from natural-language trip plans, spreadsheet-pasted itineraries, chat notes, or rough travel schedules. Use when the user wants a phone-readable trip site, shareable URL, backup package, itinerary webpage, or one-stop workflow from travel text to published travel guide. The skill must ask follow-up questions until the trip brief is complete before generating files or deploying.
license: MIT
---

# Happy Trip Site

Turn a natural-language itinerary into a static, mobile-first travel website with a shareable URL first and a static backup package preserved. Generate locally first, validate, confirm the page style, run the mobile usability gate, then publish. No build tools are required. Vercel Drop (drag-and-drop at vercel.com/drop, no CLI or Node.js required) is the default publish path — each generated trip site is a fresh project, so a new URL per trip is the expected and correct outcome.

> **`SKILL_DIR` in commands below** = the folder this `SKILL.md` lives in. Installed, that is `~/.claude/skills/happy-trip-site` (or `~/.codex/skills/happy-trip-site`); working from the source repo it is `skill/happy-trip-site`. The verifier and template paths are relative to it, not to the user's project CWD — substitute the real path when you run a command. The static template ships **no** `travel-data.js`; you write that file yourself (step 9), you do not copy it.

`verify-mobile-runtime.mjs` requires Playwright because it opens a real browser and reads laid-out dimensions. If Playwright is unavailable, install/use an environment that provides it before claiming `mobile_usability_passed`; do not replace this gate with grep, static source inspection, or screenshots.

## Mobile Link Contract

The generated site is meant to be used on a phone while traveling. Treat one-tap external navigation as core functionality:

- Every itinerary item must expose at least one visible link pill; preserve user-provided links and add Google Maps search links when missing.
- Every day must include a route overview with an "open in Google Maps" directions link and tappable stop pins.
- Link labels should be short enough for mobile buttons, such as `Google Maps`, `官网`, `食べログ`, `小红书`, or `预约`.
- Do not hide key references in notes only. If the user provides a URL, place it in the `links` array so it becomes a tappable button.

## Hard Gate

Do not create files, generate the site, link a Vercel project, or deploy until all of these are true:

1. You have extracted a Trip Brief.
2. You have run the Readiness Checklist in `references/itinerary-schema.md`.
3. Blocking trip gaps have been resolved through conversation.
4. You have asked: "这个旅行链接主要发给谁？朋友 / 家庭群 / 自己旅行当天用 / 客户交付 / 社交分享". If the user does not choose, record `普通朋友/同行人分享`.
5. You have prepared a UI Brief with 3 beginner-facing style options based on the sharing context, destination, season, trip tone, and activity mix.
6. Each preview option includes a short beginner name, fit statement, real trip title, route summary, selected or candidate hero image, 3 to 5 plain-language traits, and a recommendation reason tied to the trip. The preview MUST render through the real static runtime, using one representative full day so the deployed site's core travel-day interactions are visible: per-item check-off controls (`.it-check`) with at least one item shown in the completed `done` state, the per-day progress indicator (`X/Y complete` with its bar), visible link buttons, and a numbered route stop list (`route-pin-index` + full stop name). These are the most-used on-trip controls, so the user must see them when choosing a style.
7. You have generated local UI preview files, such as `.tmp/<trip-slug>/ui-previews/option-a.html`, `option-b.html`, and `option-c.html`, showing real trip content rather than abstract swatches, and every preview has passed both the static data verifier and the browser-backed mobile runtime verifier.
8. The user has chosen one `confirmed_option_id`, requested a mix that you have recorded as a full UI option, or explicitly delegated the recommended default.
9. The confirmed UI option and the other preview options are materially distinct: do not reuse template fallback colors, old demo palettes, or identical layout/category combinations under different IDs.
10. You have selected stable network image URLs for the site hero and every day hero.
11. You have shown the user a confirmation summary covering trip facts, the chosen UI Brief categories, automatic network images, output folder, assumptions, and deployment target.
12. The user explicitly confirms generation. For production deployment, the user must explicitly confirm production deployment.

Delegation does not hide UI decisions: user wording such as "你选", "用推荐默认", "自己决定", "先生成看看", or "测试 skill 能力" can delegate the recommended UI option, but the final input and generated output must still contain the complete UI Brief. Image selection is automatic by default; do not ask the user to approve individual image slots unless they explicitly request media control.

The UI Brief completion state must explicitly record `sharing_context_confirmed`, `style_selected`, and `style_revision_recorded`.

If information is incomplete, ask one to three targeted questions. Explain why the missing information matters. Never use placeholder images, sample images, or the old Kansai visual style as a fallback.

## Workflow

1. Read `references/itinerary-schema.md`.
2. Read `references/extraction-rules.md`.
3. Read `references/design-principles.md` (and consult `references/design-reference.css` for the CSS vocabulary).
4. Extract the user's itinerary into a Trip Brief, then ask follow-up questions until blocking fields are complete. If the destination's region or season cannot be derived from `city`/`date`, ask before designing.
5. Derive exactly 3 UI options using design-principles reasoning: apply the Four Axes, choose one anchor color with a one-sentence cultural rationale, and produce the Sensory / Editorial / Navigation-first variants. Stamp each option with its canonical `archetype` field — `sensory`, `editorial`, or `navigator` (the Navigation-first variant) — so the deployed runtime resolves it to the matching layout composer (`travel-layouts.js`); without it the structural shape you reasoned about silently renders as `classic`. Each option MUST include an `aesthetic` block (texture feTurbulence data-URI, motif data-URI, glyph mark, display/body font names + Google-Fonts link) derived from the Four Axes; omit any layer for which nothing clean applies. Mark one option as recommended.
6. Generate local preview HTML files (e.g. `.tmp/<slug>/ui-previews/option-a.html`) with the Write tool. Each preview MUST render the cultural aesthetic layer (texture + motif + glyph + display font), not just the palette, using real trip content. It MUST reproduce the deployed site's core itinerary interactions so they can be judged at style-selection time: per-item check-off boxes (`.it-check`) with one item shown in the `done` (struck-through) state, the per-day `X/Y complete` progress bar, visible link buttons, and a numbered route stop list. A preview that only shows palette + cards but omits the check-off / progress / numbered stops does not pass this gate. **Render every preview through the real engine:** in the preview HTML, `<link>` the template's CSS including `assets/css/travel.css` and the layout CSS files, define a one-day `window.HAPPY_TRIP_DATA` slice (the option's `aesthetic` block + one representative full day with the rich `note`/`subtitle`/`sections`/`image`/`mapStopLabels`/`tag` density from `itinerary-schema.md`), and load the template's JS so the preview is a true thumbnail of production. The deployed runtime derives the `done` state purely from `localStorage`, so a fresh preview shows zero done cards and `0/N`. To satisfy the "one item shown in `done`" gate, seed `localStorage` in the preview before the engine script runs — set key `happyTrip.<tripSlug>.done` to a JSON object marking the first item done, e.g. `{"d1-morning-0":true}` (item id format is `d<dayN>-<period>-<idx>`); and note that the progress denominator is the full day's item count. Render the fullest, most complete day in the preview (not the thinnest), so the "no highlight reel" density is judged on real content. **Then verify every preview before showing it:** first run `node SKILL_DIR/scripts/verify-preview.mjs <preview>.html` (zero-dependency; uses node built-ins only) on each file and FIX every `✗ FAIL` before continuing. It catches data/runtime contract failures a visual glance and a grep both miss — `%2523` double-encoded textures that render nothing, `mapStopLabels` that don't byte-match a route stop (badge silently drops), a missing aesthetic block (neutral-theme fallback), and thin days. Then run `node SKILL_DIR/scripts/verify-mobile-runtime.mjs <preview>.html` and FIX every `✗ FAIL` before continuing. This second verifier opens the preview in a real browser at a 390px mobile viewport and checks computed/laid-out core tap targets (`.menu-btn`, `.it-check`, `.quick-link`, `.map-route-link`, `.route-pin-link`, and enabled `.nav-btn`) are visible and at least 44x44px. Static source checks are not enough for this gate because layout CSS can override the base template after `travel.css` loads. Show the user the local paths only after both verifiers pass.
7. Automatically select stable network images for the whole-site hero and every day hero. **Each hero MUST depict a specific, recognizable local landmark, not generic scenery.** The whole-trip hero = the trip's single most iconic named landmark (e.g. 极乐寺 / Petronas Twin Towers / 城山日出峰); each day hero = that day's marquee named stop. **Forbidden as a hero or day-hero: anonymous city skylines, generic beaches, generic streets, sunsets, food-only close-ups, or any "mood shot" that could belong to any city.** If you cannot find a verified photo of a named landmark for a hero slot, ask the user rather than substituting a generic skyline. Build the hero image query from the landmark's proper name, never from "`<city> skyline`". **Never use an image URL whose content you have not verified matches the place** — a `curl 200` only proves the URL is alive, not that the photo shows the right landmark. Try these content-verifiable sources in order, per image (see the full recipe in `references/itinerary-schema.md`):
   1. **Wikipedia REST API** — `WebFetch https://en.wikipedia.org/api/rest_v1/page/summary/<Article_Title>` and use `originalimage.source` (else `thumbnail.source`). The article title is the subject, so the lead image is usually on-topic. Strongest option for natural landmarks, temples, old towns. **WARNING — REST lead images for companies, brands, and modern towers are frequently a corporate logo, coat-of-arms, SVG diagram, or map, not a photograph** (e.g. `Petronas_Towers`, `Kuala_Lumpur_Tower` return logos). Before using a REST image, confirm the URL is a `.jpg`/`.png` photograph of the place and not a logo/SVG/diagram; if it looks like a logo or the source filename contains `logo`/`seal`/`.svg`, discard it and fall back to Commons file search (step 2).
   2. **Wikimedia Commons file search** — `WebFetch https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=5&srsearch=<place>`; pick a result whose filename contains the landmark keywords, then use `https://commons.wikimedia.org/wiki/Special:FilePath/<Exact_File_Name>?width=1600`.
   3. **Official tourism / venue page** image (authoritative source).
   4. **Unsplash / Pexels are NOT allowed for hero or day-hero slots** — those must be a named landmark from sources 1–3. Use Unsplash/Pexels only as a last resort for an *item-level* secondary photo where no landmark applies (e.g. a generic "local breakfast" card), and even then you MUST `WebFetch` the source page first and confirm its title/description matches the subject before using it; otherwise discard it.
   Record a `reason` on every image documenting the verification (e.g. "Wikipedia article Kek Lok Si lead image" / "Commons filename contains Kek_Lok_Si_Temple"). Then `curl`-verify each final URL returns `200`. Never guess hashed Wikimedia `/thumb/<hash>/` paths.
8. Show the confirmation summary covering trip facts, the chosen UI option's full category set including its `aesthetic` block, automatic images, output folder, assumptions, and deployment target. Get explicit user confirmation (and explicit production confirmation before a production deploy).
9. After confirmation, copy `assets/static-template/` into `$HOME/Desktop/<trip-slug>-travel-site/` with Write, then write `assets/js/travel-data.js` assigning `window.HAPPY_TRIP_DATA` from the Trip Brief, the UI Brief (including the chosen option's `aesthetic` block), and the Media Brief. Use the brief→runtime field mapping in `references/itinerary-schema.md` ("Generated Runtime Data") — the runtime reads `meta.tripTitle`, `ui.confirmed_option`, `meta.hero`, and `days[N-1].hero`, not the raw brief field names, so a wrong mapping silently renders the neutral fallback theme.
10. Validate with Bash: confirm `index.html`, `assets/js/travel-data.js`, `assets/js/travel.js`, `assets/js/travel-helpers.js`, and `vercel.json` exist; grep `window.HAPPY_TRIP_DATA` in `travel-data.js`; grep the viewport meta in `index.html`; grep a link button and a Google Maps entry. Also run `node SKILL_DIR/scripts/verify-preview.mjs <output-folder>/assets/js/travel-data.js` — the verifier accepts any file containing the `window.HAPPY_TRIP_DATA` assignment, so point it at `travel-data.js` to re-check the silent-failure invariants (texture encoding, map-stop label integrity, aesthetic block, day density) on the real generated data, and fix any FAIL before publishing. Then run `node SKILL_DIR/scripts/verify-mobile-runtime.mjs --report <output-folder>/mobile-usability-result.json <output-folder>/index.html` and fix any FAIL before publishing. The generated `mobile-usability-result.json` must contain `"mobile_usability_passed": true`; a static verifier PASS alone is not enough because it does not load CSS or measure actual mobile tap targets.
11. If publishing was confirmed: `zip -r <slug>-backup.zip <output-folder>` (preserve the backup). Then tell the user: "Drag the `<output-folder>` folder into [vercel.com/drop](https://vercel.com/drop), pick a team and project name, click Deploy — you'll get a `.vercel.app` link in seconds. Paste the link back here." Return `package_ready` with the local folder path and backup zip path until the user shares the URL back. When the user sends the URL, smoke-test with `curl -sf <url> | grep -q viewport`; if it passes upgrade to `ready_to_share` and put the URL first.

For runtime maintenance, debugging, or contract changes, read `references/architecture.md` before editing template files. Ordinary trip generation does not require loading it.

## Generated Project Rules

- Create each site in a new Desktop folder named `<trip-slug>-travel-site`.
- Refuse to overwrite an existing folder unless the user explicitly asks for overwrite.
- Keep the generated site static and portable; image URLs may point to stable external network sources.
- Use Google Maps search links for places without explicit links.
- Keep all important guide references reachable from the single deployed site URL through visible mobile link buttons.
- Preserve vague times such as "上午", "afternoon", or "一整天" instead of inventing clock times.
- Mark inferred route stops in the assumptions list.
- Treat template and old demo fallback palettes as invalid UI choices. A user-selected UI must be visibly destination-specific, not a recolored copy of the starter template.

## Media Brief Format

Media Brief entries use direct image URLs:

```json
{
  "siteHero": {
    "url": "https://example.com/image.jpg",
    "source_name": "Wikimedia Commons",
    "source_url": "https://example.com/source-page",
    "alt": "Gardens by the Bay Supertree Grove, Singapore",
    "query": "Gardens by the Bay Supertree Grove"
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

## Completion Status

- `ready_to_share`: local validation passed, UI style was confirmed or delegated, mobile usability passed, publishing succeeded, URL smoke test passed, and the generated folder plus static backup package exist.
- `package_ready`: the static site and backup package exist, but a shareable URL was not published or could not be trusted.
- `blocked`: required trip facts are missing, UI style is not confirmed, generation failed, validation failed, mobile usability failed before packaging, files cannot be written, or the environment cannot preserve artifacts.

`mobile_usability_passed` in `mobile-usability-result.json` must be true before a URL can be treated as shareable.

Do not report `ready_to_share` just because a human could finish a missing step. Report the maximum honest state supported by the current agent environment.

## Completion Standard

Only say local generation is complete when local validation passes. Only say deployment is complete when production smoke testing also passes. If Vercel fails, report the failed stage and keep the local generated folder.
