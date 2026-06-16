# Extraction Rules

Use these rules to convert natural-language itinerary text into a Trip Brief.

## Accepted Input

Accept copied spreadsheet rows, chat notes, Markdown, plain text, or mixed-language travel plans.

## Preservation Rules

- Preserve exact user times such as `14:30`.
- Preserve vague labels such as `上午`, `下午`, `晚上`, `morning`, `afternoon`, and `一整天`.
- Preserve user-provided place names as display labels.
- Use neutral secondary label fields: `areaLabel` for day area, `themeLabel` for day theme, and `subtitle` for item secondary text.
- Do not emit destination-specific legacy fields such as `cityJp`, `themeJp`, or `jp`.
- Preserve user-provided links exactly.
- Preserve user-provided notes verbatim and visible in the item note; never truncate what the user wrote.
- Move every URL out of prose into the relevant item's `links` array so it becomes a visible mobile button.

## Inference Rules

- If the trip has no calendar dates, do not invent them. Leave each day's `date` as a label like `Day 1` / `第 1 天` (or a weekday if the user gave one) and set `meta.dateRange` to a descriptive span like `4 天 3 夜`. The runtime's "today" highlight only fires when a day `date` contains a real `YYYY-MM-DD`, so it simply stays off — that is the correct behavior for a date-less plan, not a bug to work around.
- If a place has no link, create a Google Maps search link from the place name.
- If a day has multiple places, infer `routeOverview.stops` from hotel, transport nodes, attractions, and final destination.
- If a day has only one place, still create one `routeOverview.stops` entry so the page has a daily map/search entry.
- If the user provides a hotel or airport with no city, ask a follow-up question when the name is ambiguous.
- If a day says `USJ 一整天`, create one all-day item and one route stop for Universal Studios Japan.
- Enrich every itinerary item to benchmark density, not a bare title. For each anchor stop infer: a substantive `note` (what to do + timing/logistics + a fallback/tip), a `subtitle` (local name or descriptor) where natural, `mapStopLabels` matching the route stops, a content-verified `image`, and 1–2 `sections` (`kicker` + `title` + `points`/`note`) for must-eat / tickets / movement detail. Pick `tag` from the colored vocabulary (`landmark`/`garden`/`food`/`museum`/`culture`/`walk`/`beach`/`transit`/`rest`). Infer only place-specific, useful detail — never generic filler. A page of one-line cards is a failure mode; the benchmark carries a paragraph plus structured detail per item.
- Narrate the whole travel day, not only the highlights. Aim for the upper half of the band — ~9–10 items per day, matching the benchmark's ~9.6 mean (8 is acceptable, 6 is the bare floor, not the goal) — and keep days *consistent* — a 12-item day next to a 5-item day reads as a neglected day. Include the connective tissue: arrival/airport transfer, hotel check-in and luggage drop, inter-city train/drive legs, the return trip, and the evening wind-down — each as its own item with a `transit`/`rest` tag and a short logistics note. A day with only 3–5 sightseeing stops and no movement/lodging items reads as a thin highlight reel; fill the gaps so the page can actually run the day. The verifier warns on any day below the floor and on days materially thinner than the trip's richest day.
- Populate `generalResources` with structured `sections` (use `steps` for procedures like buying a transit pass or airport→hotel, `points` for at-a-glance lists), not just a link list — see the General Resources schema. This is the "全程通用攻略" page.
- Ask style context before previewing: "这个旅行链接主要发给谁？朋友 / 家庭群 / 自己旅行当天用 / 客户交付 / 社交分享". If the user does not choose, use `普通朋友/同行人分享`.
- If the user provides no style preference, derive exactly 3 UI Brief options from destination, season, activity mix, transport mode, and trip tone. Each option must include a concrete `layout_profile` plus `palette`, `typography`, `density`, `navigation`, `hero_treatment`, `card_treatment`, `link_treatment`, `map_treatment`, `motion_level`, and `motifs`.
- UI options must be materially different. Do not reuse template fallback colors, old demo palettes, or the same layout/category combination under different IDs.
- Generate local UI preview HTML files for those 3 options before final site generation. Each preview must render through the real static runtime, use the real trip title, real hero/day media candidates, one representative full day, visible link buttons, and route/map summary. Each preview must also reproduce the deployed site's core travel-day interactions: a per-item check-off control (`.it-check`) with at least one item in the `done` state, the per-day `X/Y complete` progress bar, and a numbered route stop list — these are the highest-frequency on-trip controls and must be visible when the user picks a style. Before showing preview paths to the user, run both `node SKILL_DIR/scripts/verify-preview.mjs <preview>.html` and `node SKILL_DIR/scripts/verify-mobile-runtime.mjs <preview>.html`. The first verifier checks trip data and silent runtime-contract failures; the second opens a real mobile browser viewport and fails if core controls are hidden or below 44x44px after CSS cascade.
- Ask the user to choose A/B/C, request a mix, or explicitly delegate the recommended default. If the user delegates the default, still write the full UI Brief into the generation input and output.
- Generate one whole-trip hero image query naming the trip's single most iconic landmark (a specific temple/tower/peak/old-town name), never a generic "`<city> skyline`" or "`<country> travel`" query.
- Generate one day hero image query per day naming that day's marquee stop (the specific landmark), not the city in general. Anonymous skylines, generic beaches/streets/sunsets, and food-only close-ups are not acceptable hero or day-hero images — a hero must be a recognizable named place. If no verified landmark photo exists for a hero slot, surface it as a follow-up question instead of substituting generic scenery.
- Automatically select stable network image URLs, but only ones whose CONTENT you have verified matches the place. Prefer content-verifiable sources in this order: Wikipedia REST API lead image (`/api/rest_v1/page/summary/<title>`), Wikimedia Commons file search → `Special:FilePath`, official tourism/venue pages, then Unsplash/Pexels for generic mood shots only. A `200` response is not proof of content. See the full recipe in `itinerary-schema.md` (Choosing images).
- Record each image with `url`, `source_name`, `source_url`, `alt`, `query`, and `reason` (how the content was verified).
- Do not ask the user to choose individual images unless they explicitly request media control.
- 不使用占位符、示例图、旧关西视觉或仅文本 hero 作为最终兜底。

