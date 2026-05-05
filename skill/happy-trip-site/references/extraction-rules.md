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
- Keep user-provided notes short and visible in the item note.
- Move every URL out of prose into the relevant item's `links` array so it becomes a visible mobile button.

## Inference Rules

- If a place has no link, create a Google Maps search link from the place name.
- If a day has multiple places, infer `routeOverview.stops` from hotel, transport nodes, attractions, and final destination.
- If a day has only one place, still create one `routeOverview.stops` entry so the page has a daily map/search entry.
- If the user provides a hotel or airport with no city, ask a follow-up question when the name is ambiguous.
- If a day says `USJ 一整天`, create one all-day item and one route stop for Universal Studios Japan.
- If the user provides no style preference, derive exactly 3 UI Brief options from destination, season, activity mix, transport mode, and trip tone. Each option must include a concrete `layout_profile` plus `palette`, `typography`, `density`, `navigation`, `hero_treatment`, `card_treatment`, `link_treatment`, `map_treatment`, `motion_level`, and `motifs`.
- UI options must be materially different. Do not reuse template fallback colors, old demo palettes, or the same layout/category combination under different IDs.
- Generate local UI preview HTML files for those 3 options before final site generation. Each preview must use the real trip title, real hero/day media candidates, at least one or two real itinerary cards, visible link buttons, and route/map summary.
- Ask the user to choose A/B/C, request a mix, or explicitly delegate the recommended default. If the user delegates the default, still write the full UI Brief into the generation input and output.
- Generate image search queries from city, landmark, route theme, and activity type.
- Show 真实图片 candidates with source, credit or usage note, matched query, and reason before generation.
- 不使用占位符、示例图、旧关西视觉或仅文本 hero 作为最终兜底。

## Follow-Up Rules

When the user says "你自己补充", "自己决定", "先生成看看", "测试 skill 能力", or similar delegation language, treat it as permission to fill factual assumptions only. It does not skip visual gates unless the user explicitly says "用推荐默认", "你选 UI", or equivalent. Even then, you must record the full UI Brief and include it in the final confirmation summary. It does not skip media confirmation unless media selection is explicitly delegated too.

Ask follow-up questions when:

- Dates conflict.
- A day has no main item.
- A place name is too ambiguous for a public site.
- The user has not seen the UI previews and has not confirmed a UI Brief option, requested a recorded mix, or explicitly delegated the recommended default.
- The user has not confirmed every required Media Brief slot.
- A confirmed image candidate is unavailable or mismatched.
- The user has not confirmed production deployment.
- The output folder slug would overwrite an existing folder.

Ask one to three questions per turn. Prefer concrete choices when possible.

## Confirmation Behavior

Do not hide assumptions. If the route was inferred, say so. If Google Maps links are generated from search queries, say so.

Do not summarize UI as only a theme ID. List the chosen UI categories in the confirmation summary so the user can see what will drive layout, navigation, cards, links, map treatment, motion, typography, and palette.
