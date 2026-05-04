# Happy Trip Site Skill Design

Date: 2026-05-04

Status: Approved direction, design-only repository

Source template inspected: `/Users/owenlee/Desktop/2025年/关西`

## 1. Objective

Create a Codex skill that accepts a natural-language travel itinerary, asks follow-up questions until the required information is sufficient, generates a mobile-first static travel website in a new Desktop folder, validates it, deploys it to Vercel production with the official Vercel CLI, and returns a usable production link.

The skill should package the reusable workflow, template, schema, validation scripts, and deployment wrapper. It should not become a general website builder or a custom hosting platform.

## 2. Confirmed User Decisions

- Input is a natural-language itinerary table or itinerary text. It may not be Markdown, YAML, or JSON.
- Output should be created in a new Desktop folder for each trip.
- The deployment path should be one-stop production deployment: local generation plus `vercel deploy --prod`.
- The skill must conduct multiple rounds of conversation when needed and must not start generation until the user has provided enough information.
- Vercel behavior should use existing Vercel CLI capabilities, not a custom deployment system.
- The current Kansai static SPA should be treated as the visual and interaction reference, then generalized.

## 3. Existing Repo Findings

The current Kansai repo is already close to the desired runtime shape:

- `关西行程.html` is a static entry page with mobile viewport metadata.
- `assets/js/kansai-data.js` contains trip data.
- `assets/js/kansai.js` renders the day view, sidebar, route overview, checklist state, map links, and music control.
- `assets/css/kansai.css` contains the mobile-first washi travel visual system.
- `vercel.json` rewrites `/` to the static HTML entry.
- `tests/verify-day3-interactive-map.mjs` shows the existing style of static structural verification.

The source template must be generalized because current names and keys are Kansai-specific.

## 4. Non-Goals

- Do not add backend storage, authentication, CMS editing, or collaborative editing.
- Do not introduce Next.js, Vite, React, or a build framework unless a later implementation need proves static HTML/CSS/JS is insufficient.
- Do not generate or publish before the user confirms the extracted trip brief.
- Do not invent uncertain facts as confirmed data.
- Do not delete generated local folders after deployment failures.

## 5. Skill Shape

Recommended skill name: `happy-trip-site`

Recommended implementation layout:

```text
happy-trip-site/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
│   ├── create_site.py
│   ├── validate_site.py
│   └── deploy_vercel.py
├── assets/
│   └── static-template/
│       ├── index.html
│       ├── vercel.json
│       └── assets/
│           ├── css/travel.css
│           ├── js/travel.js
│           ├── js/trip-data.template.js
│           ├── icons/
│           └── audio/
└── references/
    ├── itinerary-schema.md
    ├── extraction-rules.md
    └── vercel-deploy.md
```

The skill should be initialized with `skill-creator`'s `init_skill.py` during implementation, then edited into this structure. `SKILL.md` should stay concise and load references only when needed.

## 6. Core Workflow

The skill workflow has five phases:

1. Intake and extraction
2. Readiness conversation
3. Confirmed generation
4. Local validation
5. Vercel production deployment and smoke test

The important rule is sequencing: generation cannot begin until the readiness gate passes and the user confirms the trip summary.

## 7. Readiness Gate

The skill must create a `Trip Brief` from the user's natural-language input before any file generation.

Required `Trip Brief` fields:

```text
trip_title
trip_slug
date_range
days
output_desktop_folder
deploy_to_vercel_prod
language
style_preset
assumptions
uncertain_items
```

Required day fields:

```text
day_number
date_or_label
city_or_area
title
morning_items
afternoon_items
evening_items
route_stops
```

Minimum conditions to start generation:

```text
- A trip title exists or can be safely derived.
- At least one day exists.
- Each day has at least two of: date or day label, city or area, at least one main item.
- The user confirms the Desktop output folder behavior.
- The user confirms production deployment with Vercel.
- Major ambiguous places are resolved enough to avoid publishing misleading content.
```

Optional missing information should not block generation, but must be listed in the confirmation summary:

```text
- Missing exact hotel address.
- Missing restaurant reservation links.
- Missing official websites.
- Missing real images.
- Missing exact times for morning or afternoon events.
```

If required information is missing, the skill must ask targeted follow-up questions instead of generating files. It should ask one to three high-value questions per turn and explain why they matter.

## 8. Natural-Language Extraction Rules

The skill should accept input copied from chat, spreadsheets, notes, Markdown, or plain text.

Extraction behavior:

- Preserve explicit times exactly.
- Preserve vague time labels such as "morning", "afternoon", "晚上", or "一整天" instead of inventing clock times.
- Split each day into `morning`, `afternoon`, and `evening` where possible.
- Use the user's location names as display labels.
- Generate Google Maps search links from place names when no URL is provided.
- Infer daily route overview stops from hotel, transport nodes, and major attractions, but mark inferred stops in the assumptions list.
- Ask follow-up questions for same-name hotels, unclear airports, unclear cities, or conflicting dates.
- Never convert uncertain inference into confirmed copy without user confirmation.

Pre-generation confirmation summary format:

```text
I will generate:
- Trip: <title>
- Days: <n>
- Output folder: ~/Desktop/<trip-slug>-travel-site
- Deployment: Vercel production
- Included: day navigation, timeline checklist, route overview, map/search links, mobile layout
- Assumptions: <short list>
- Unresolved optional items: <short list>

Please confirm before I generate and deploy.
```

## 9. Template Generalization

The current Kansai files should be generalized as follows:

```text
关西行程.html -> index.html
assets/css/kansai.css -> assets/css/travel.css
assets/js/kansai.js -> assets/js/travel.js
assets/js/kansai-data.js -> assets/js/trip-data.js
KANSAI_HOME_DATA -> TRIP_SITE_DATA
kansai-specific localStorage keys -> trip-slug-scoped keys
```