Offer style choices in beginner language:

- Friends or trip group: `好看氛围型`, `城市杂志型`, `清楚实用型`
- Family or elders: `清楚大字版`, `温和好看版`, `实用清单版`
- Travel-day personal use: `地图优先型`, `紧凑清单型`, `今日任务型`
- Client handoff: `高级简洁型`, `行程手册型`, `精致顾问型`
- Social sharing: `图片氛围型`, `城市封面型`, `小红书友好型`

## Follow-Up Rules

When the user says "你自己补充", "自己决定", "先生成看看", "测试 skill 能力", or similar delegation language, treat it as permission to fill factual assumptions only. It does not skip visual gates unless the user explicitly says "用推荐默认", "你选 UI", or equivalent. Even then, you must record the full UI Brief and include it in the final confirmation summary. Media selection is automatic by default and should be summarized as stable network images.

Ask follow-up questions when:

- Dates conflict.
- A day has no main item.
- A place name is too ambiguous for a public site.
- The user has not seen the UI previews and has not confirmed a UI Brief option, requested a recorded mix, or explicitly delegated the recommended default.
- You cannot find a suitable network image for a required hero slot from the preferred sources.
- The user has not confirmed production deployment.
- The output folder slug would overwrite an existing folder.

Ask one to three questions per turn. Prefer concrete choices when possible.

## Confirmation Behavior

Do not hide assumptions. If the route was inferred, say so. If Google Maps links are generated from search queries, say so.

Do not summarize UI as only a theme ID. List the chosen UI categories in the confirmation summary so the user can see what will drive layout, navigation, cards, links, map treatment, motion, typography, and palette.

Do not list every image in the confirmation summary unless the user asks. Use: `Images: automatically selected stable network images`.