All trip-specific copy should come from `trip-data.js`, including:

- Page title
- Sidebar title and subtitle
- City labels
- Hero stamp text
- Day titles
- Route stops
- Timeline items
- Item tags
- External links
- Optional music configuration

Default visual system:

- Mobile-first travel notebook layout
- Single active day view
- Drawer day navigation
- Timeline checklist
- Visible link pills
- Route overview with Google Maps embed/search/directions links
- Safe-area support for phones
- Optional floating music button

The template should remain static and deployable without a build command.

## 10. Generated Site Layout

Each use of the skill should create a new Desktop folder:

```text
~/Desktop/<trip-slug>-travel-site/
├── index.html
├── vercel.json
├── assets/
│   ├── css/travel.css
│   ├── js/travel.js
│   ├── js/trip-data.js
│   ├── icons/
│   └── audio/
├── trip-brief.json
├── validation-result.json
└── deployment-result.json
```

The generated folder is a complete static Vercel project. It should not depend on files inside the skill folder after generation.

## 11. Vercel Deployment Design

The skill should use the official Vercel CLI flow:

```text
vercel --version
vercel whoami
vercel link --yes
vercel deploy --prod --yes
```

Deployment wrapper behavior:

- Fail early if `vercel` is not installed.
- Fail with a clear message if the user is not logged in.
- Link the generated project folder if `.vercel/project.json` is absent.
- Deploy production with `vercel deploy --prod --yes`.
- Capture the production URL from stdout.
- Write `deployment-result.json`.
- Run a production smoke test before claiming completion.

Smoke test:

```text
- Fetch production URL and require HTTP 200.
- Confirm returned HTML contains the mobile viewport meta tag.
- Confirm `assets/js/trip-data.js` is reachable.
- Confirm the page contains at least one rendered day after JS data is present locally.
```

Vercel failures should leave the local folder intact and report the failed stage.

## 12. Scripts

### `scripts/create_site.py`

Inputs:

```text
--trip-data <path/to/trip-brief.json>
--output-root ~/Desktop
--force false
```

Responsibilities:

- Validate the trip brief has enough structure to create files.
- Create `~/Desktop/<trip-slug>-travel-site`.
- Copy `assets/static-template`.
- Write `assets/js/trip-data.js`.
- Write `trip-brief.json`.
- Refuse to overwrite an existing folder unless `--force` is explicitly provided.

### `scripts/validate_site.py`

Responsibilities:

- Check required files exist.
- Check `index.html` references `assets/css/travel.css`, `assets/js/travel.js`, and `assets/js/trip-data.js`.
- Check mobile viewport metadata.
- Check `vercel.json` rewrite points `/` to `/index.html`.
- Check trip data contains at least one day and one item.
- Optionally run a local static server and verify mobile viewport rendering with browser automation when available.

### `scripts/deploy_vercel.py`

Responsibilities:

- Check `vercel` CLI.
- Check `vercel whoami`.
- Run `vercel link --yes` when needed.
- Run `vercel deploy --prod --yes`.
- Capture stdout URL.
- Smoke test the deployed site.
- Write `deployment-result.json`.

## 13. Error Handling

Information errors:

- If required itinerary information is missing, keep asking questions.
- If optional information is missing, list the default behavior and ask for confirmation.

File errors:

- If output folder exists, stop and ask whether to choose another slug or overwrite.
- If template files are missing, stop before creating partial output.

Validation errors:

- Keep generated files.
- Return exact failing checks.
- Do not deploy.

Vercel errors:

- If CLI is missing, tell the user to install Vercel CLI.
- If login is missing, tell the user to run `vercel login`.
- If link or deploy fails, preserve logs and report the command stage.
- If production smoke test fails, return the URL but mark completion as failed.

## 14. Testing Plan

Minimum tests:

```text
python scripts/create_site.py --trip-data examples/osaka-nara.json --output-root /tmp
python scripts/validate_site.py /tmp/osaka-nara-travel-site
python scripts/deploy_vercel.py /tmp/osaka-nara-travel-site --dry-run
```

End-to-end test:

```text
Input a natural-language three-day itinerary.
Run readiness extraction.
Confirm the summary.
Generate a Desktop folder.
Validate local files.
Deploy to Vercel production.
Fetch production URL.
Open with mobile viewport.
```

Forward test:

- Ask a fresh agent to use the skill with only the skill folder and a raw itinerary.
- Check whether it asks follow-up questions instead of generating too early.
- Check whether generated output follows the schema and passes validation.

## 15. Acceptance Criteria

- Natural-language itinerary input triggers the skill.
- The skill asks follow-up questions when required information is incomplete.
- The skill refuses generation until the user confirms the extracted trip brief.
- A confirmed run creates a new Desktop folder.
- The generated project is self-contained and Vercel-ready.
- The generated page is mobile-readable.
- Missing place links become Google Maps search links.
- Production deployment uses `vercel deploy --prod`.
- The final response includes local folder path, production URL, and validation status.
- Failures identify the exact failed stage and preserve local output.

## 16. References

- Vercel CLI overview: https://vercel.com/docs/cli
- Vercel project linking: https://vercel.com/docs/cli/project-linking
- Vercel deploy command: https://vercel.com/docs/cli/deploy
- Deploying from the CLI: https://vercel.com/docs/projects/deploy-from-cli

## 17. Self-Review

- Placeholder scan: no unresolved placeholder markers remain.
- Consistency check: the skill remains static-site based, while Vercel deploy uses official CLI commands only.
- Scope check: this is one skill and one reusable static template, not a full website builder.
- Ambiguity check: generation is blocked until the Trip Brief is confirmed, and optional missing data is explicitly separated from required data.
