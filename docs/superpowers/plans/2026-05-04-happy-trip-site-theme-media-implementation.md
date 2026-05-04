# Happy Trip Site Theme Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the confirmed visual-theme and real-media pipeline for `skill/happy-trip-site`, so generated travel sites require a user-confirmed theme and user-confirmed real images before final generation.

**Architecture:** Keep the existing static-site generator and mobile UX skeleton. Add two explicit input contracts, `Theme Brief` and `Media Brief`, then make `create_site.py` validate them, download confirmed media into `assets/media/`, write a manifest, and expose theme/media data through `trip-data.js`. The template consumes only theme tokens and confirmed local media; `validate_site.py` enforces the new contract and rejects missing media, missing attribution, or old placeholder/template visuals.

**Tech Stack:** Python 3 standard library (`argparse`, `json`, `pathlib`, `urllib.request`, `shutil`), static HTML/CSS/JavaScript, `python3 -m unittest discover -s tests -v`.

---

## Execution Notes

The user explicitly approved implementation directly on `main` and asked not to create a branch. Because the current worktree already contains dirty files, do not run `git reset`, `git checkout --`, or broad `git add .`. Before each task, inspect the exact files named in that task and work with existing changes instead of reverting them.

Use commits only as checkpoints when the touched file set is cleanly understood. If a listed file has unrelated pre-existing edits that are not part of this implementation, stop before committing and ask the user whether to stage a partial hunk or leave the task uncommitted.

Primary spec: `docs/superpowers/specs/2026-05-04-happy-trip-site-theme-media-design.md`.

## File Structure

- Modify `skill/happy-trip-site/SKILL.md`
  - Adds the new generation gate: Trip Brief, Theme Brief, Media Brief, confirmation summary, then generation.
  - Keeps the mobile link contract and Vercel flow intact.
- Modify `skill/happy-trip-site/references/itinerary-schema.md`
  - Documents that Trip Brief remains factual.
  - Adds Theme Brief and Media Brief schemas with required fields.
- Modify `skill/happy-trip-site/references/extraction-rules.md`
  - Replaces default `washi` inference with destination-derived theme recommendation and media confirmation rules.
- Modify `README.md`
  - Updates CLI examples and workflow contract to include `--theme-brief` and `--media-brief`.
- Modify `skill/happy-trip-site/scripts/create_site.py`
  - Adds `--theme-brief` and `--media-brief`.
  - Validates confirmed theme/media inputs.
  - Downloads confirmed assets into `assets/media/`.
  - Writes `theme-brief.json`, `media-brief.json`, `media-manifest.json`, and theme/media data into `assets/js/trip-data.js`.
- Modify `skill/happy-trip-site/scripts/validate_site.py`
  - Requires the new brief/manifest files.
  - Validates local media paths, attribution metadata, theme tokens, and banned final UI tokens.
- Modify `skill/happy-trip-site/assets/static-template/index.html`
  - Removes Kansai-specific favicon, Sakura canvas, Japanese font dependency, and audio-only decoration.
  - Keeps topbar, sidebar, day navigation, main container, and script order.
- Modify `skill/happy-trip-site/assets/static-template/assets/css/travel.css`
  - Replaces hard-coded washi/sakura/Kansai variables with generic theme CSS variables.
  - Adds real image hero styles.
  - Preserves mobile layout, day drawer, route overview, timeline, checklist, and link pills.
- Modify `skill/happy-trip-site/assets/static-template/assets/js/travel.js`
  - Applies theme tokens to CSS variables.
  - Renders confirmed local media assets.
  - Removes placeholder image rendering and Sakura startup.
- Modify `tests/test_create_site.py`
  - Adds helpers that write temporary theme/media briefs and tiny local PNG fixtures.
  - Updates all generator invocations to pass confirmed briefs.
  - Adds failure tests for missing/unconfirmed theme/media and failed downloads.
- Modify `tests/test_validate_site.py`
  - Updates generated-site validation setup.
  - Adds failure tests for manifest/media/theme contract.
- Modify `tests/test_skill_contract.py`
  - Verifies the skill docs mention Theme Brief, Media Brief, user confirmation, and no placeholder fallback.

## Data Contracts To Implement

`Theme Brief` must be a JSON object shaped like:

```json
{
  "recommended_theme_id": "urban-bay-neon",
  "confirmed_theme_id": "urban-bay-neon",
  "theme_options": [
    {
      "id": "urban-bay-neon",
      "name": "城市海湾夜行",
      "reason": "行程跨城市湾区，以夜景、交通和城市步行为主。",
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

`Media Brief` must be a JSON object shaped like:

```json
{
  "siteHero": {
    "confirmed": true,
    "selected_asset_id": "site-hero-01",
    "candidates": [
      {
        "asset_id": "site-hero-01",
        "remote_url": "file:///tmp/happy-trip-site-source/site-hero.png",
        "local_path": "assets/media/site-hero-01.png",
        "source": "Local test fixture",
        "credit": "Fixture image",
        "usage_note": "Used for automated tests.",
        "matched_query": "Hong Kong skyline night",
        "reason": "Matches the whole-trip urban hero.",
        "width": 1600,
        "height": 1000
      }
    ]
  },
  "dayHeroes": {
    "day-1": {
      "confirmed": true,
      "selected_asset_id": "day-1-hero-01",
      "candidates": [
        {
          "asset_id": "day-1-hero-01",
          "remote_url": "file:///tmp/happy-trip-site-source/day-1-hero.png",
          "local_path": "assets/media/day-1-hero-01.png",
          "source": "Local test fixture",
          "credit": "Fixture image",
          "usage_note": "Used for automated tests.",
          "matched_query": "Osaka street night",
          "reason": "Matches day 1 city walking.",
          "width": 1600,
          "height": 1000
        }
      ]
    }
  }
}
```

## Task 1: Update Skill Contract Documentation

**Files:**
- Modify: `skill/happy-trip-site/SKILL.md`
- Modify: `skill/happy-trip-site/references/itinerary-schema.md`
- Modify: `skill/happy-trip-site/references/extraction-rules.md`
- Modify: `README.md`
- Test: `tests/test_skill_contract.py`

- [ ] **Step 1: Add failing contract tests**

Append these assertions to `tests/test_skill_contract.py` inside `SkillContractTest`:

```python
    def test_theme_and_media_gate_is_documented_for_agents(self):
        skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        schema_text = (SKILL / "references" / "itinerary-schema.md").read_text(encoding="utf-8")
        extraction_text = (SKILL / "references" / "extraction-rules.md").read_text(encoding="utf-8")

        self.assertIn("Theme Brief", skill_text)
        self.assertIn("Media Brief", skill_text)
        self.assertIn("confirmed_theme_id", schema_text)
        self.assertIn("selected_asset_id", schema_text)
        self.assertIn("不使用占位符", extraction_text)
        self.assertIn("真实图片", extraction_text)

    def test_readme_documents_theme_and_media_cli_inputs(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("--theme-brief", readme)
        self.assertIn("--media-brief", readme)
        self.assertIn("theme-brief.json", readme)
        self.assertIn("media-manifest.json", readme)
```

- [ ] **Step 2: Run the focused failing tests**

Run:

```bash
python3 -m unittest tests.test_skill_contract.SkillContractTest.test_theme_and_media_gate_is_documented_for_agents tests.test_skill_contract.SkillContractTest.test_readme_documents_theme_and_media_cli_inputs -v
```

Expected: both tests fail because the docs do not yet mention `Theme Brief`, `Media Brief`, `--theme-brief`, and `--media-brief`.

- [ ] **Step 3: Update `skill/happy-trip-site/SKILL.md` gate and workflow**

In `skill/happy-trip-site/SKILL.md`, replace the current hard gate list with:

```markdown
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

If information is incomplete, ask one to three targeted questions. Explain why the missing information matters. Never use placeholder images, sample images, or the old Kansai visual style as a fallback.
```

Then replace the workflow list with:

```markdown
## Workflow

1. Read `references/itinerary-schema.md`.
2. Read `references/extraction-rules.md`.
3. Extract the user's itinerary into a Trip Brief.
4. Ask follow-up questions until blocking trip fields are complete.
5. Recommend 2-4 Theme Brief options and mark one as recommended.
6. Search for real image candidates for the whole-site hero and every day hero.
7. Show the confirmation summary.
8. After confirmation, write the Trip Brief, Theme Brief, and Media Brief JSON to temporary files.
9. Run `scripts/create_site.py` with `--trip-data`, `--theme-brief`, and `--media-brief`.
10. Run `scripts/validate_site.py` on the generated folder.
11. For local-only requests, return the local folder and validation status.
12. For production requests, read `references/vercel-deploy.md`, run `scripts/deploy_vercel.py`, smoke test production, then return the local folder, production URL, validation status, theme, media assumptions, and remaining optional gaps.
```

Update the generation command block to:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data /path/to/trip-brief.json \
  --theme-brief /path/to/theme-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-root "$HOME/Desktop"
```

- [ ] **Step 4: Update `itinerary-schema.md` with Theme Brief and Media Brief**

In `skill/happy-trip-site/references/itinerary-schema.md`, remove `"style_preset": "washi"` from the Trip Brief example and add this section after the Trip Brief section:

````markdown
## Theme Brief

Represent the confirmed visual direction as JSON:

```json
{
  "recommended_theme_id": "urban-bay-neon",
  "confirmed_theme_id": "urban-bay-neon",
  "theme_options": [
    {
      "id": "urban-bay-neon",
      "name": "城市海湾夜行",
      "reason": "The trip crosses dense bay cities and includes night views, transit, food, and walking.",
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

- Provide 2-4 `theme_options` before generation.
- `recommended_theme_id` is the agent's recommendation.
- `confirmed_theme_id` is required and must match one option id.
- The final generated site may only use the confirmed theme tokens.

## Media Brief

Represent confirmed real media as JSON:

```json
{
  "siteHero": {
    "confirmed": true,
    "selected_asset_id": "site-hero-01",
    "candidates": [
      {
        "asset_id": "site-hero-01",
        "remote_url": "https://example.com/real-destination-photo.jpg",
        "local_path": "assets/media/site-hero-01.jpg",
        "source": "Wikimedia Commons",
        "credit": "Photographer or source name",
        "usage_note": "Source page recorded for attribution.",
        "matched_query": "Hong Kong skyline night",
        "reason": "Matches the whole-trip city skyline.",
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

Rules:

- `siteHero.confirmed` must be `true`.
- Every day must have a confirmed `dayHeroes.day-N`.
- Every selected candidate must include `remote_url`, `local_path`, `source`, `matched_query`, and at least one of `credit` or `usage_note`.
- `local_path` must be under `assets/media/`.
- Generation fails if a confirmed image cannot be downloaded.
- Do not use placeholder images, sample images, generated blank cards, or old Kansai visual assets as final media.
````

Also update the Readiness Checklist blocking requirements to include:

```markdown
- The user has confirmed one visual theme from Theme Brief options.
- The user has confirmed a real image for the whole-site hero and each day hero.
```

Update optional gaps by removing `Missing real images` and `Missing background music preference`.

- [ ] **Step 5: Update `extraction-rules.md` style/media rules**

Replace the line `If the user provides no style preference, use \`washi\`.` with:

```markdown
- If the user provides no style preference, derive 2-4 theme options from destination, season, activity mix, transport mode, and trip tone. Recommend one option, then ask the user to confirm.
- Generate image search queries from city, landmark, route theme, and activity type.
- Show real image candidates with source, credit or usage note, matched query, and reason before generation.
- 不使用占位符、示例图、旧关西视觉或仅文本 hero 作为最终兜底。
```

Add these follow-up bullets:

```markdown
- The user has not confirmed a Theme Brief option.
- The user has not confirmed every required Media Brief slot.
- A confirmed image candidate is unavailable or mismatched.
```

- [ ] **Step 6: Update `README.md` commands and workflow contract**

In `README.md`, update the workflow list so step 3 says:

```markdown
3. Show a confirmation summary covering Trip Brief, Theme Brief, Media Brief, output folder, and deployment target before generating files or deploying.
```

Update the generate command to:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data /path/to/trip-brief.json \
  --theme-brief /path/to/theme-brief.json \
  --media-brief /path/to/media-brief.json \
  --output-root "$HOME/Desktop"
```

Update the end-to-end local dry run command to include:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data tests/fixtures/osaka-nara-trip-brief.json \
  --theme-brief /tmp/happy-trip-site-e2e/theme-brief.json \
  --media-brief /tmp/happy-trip-site-e2e/media-brief.json \
  --output-root /tmp/happy-trip-site-e2e
```

Add a sentence under `Mobile Link Rules`:

```markdown
The visual layer is also gated: the generator requires a confirmed Theme Brief and Media Brief, downloads confirmed images into `assets/media/`, and writes `media-manifest.json`.
```

- [ ] **Step 7: Run contract tests**

Run:

```bash
python3 -m unittest tests.test_skill_contract -v
```

Expected: all `SkillContractTest` tests pass.

- [ ] **Step 8: Checkpoint diff**

Run:

```bash
git diff -- skill/happy-trip-site/SKILL.md skill/happy-trip-site/references/itinerary-schema.md skill/happy-trip-site/references/extraction-rules.md README.md tests/test_skill_contract.py
```

Expected: diff only contains Theme Brief, Media Brief, confirmed media gate, and README command updates.

If committing is safe:

```bash
git add skill/happy-trip-site/SKILL.md skill/happy-trip-site/references/itinerary-schema.md skill/happy-trip-site/references/extraction-rules.md README.md tests/test_skill_contract.py
git commit -m "docs: add theme media gate to happy trip skill"
```

## Task 2: Add Generator Tests For Confirmed Theme And Media

**Files:**
- Modify: `tests/test_create_site.py`
- Test: `tests/test_create_site.py`

- [ ] **Step 1: Add test helpers to `tests/test_create_site.py`**

Add these imports near the top:

```python
import base64
```

Add these helper functions below `extract_trip_data`:

```python
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


def write_image(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(PNG_BYTES)


def write_theme_brief(path: Path, confirmed: bool = True) -> Path:
    theme = {
        "recommended_theme_id": "urban-bay-neon",
        "confirmed_theme_id": "urban-bay-neon" if confirmed else "",
        "theme_options": [
            {
                "id": "urban-bay-neon",
                "name": "城市海湾夜行",
                "reason": "Dense city route with food, transit, and night walking.",
                "palette": {
                    "background": "#F6F4EE",
                    "surface": "#FFFFFF",
                    "ink": "#171A1F",
                    "muted": "#67717D",
                    "accent": "#0E7C86",
                    "accent2": "#D34F2F",
                    "line": "rgba(23,26,31,.14)",
                },
                "typography": {
                    "sans": "system-ui",
                    "serif": "serif",
                    "display": "system-ui",
                },
                "motifs": ["bay", "metro", "night-lights"],
            }
        ],
    }
    path.write_text(json.dumps(theme), encoding="utf-8")
    return path


def write_media_brief(path: Path, source_root: Path, confirmed: bool = True, bad_url: bool = False) -> Path:
    site_source = source_root / "site-hero.png"
    day_source = source_root / "day-1-hero.png"
    write_image(site_source)
    write_image(day_source)
    if bad_url:
        site_url = (source_root / "missing-site-hero.png").resolve().as_uri()
    else:
        site_url = site_source.resolve().as_uri()
    media = {
        "siteHero": {
            "confirmed": confirmed,
            "selected_asset_id": "site-hero-01",
            "candidates": [
                {
                    "asset_id": "site-hero-01",
                    "remote_url": site_url,
                    "local_path": "assets/media/site-hero-01.png",
                    "source": "Local test fixture",
                    "credit": "Fixture image",
                    "usage_note": "Used for automated tests.",
                    "matched_query": "Osaka skyline",
                    "reason": "Matches whole-trip hero.",
                    "width": 1600,
                    "height": 1000,
                }
            ],
        },
        "dayHeroes": {
            "day-1": {
                "confirmed": confirmed,
                "selected_asset_id": "day-1-hero-01",
                "candidates": [
                    {
                        "asset_id": "day-1-hero-01",
                        "remote_url": day_source.resolve().as_uri(),
                        "local_path": "assets/media/day-1-hero-01.png",
                        "source": "Local test fixture",
                        "credit": "Fixture image",
                        "usage_note": "Used for automated tests.",
                        "matched_query": "Dotonbori night",
                        "reason": "Matches day 1 city walking.",
                        "width": 1600,
                        "height": 1000,
                    }
                ],
            }
        },
    }
    path.write_text(json.dumps(media), encoding="utf-8")
    return path


def run_create(output_root: Path, trip_data: Path = FIXTURE, theme_confirmed: bool = True, media_confirmed: bool = True, bad_media_url: bool = False):
    source_root = output_root / "media-source"
    theme_path = write_theme_brief(output_root / "theme-brief.json", confirmed=theme_confirmed)
    media_path = write_media_brief(
        output_root / "media-brief.json",
        source_root,
        confirmed=media_confirmed,
        bad_url=bad_media_url,
    )
    return subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--trip-data",
            str(trip_data),
            "--theme-brief",
            str(theme_path),
            "--media-brief",
            str(media_path),
            "--output-root",
            str(output_root),
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
```

- [ ] **Step 2: Update existing generator tests to use the helper**

In `test_create_site_writes_self_contained_static_project`, replace the `subprocess.run([...])` call with:

```python
            result = run_create(Path(tmp))
```

Then add these assertions after the existing static-file assertions:

```python
            self.assertTrue((project / "theme-brief.json").exists())
            self.assertTrue((project / "media-brief.json").exists())
            self.assertTrue((project / "media-manifest.json").exists())
            self.assertTrue((project / "assets/media/site-hero-01.png").exists())
            self.assertTrue((project / "assets/media/day-1-hero-01.png").exists())
```

Add these assertions after `data = extract_trip_data(data_js)`:

```python
            self.assertEqual(data["theme"]["themeId"], "urban-bay-neon")
            self.assertEqual(data["theme"]["palette"]["accent"], "#0E7C86")
            self.assertEqual(data["media"]["siteHero"]["localPath"], "assets/media/site-hero-01.png")
            self.assertEqual(data["media"]["dayHeroes"]["day-1"]["localPath"], "assets/media/day-1-hero-01.png")
            manifest = json.loads((project / "media-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(len(manifest["assets"]), 2)
            self.assertEqual(manifest["assets"][0]["source"], "Local test fixture")
```

In the remaining tests, create theme/media brief paths before invoking `create_site.py`. For ad hoc trip briefs, use this command shape:

```python
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--trip-data",
                    str(source),
                    "--theme-brief",
                    str(write_theme_brief(Path(tmp) / "theme-brief.json")),
                    "--media-brief",
                    str(write_media_brief(Path(tmp) / "media-brief.json", Path(tmp) / "media-source")),
                    "--output-root",
                    tmp,
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
```

- [ ] **Step 3: Add generator failure tests**

Append these tests to `CreateSiteTest`:

```python
    def test_create_site_requires_theme_brief(self):
        with tempfile.TemporaryDirectory() as tmp:
            media_path = write_media_brief(Path(tmp) / "media-brief.json", Path(tmp) / "media-source")
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--trip-data",
                    str(FIXTURE),
                    "--media-brief",
                    str(media_path),
                    "--output-root",
                    tmp,
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("--theme-brief is required", result.stderr)

    def test_create_site_rejects_unconfirmed_theme(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = run_create(Path(tmp), theme_confirmed=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("confirmed_theme_id", result.stderr)

    def test_create_site_rejects_unconfirmed_media(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = run_create(Path(tmp), media_confirmed=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("siteHero must be confirmed", result.stderr)

    def test_create_site_fails_when_media_download_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = run_create(Path(tmp), bad_media_url=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Failed to download media asset site-hero-01", result.stderr)
```

- [ ] **Step 4: Run the focused failing tests**

Run:

```bash
python3 -m unittest tests.test_create_site -v
```

Expected: tests fail because `create_site.py` does not accept `--theme-brief` or `--media-brief` yet.

## Task 3: Implement Theme And Media Generation In `create_site.py`

**Files:**
- Modify: `skill/happy-trip-site/scripts/create_site.py`
- Test: `tests/test_create_site.py`

- [ ] **Step 1: Add imports**

In `skill/happy-trip-site/scripts/create_site.py`, add:

```python
from urllib.request import urlopen
```

- [ ] **Step 2: Add JSON loading and theme validation helpers**

Add these functions after `load_trip_brief`:

```python
def load_json_object(path: Path, label: str) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{label} must be a JSON object.")
    return data


def selected_theme_option(theme: dict) -> dict:
    confirmed_id = str(theme.get("confirmed_theme_id") or "").strip()
    if not confirmed_id:
        raise ValueError("Theme Brief must contain confirmed_theme_id.")
    options = theme.get("theme_options")
    if not isinstance(options, list) or not options:
        raise ValueError("Theme Brief must contain theme_options.")
    for option in options:
        if isinstance(option, dict) and option.get("id") == confirmed_id:
            palette = option.get("palette")
            if not isinstance(palette, dict):
                raise ValueError("Confirmed theme option must contain palette.")
            required = ["background", "surface", "ink", "muted", "accent", "accent2", "line"]
            missing = [key for key in required if not palette.get(key)]
            if missing:
                raise ValueError("Confirmed theme palette missing: " + ", ".join(missing))
            return option
    raise ValueError(f"confirmed_theme_id does not match a theme option: {confirmed_id}")


def load_theme_brief(path: Path) -> tuple[dict, dict]:
    theme = load_json_object(path, "Theme Brief")
    option = selected_theme_option(theme)
    return theme, option
```

- [ ] **Step 3: Add media validation helpers**

Add these functions after `load_theme_brief`:

```python
def ensure_media_local_path(value: str, asset_id: str) -> str:
    local_path = str(value or "").strip()
    if not local_path:
        raise ValueError(f"Media asset {asset_id} must contain local_path.")
    path = Path(local_path)
    if path.is_absolute() or ".." in path.parts or path.parts[:2] != ("assets", "media"):
        raise ValueError(f"Media asset {asset_id} local_path must stay under assets/media/.")
    return local_path


def selected_media_candidate(slot: dict, slot_name: str) -> dict:
    if not isinstance(slot, dict):
        raise ValueError(f"{slot_name} must be an object.")
    if slot.get("confirmed") is not True:
        raise ValueError(f"{slot_name} must be confirmed.")
    selected_asset_id = str(slot.get("selected_asset_id") or "").strip()
    if not selected_asset_id:
        raise ValueError(f"{slot_name} must contain selected_asset_id.")
    candidates = slot.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise ValueError(f"{slot_name} must contain candidates.")
    for candidate in candidates:
        if not isinstance(candidate, dict):
            continue
        if candidate.get("asset_id") != selected_asset_id:
            continue
        for key in ["remote_url", "source", "matched_query"]:
            if not str(candidate.get(key) or "").strip():
                raise ValueError(f"Media asset {selected_asset_id} must contain {key}.")
        if not str(candidate.get("credit") or candidate.get("usage_note") or "").strip():
            raise ValueError(f"Media asset {selected_asset_id} must contain credit or usage_note.")
        candidate = dict(candidate)
        candidate["local_path"] = ensure_media_local_path(candidate.get("local_path", ""), selected_asset_id)
        return candidate
    raise ValueError(f"{slot_name} selected_asset_id does not match any candidate: {selected_asset_id}")


def load_media_brief(path: Path, days: list[dict]) -> tuple[dict, list[dict]]:
    media = load_json_object(path, "Media Brief")
    assets: list[dict] = []
    assets.append(selected_media_candidate(media.get("siteHero"), "siteHero"))
    day_heroes = media.get("dayHeroes")
    if not isinstance(day_heroes, dict):
        raise ValueError("Media Brief must contain dayHeroes.")
    for day in days:
        key = f"day-{day.get('n')}"
        assets.append(selected_media_candidate(day_heroes.get(key), key))
    return media, assets
```

- [ ] **Step 4: Add asset serialization and download helpers**

Add these functions after `load_media_brief`:

```python
def public_asset(candidate: dict) -> dict:
    return {
        "assetId": candidate["asset_id"],
        "localPath": candidate["local_path"],
        "source": candidate["source"],
        "credit": candidate.get("credit", ""),
        "usageNote": candidate.get("usage_note", ""),
        "matchedQuery": candidate["matched_query"],
        "reason": candidate.get("reason", ""),
        "width": candidate.get("width"),
        "height": candidate.get("height"),
    }


def media_manifest_asset(candidate: dict) -> dict:
    return {
        "asset_id": candidate["asset_id"],
        "local_path": candidate["local_path"],
        "source": candidate["source"],
        "credit": candidate.get("credit", ""),
        "usage_note": candidate.get("usage_note", ""),
        "matched_query": candidate["matched_query"],
    }


def download_media_assets(project: Path, assets: list[dict]) -> None:
    (project / "assets" / "media").mkdir(parents=True, exist_ok=True)
    for candidate in assets:
        target = project / candidate["local_path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            with urlopen(candidate["remote_url"], timeout=20) as response:
                target.write_bytes(response.read())
        except Exception as exc:
            raise RuntimeError(f"Failed to download media asset {candidate['asset_id']}: {exc}") from exc
        if not target.exists() or target.stat().st_size == 0:
            raise RuntimeError(f"Failed to download media asset {candidate['asset_id']}: empty file")


def write_media_manifest(project: Path, assets: list[dict]) -> None:
    manifest = {"assets": [media_manifest_asset(asset) for asset in assets]}
    (project / "media-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
```

- [ ] **Step 5: Replace `write_trip_data` signature and payload**

Replace `write_trip_data(project: Path, brief: dict) -> None` with:

```python
def write_trip_data(project: Path, brief: dict, theme_option: dict, media: dict) -> None:
    day_heroes = media.get("dayHeroes", {})
    data = {
        "slug": brief["trip_slug"],
        "title": brief["trip_title"],
        "dateRange": brief.get("date_range", ""),
        "language": brief.get("language", "zh-CN"),
        "theme": {
            "themeId": theme_option["id"],
            "name": theme_option.get("name", theme_option["id"]),
            "reason": theme_option.get("reason", ""),
            "palette": theme_option["palette"],
            "typography": theme_option.get("typography", {}),
            "motifs": theme_option.get("motifs", []),
        },
        "media": {
            "siteHero": public_asset(selected_media_candidate(media["siteHero"], "siteHero")),
            "dayHeroes": {
                key: public_asset(selected_media_candidate(slot, key))
                for key, slot in day_heroes.items()
                if isinstance(slot, dict)
            },
        },
        "assumptions": brief.get("assumptions", []),
        "uncertainItems": brief.get("uncertain_items", []),
        "days": brief["days"],
    }
    output = "window.TRIP_SITE_DATA = "
    output += json.dumps(data, ensure_ascii=False, indent=2)
    output += ";\n"
    target = project / "assets/js/trip-data.js"
    target.write_text(output, encoding="utf-8")
```

- [ ] **Step 6: Replace `create_site` signature and body**

Replace:

```python
def create_site(trip_data: Path, output_root: Path, force: bool) -> Path:
```

with:

```python
def create_site(trip_data: Path, theme_brief: Path, media_brief: Path, output_root: Path, force: bool) -> Path:
```

Inside the function, replace the body after `brief = load_trip_brief(trip_data)` with:

```python
    theme, theme_option = load_theme_brief(theme_brief)
    media, media_assets = load_media_brief(media_brief, brief["days"])
    project = output_root.expanduser().resolve() / f"{brief['trip_slug']}-travel-site"
    if project.exists():
        if not force:
            raise FileExistsError(f"Output folder already exists: {project}")
        shutil.rmtree(project)
    shutil.copytree(TEMPLATE_ROOT, project)
    generated_brief = copy.deepcopy(brief)
    download_media_assets(project, media_assets)
    write_trip_data(project, generated_brief, theme_option, media)
    (project / "trip-brief.json").write_text(
        json.dumps(generated_brief, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (project / "theme-brief.json").write_text(
        json.dumps(theme, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (project / "media-brief.json").write_text(
        json.dumps(media, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_media_manifest(project, media_assets)
    (project / "generation-result.json").write_text(
        json.dumps({"ok": True, "project_path": str(project)}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return project
```

- [ ] **Step 7: Update CLI argument parsing**

In `main`, add:

```python
    parser.add_argument("--theme-brief", required=False, type=Path)
    parser.add_argument("--media-brief", required=False, type=Path)
```

Before calling `create_site`, add:

```python
        if args.theme_brief is None:
            raise ValueError("--theme-brief is required")
        if args.media_brief is None:
            raise ValueError("--media-brief is required")
```

Replace the call:

```python
        project = create_site(args.trip_data, args.output_root, args.force)
```

with:

```python
        project = create_site(args.trip_data, args.theme_brief, args.media_brief, args.output_root, args.force)
```

- [ ] **Step 8: Run generator tests**

Run:

```bash
python3 -m unittest tests.test_create_site -v
```

Expected: all generator tests pass.

- [ ] **Step 9: Checkpoint diff**

Run:

```bash
git diff -- skill/happy-trip-site/scripts/create_site.py tests/test_create_site.py
```

Expected: diff contains only confirmed theme/media parsing, media download, manifest writing, CLI changes, and tests.

If committing is safe:

```bash
git add skill/happy-trip-site/scripts/create_site.py tests/test_create_site.py
git commit -m "feat: generate sites from confirmed theme and media briefs"
```

## Task 4: Update Static Template To Use Theme Tokens And Real Media

**Files:**
- Modify: `skill/happy-trip-site/assets/static-template/index.html`
- Modify: `skill/happy-trip-site/assets/static-template/assets/js/travel.js`
- Modify: `skill/happy-trip-site/assets/static-template/assets/css/travel.css`
- Test: `tests/test_create_site.py`

- [ ] **Step 1: Update `index.html` shell**

In `skill/happy-trip-site/assets/static-template/index.html`, remove these lines:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&family=Klee+One:wght@400;600&display=swap" />
<link rel="icon" type="image/svg+xml" href="./assets/icons/kansai-bears.svg">
```

Remove:

```html
<canvas id="sakura-canvas"></canvas>
<audio id="bgMusic" src="./assets/audio/bgm.mp3" preload="auto" loop playsinline aria-hidden="true"></audio>
```

Replace the `seal` block:

```html
  <div class="seal"><span id="sealText">旅</span></div>
```

with:

```html
  <div class="theme-badge"><span id="themeBadgeText">TRIP</span></div>
```

Remove:

```html
<button id="music-toggle" class="floating-music-btn" aria-label="播放背景音乐">🎵</button>
```

- [ ] **Step 2: Add focused template assertions to `test_create_site.py`**

In `test_create_site_writes_self_contained_static_project`, after reading `data_js`, add:

```python
            index = (project / "index.html").read_text(encoding="utf-8")
            css = (project / "assets/css/travel.css").read_text(encoding="utf-8")
            js = (project / "assets/js/travel.js").read_text(encoding="utf-8")
            self.assertNotIn("sakura-canvas", index + js + css)
            self.assertNotIn("kansai-bears", index + js + css)
            self.assertNotIn("ph-frame", js + css)
            self.assertIn("theme-badge", index + css)
            self.assertIn("site-hero-media", js + css)
```

- [ ] **Step 3: Add theme/media rendering helpers in `travel.js`**

In `skill/happy-trip-site/assets/static-template/assets/js/travel.js`, inside the main IIFE after element lookups, replace `const sealText = document.getElementById('sealText');` with:

```javascript
  const themeBadgeText = document.getElementById('themeBadgeText');
```

Add these functions before `setStaticShell`:

```javascript
  function applyTheme(){
    const theme = data.theme || {};
    const palette = theme.palette || {};
    const root = document.documentElement;
    const tokens = {
      '--color-bg': palette.background || '#F6F4EE',
      '--color-surface': palette.surface || '#FFFFFF',
      '--color-ink': palette.ink || '#171A1F',
      '--color-muted': palette.muted || '#67717D',
      '--color-accent': palette.accent || '#0E7C86',
      '--color-accent-2': palette.accent2 || '#D34F2F',
      '--color-line': palette.line || 'rgba(23,26,31,.14)'
    };
    Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
    if (theme.themeId) document.body.dataset.theme = theme.themeId;
  }

  function mediaAlt(asset, fallback){
    if (!asset) return fallback;
    return asset.matchedQuery || asset.reason || fallback;
  }

  function renderMediaFigure(asset, className, fallbackAlt){
    if (!asset || !asset.localPath) return '';
    const credit = asset.credit || asset.source || '';
    return `
      <figure class="${className}">
        <img src="./${asset.localPath}" alt="${mediaAlt(asset, fallbackAlt)}" loading="lazy">
        ${credit ? `<figcaption>${credit}</figcaption>` : ''}
      </figure>
    `;
  }

  function dayHeroAsset(day){
    return data.media?.dayHeroes?.[`day-${day.n}`] || data.media?.siteHero || null;
  }
```

- [ ] **Step 4: Update static shell theme text**

In `setStaticShell`, replace:

```javascript
    if (sealText) sealText.textContent = (title || '旅').slice(0, 2);
```

with:

```javascript
    if (themeBadgeText) themeBadgeText.textContent = (data.theme?.name || 'TRIP').slice(0, 4);
```

At the initial render section, replace:

```javascript
  setStaticShell();
```

with:

```javascript
  applyTheme();
  setStaticShell();
```

- [ ] **Step 5: Replace placeholder image rendering**

Replace the entire `renderImg` function with:

```javascript
  function renderImg(img){
    if (!img || !img.src) return '';
    return `
      <figure class="it-media">
        <img src="${img.src}" alt="${img.alt || img.caption || 'Trip photo'}" loading="lazy">
        ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
      </figure>
    `;
  }
```

Replace the `day-hero-img` block in `renderDay`:

```javascript
      ${d.heroImg ? `
        <div class="day-hero-img">
          <div class="ph-corner">DAY ${String(d.n).padStart(2,'0')} · COVER</div>
          <div class="ph-frame">
            <div class="ph-jp">${d.heroImg.jp || d.cityJp}</div>
            <div class="ph-cn">${d.heroImg.cn || d.city.toUpperCase()}</div>
          </div>
          <div class="ph-corner-r">${d.heroImg.stamp || '関西'}</div>
        </div>
      ` : ''}
```

with:

```javascript
      ${renderMediaFigure(dayHeroAsset(d), 'day-hero-media', `${d.city || d.title} trip photo`)}
```

Add the site hero directly after the opening of `main.innerHTML = \`` and before `<header class="day-hero">`:

```javascript
      ${renderMediaFigure(data.media?.siteHero, 'site-hero-media', `${data.title || 'Trip'} hero photo`)}
```

- [ ] **Step 6: Remove Sakura and audio startup**

Delete the `Sakura` class, the `AudioPlayer` class, and this DOMContentLoaded block from `travel.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sakura-canvas');
    if (canvas) new Sakura(canvas);
    new AudioPlayer();
});
```

Keep route overview, sidebar, checklist, and link rendering functions.

- [ ] **Step 7: Replace CSS token base**

In `travel.css`, replace the current `:root` block with:

```css
:root {
  --color-bg: #f6f4ee;
  --color-surface: #ffffff;
  --color-ink: #171a1f;
  --color-muted: #67717d;
  --color-accent: #0e7c86;
  --color-accent-2: #d34f2f;
  --color-line: rgba(23,26,31,.14);
  --color-line-strong: rgba(23,26,31,.28);
  --shadow: 0 1px 0 rgba(23,26,31,.04), 0 8px 24px -12px rgba(23,26,31,.18);
  --bg-card: color-mix(in srgb, var(--color-surface) 82%, transparent);
  --bg-warm: color-mix(in srgb, var(--color-bg) 86%, var(--color-surface));
  --gap: 18px;
  --card-padding: 14px;
  --small-size: 12.5px;
  --serif: Georgia, "Songti SC", "STSong", "Noto Serif CJK SC", serif;
  --sans: system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif;
}
```

Then perform these exact token replacements throughout the CSS:

```text
var(--washi) -> var(--color-bg)
var(--washi-2) -> var(--bg-warm)
var(--washi-3) -> color-mix(in srgb, var(--color-bg) 72%, var(--color-muted))
var(--ink) -> var(--color-ink)
var(--ink-soft) -> var(--color-ink)
var(--ink-mute) -> var(--color-muted)
var(--ink-faded) -> var(--color-muted)
var(--shu) -> var(--color-accent)
var(--shu-deep) -> var(--color-accent-2)
var(--kon) -> var(--color-accent)
var(--matcha) -> var(--color-accent)
var(--gold) -> var(--color-accent-2)
var(--line) -> var(--color-line)
var(--line-strong) -> var(--color-line-strong)
var(--aka) -> var(--color-accent)
var(--hand) -> var(--serif)
```

- [ ] **Step 8: Replace image and badge CSS**

Delete CSS sections titled `image placeholders — washi striped`, `hero image strip on day`, `SAKURA CANVAS`, and `Floating Music Button`.

Add:

```css
.theme-badge {
  min-width: 44px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-family: var(--sans);
  font-weight: 700;
  font-size: 11px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--color-surface) 72%, transparent);
  line-height: 1;
}

.site-hero-media,
.day-hero-media,
.it-media {
  margin: 0 0 22px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--color-line-strong);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.site-hero-media {
  aspect-ratio: 16 / 10;
}

.day-hero-media {
  aspect-ratio: 21 / 8;
}

.it-media {
  margin-top: 12px;
  aspect-ratio: 16 / 10;
}

.site-hero-media img,
.day-hero-media img,
.it-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.site-hero-media figcaption,
.day-hero-media figcaption,
.it-media figcaption {
  padding: 6px 10px;
  font-size: 11px;
  color: var(--color-muted);
  background: var(--color-surface);
}
```

- [ ] **Step 9: Run generator tests**

Run:

```bash
python3 -m unittest tests.test_create_site -v
```

Expected: all generator tests pass, including assertions that final template files do not contain `sakura-canvas`, `kansai-bears`, or `ph-frame`.

- [ ] **Step 10: Checkpoint diff**

Run:

```bash
git diff -- skill/happy-trip-site/assets/static-template/index.html skill/happy-trip-site/assets/static-template/assets/js/travel.js skill/happy-trip-site/assets/static-template/assets/css/travel.css tests/test_create_site.py
```

Expected: diff preserves mobile shell, sidebar, checklist, route overview, and link pills while replacing old visual-specific rendering with theme/media rendering.

If committing is safe:

```bash
git add skill/happy-trip-site/assets/static-template/index.html skill/happy-trip-site/assets/static-template/assets/js/travel.js skill/happy-trip-site/assets/static-template/assets/css/travel.css tests/test_create_site.py
git commit -m "feat: render confirmed theme media in static template"
```

## Task 5: Add Validator Coverage For Theme And Media Contract

**Files:**
- Modify: `tests/test_validate_site.py`
- Modify: `skill/happy-trip-site/scripts/validate_site.py`

- [ ] **Step 1: Add validation test helpers**

At the top of `tests/test_validate_site.py`, add:

```python
import base64
import json
import re
```

Add these helper functions below constants:

```python
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


def write_image(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(PNG_BYTES)


def write_theme_brief(path: Path) -> Path:
    theme = {
        "recommended_theme_id": "urban-bay-neon",
        "confirmed_theme_id": "urban-bay-neon",
        "theme_options": [
            {
                "id": "urban-bay-neon",
                "name": "城市海湾夜行",
                "reason": "Dense city route.",
                "palette": {
                    "background": "#F6F4EE",
                    "surface": "#FFFFFF",
                    "ink": "#171A1F",
                    "muted": "#67717D",
                    "accent": "#0E7C86",
                    "accent2": "#D34F2F",
                    "line": "rgba(23,26,31,.14)",
                },
                "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
                "motifs": ["bay", "metro", "night-lights"],
            }
        ],
    }
    path.write_text(json.dumps(theme), encoding="utf-8")
    return path


def write_media_brief(path: Path, source_root: Path) -> Path:
    site_source = source_root / "site-hero.png"
    day_source = source_root / "day-1-hero.png"
    write_image(site_source)
    write_image(day_source)
    media = {
        "siteHero": {
            "confirmed": True,
            "selected_asset_id": "site-hero-01",
            "candidates": [
                {
                    "asset_id": "site-hero-01",
                    "remote_url": site_source.resolve().as_uri(),
                    "local_path": "assets/media/site-hero-01.png",
                    "source": "Local test fixture",
                    "credit": "Fixture image",
                    "usage_note": "Used for automated tests.",
                    "matched_query": "Osaka skyline",
                    "reason": "Matches whole-trip hero.",
                    "width": 1600,
                    "height": 1000,
                }
            ],
        },
        "dayHeroes": {
            "day-1": {
                "confirmed": True,
                "selected_asset_id": "day-1-hero-01",
                "candidates": [
                    {
                        "asset_id": "day-1-hero-01",
                        "remote_url": day_source.resolve().as_uri(),
                        "local_path": "assets/media/day-1-hero-01.png",
                        "source": "Local test fixture",
                        "credit": "Fixture image",
                        "usage_note": "Used for automated tests.",
                        "matched_query": "Dotonbori night",
                        "reason": "Matches day 1 city walking.",
                        "width": 1600,
                        "height": 1000,
                    }
                ],
            }
        },
    }
    path.write_text(json.dumps(media), encoding="utf-8")
    return path


def create_project(tmp: str) -> Path:
    tmp_path = Path(tmp)
    create = subprocess.run(
        [
            sys.executable,
            str(CREATE),
            "--trip-data",
            str(FIXTURE),
            "--theme-brief",
            str(write_theme_brief(tmp_path / "theme-brief.json")),
            "--media-brief",
            str(write_media_brief(tmp_path / "media-brief.json", tmp_path / "media-source")),
            "--output-root",
            tmp,
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if create.returncode != 0:
        raise AssertionError(create.stderr)
    return Path(create.stdout.strip())
```

- [ ] **Step 2: Update existing validation tests to use `create_project`**

Replace repeated create-site subprocess setup with:

```python
            project = create_project(tmp)
```

Keep the rest of each validation assertion intact.

- [ ] **Step 3: Add validator failure tests**

Append these tests to `ValidateSiteTest`:

```python
    def test_validate_missing_media_manifest_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            (project / "media-manifest.json").unlink()
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Missing media-manifest.json", result.stderr)

    def test_validate_missing_media_file_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            (project / "assets/media/site-hero-01.png").unlink()
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Referenced media file does not exist: assets/media/site-hero-01.png", result.stderr)

    def test_validate_media_outside_assets_media_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            data_file = project / "assets/js/trip-data.js"
            data_js = data_file.read_text(encoding="utf-8")
            data_js = data_js.replace("assets/media/site-hero-01.png", "assets/site-hero-01.png")
            data_file.write_text(data_js, encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Media path must be under assets/media/: assets/site-hero-01.png", result.stderr)

    def test_validate_manifest_missing_source_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            manifest_path = project / "media-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["assets"][0].pop("source")
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("media-manifest asset site-hero-01 missing source", result.stderr)

    def test_validate_rejects_banned_final_visual_tokens(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            css_path = project / "assets/css/travel.css"
            css_path.write_text(css_path.read_text(encoding="utf-8") + "\n#sakura-canvas { display:block; }\n", encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Final UI contains banned visual token: sakura-canvas", result.stderr)
```

- [ ] **Step 4: Run focused failing validation tests**

Run:

```bash
python3 -m unittest tests.test_validate_site -v
```

Expected: new tests fail because `validate_site.py` does not yet enforce media/theme rules.

- [ ] **Step 5: Update required generated files in `validate_site.py`**

In `validate_site.py`, update `required` to:

```python
    required = [
        "index.html",
        "vercel.json",
        "assets/css/travel.css",
        "assets/js/travel.js",
        "assets/js/trip-data.js",
        "trip-brief.json",
        "theme-brief.json",
        "media-brief.json",
        "media-manifest.json",
    ]
```

- [ ] **Step 6: Add JSON and media helper functions**

Add these functions after `extract_trip_data`:

```python
def load_json_file(path: Path, label: str, failures: list[str]) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(f"{label} is invalid JSON: {exc}")
        return {}
    if not isinstance(data, dict):
        failures.append(f"{label} must be a JSON object")
        return {}
    return data


def validate_media_path(project: Path, local_path: str, failures: list[str]) -> None:
    path = Path(str(local_path or ""))
    if path.is_absolute() or ".." in path.parts or path.parts[:2] != ("assets", "media"):
        failures.append(f"Media path must be under assets/media/: {local_path}")
        return
    if not (project / path).exists():
        failures.append(f"Referenced media file does not exist: {local_path}")


def iter_trip_media(data: dict):
    site_hero = data.get("media", {}).get("siteHero")
    if isinstance(site_hero, dict):
        yield site_hero
    day_heroes = data.get("media", {}).get("dayHeroes", {})
    if isinstance(day_heroes, dict):
        for asset in day_heroes.values():
            if isinstance(asset, dict):
                yield asset
```

- [ ] **Step 7: Add theme validation in `validate`**

After parsing `data`, add:

```python
    theme_brief = load_json_file(project / "theme-brief.json", "theme-brief.json", failures)
    media_manifest = load_json_file(project / "media-manifest.json", "media-manifest.json", failures)

    theme = data.get("theme")
    if not isinstance(theme, dict):
        failures.append("TRIP_SITE_DATA.theme must be an object")
    else:
        theme_id = theme.get("themeId")
        if not theme_id:
            failures.append("TRIP_SITE_DATA.theme.themeId is required")
        if theme_id and theme_brief:
            if theme_brief.get("confirmed_theme_id") != theme_id:
                failures.append("TRIP_SITE_DATA.theme.themeId must match theme-brief.json confirmed_theme_id")
        palette = theme.get("palette")
        if not isinstance(palette, dict):
            failures.append("TRIP_SITE_DATA.theme.palette must be an object")
        else:
            for key in ["background", "surface", "ink", "muted", "accent", "accent2", "line"]:
                if not palette.get(key):
                    failures.append(f"TRIP_SITE_DATA.theme.palette missing {key}")
```

- [ ] **Step 8: Add media validation in `validate`**

After the theme block, add:

```python
    manifest_assets = media_manifest.get("assets", []) if isinstance(media_manifest, dict) else []
    if not isinstance(manifest_assets, list) or not manifest_assets:
        failures.append("media-manifest.json must contain assets")
        manifest_by_id = {}
    else:
        manifest_by_id = {}
        for asset in manifest_assets:
            if not isinstance(asset, dict):
                failures.append("media-manifest assets must be objects")
                continue
            asset_id = asset.get("asset_id")
            if asset_id:
                manifest_by_id[asset_id] = asset
            for key in ["local_path", "source", "matched_query"]:
                if not asset.get(key):
                    failures.append(f"media-manifest asset {asset_id or '<missing>'} missing {key}")
            if not (asset.get("credit") or asset.get("usage_note")):
                failures.append(f"media-manifest asset {asset_id or '<missing>'} missing credit or usage_note")
            if asset.get("local_path"):
                validate_media_path(project, asset["local_path"], failures)

    media_assets = list(iter_trip_media(data))
    if not media_assets:
        failures.append("TRIP_SITE_DATA.media must reference at least one media asset")
    for asset in media_assets:
        asset_id = asset.get("assetId")
        local_path = asset.get("localPath")
        if not asset_id:
            failures.append("TRIP_SITE_DATA media asset missing assetId")
        if not local_path:
            failures.append(f"TRIP_SITE_DATA media asset {asset_id or '<missing>'} missing localPath")
            continue
        validate_media_path(project, local_path, failures)
        if asset_id and asset_id not in manifest_by_id:
            failures.append(f"TRIP_SITE_DATA media asset missing from manifest: {asset_id}")
```

- [ ] **Step 9: Add banned final visual token validation**

Before `return failures`, add:

```python
    banned_tokens = [
        "sakura-canvas",
        "kansai-bears",
        "ph-frame",
        "ph-jp",
        "ph-cn",
        "stylePreset",
        "関西",
    ]
    final_ui_text = "\n".join(
        [
            index,
            (project / "assets/css/travel.css").read_text(encoding="utf-8"),
            (project / "assets/js/travel.js").read_text(encoding="utf-8"),
            (project / "assets/js/trip-data.js").read_text(encoding="utf-8"),
        ]
    )
    for token in banned_tokens:
        if token in final_ui_text:
            failures.append(f"Final UI contains banned visual token: {token}")
```

- [ ] **Step 10: Run validator tests**

Run:

```bash
python3 -m unittest tests.test_validate_site -v
```

Expected: all validation tests pass.

- [ ] **Step 11: Checkpoint diff**

Run:

```bash
git diff -- skill/happy-trip-site/scripts/validate_site.py tests/test_validate_site.py
```

Expected: diff adds only theme/media validation and validation tests.

If committing is safe:

```bash
git add skill/happy-trip-site/scripts/validate_site.py tests/test_validate_site.py
git commit -m "feat: validate confirmed theme media output"
```

## Task 6: End-To-End Fixture And Full Test Pass

**Files:**
- Modify: `tests/test_create_site.py`
- Modify: `tests/test_validate_site.py`
- Modify: `README.md`
- Test: full repository tests and local generated output

- [ ] **Step 1: Keep Osaka/Nara trip fixture factual**

Do not add theme/media fields to `tests/fixtures/osaka-nara-trip-brief.json`. Trip Brief remains factual. Theme/media inputs are separate files generated by test helpers.

Verify:

```bash
python3 - <<'PY'
import json
from pathlib import Path
data = json.loads(Path("tests/fixtures/osaka-nara-trip-brief.json").read_text())
assert "style_preset" not in data or data["style_preset"] != "washi"
assert "theme" not in data
assert "media" not in data
print("fixture remains factual")
PY
```

Expected stdout:

```text
fixture remains factual
```

- [ ] **Step 2: Create local e2e input files for manual smoke**

Run:

```bash
rm -rf /tmp/happy-trip-site-theme-media-e2e
mkdir -p /tmp/happy-trip-site-theme-media-e2e/media-source
python3 - <<'PY'
import base64, json
from pathlib import Path
root = Path("/tmp/happy-trip-site-theme-media-e2e")
png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=")
for name in ["site-hero.png", "day-1-hero.png"]:
    path = root / "media-source" / name
    path.write_bytes(png)
theme = {
    "recommended_theme_id": "urban-bay-neon",
    "confirmed_theme_id": "urban-bay-neon",
    "theme_options": [{
        "id": "urban-bay-neon",
        "name": "城市海湾夜行",
        "reason": "Dense city route with food, transit, and night walking.",
        "palette": {
            "background": "#F6F4EE",
            "surface": "#FFFFFF",
            "ink": "#171A1F",
            "muted": "#67717D",
            "accent": "#0E7C86",
            "accent2": "#D34F2F",
            "line": "rgba(23,26,31,.14)"
        },
        "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
        "motifs": ["bay", "metro", "night-lights"]
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
            "reason": "Matches whole-trip hero.",
            "width": 1600,
            "height": 1000
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
                "reason": "Matches day 1 city walking.",
                "width": 1600,
                "height": 1000
            }]
        }
    }
}
(root / "theme-brief.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
(root / "media-brief.json").write_text(json.dumps(media, ensure_ascii=False, indent=2) + "\n")
print(root)
PY
```

Expected stdout includes:

```text
/tmp/happy-trip-site-theme-media-e2e
```

- [ ] **Step 3: Run local generation and validation smoke**

Run:

```bash
python3 skill/happy-trip-site/scripts/create_site.py \
  --trip-data tests/fixtures/osaka-nara-trip-brief.json \
  --theme-brief /tmp/happy-trip-site-theme-media-e2e/theme-brief.json \
  --media-brief /tmp/happy-trip-site-theme-media-e2e/media-brief.json \
  --output-root /tmp/happy-trip-site-theme-media-e2e
python3 skill/happy-trip-site/scripts/validate_site.py \
  /tmp/happy-trip-site-theme-media-e2e/osaka-nara-three-day-travel-site
```

Expected stdout includes:

```text
validation passed
```

- [ ] **Step 4: Inspect generated media and data**

Run:

```bash
python3 - <<'PY'
import json, re
from pathlib import Path
project = Path("/tmp/happy-trip-site-theme-media-e2e/osaka-nara-three-day-travel-site")
assert (project / "assets/media/site-hero-01.png").exists()
assert (project / "assets/media/day-1-hero-01.png").exists()
data_js = (project / "assets/js/trip-data.js").read_text()
data = json.loads(re.search(r"window\.TRIP_SITE_DATA\s*=\s*(\{.*\})\s*;\s*$", data_js, re.S).group(1))
assert data["theme"]["themeId"] == "urban-bay-neon"
assert data["media"]["siteHero"]["localPath"] == "assets/media/site-hero-01.png"
assert data["media"]["dayHeroes"]["day-1"]["localPath"] == "assets/media/day-1-hero-01.png"
print("generated theme and media verified")
PY
```

Expected stdout:

```text
generated theme and media verified
```

- [ ] **Step 5: Run full tests**

Run:

```bash
python3 -m unittest discover -s tests -v
```

Expected: all tests pass.

- [ ] **Step 6: Validate skill package**

Run:

```bash
python3 /Users/owenlee/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /Users/owenlee/Desktop/happy-trip-site/skill/happy-trip-site
```

Expected: command exits with status 0. If it prints warnings about wording only, record them in the final handoff; if it fails, fix the exact reported file and rerun.

- [ ] **Step 7: Checkpoint final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files listed in this implementation plan should have implementation-relevant changes. Existing unrelated dirty files from before the implementation must not be reverted.

If committing is safe:

```bash
git add README.md \
  skill/happy-trip-site/SKILL.md \
  skill/happy-trip-site/references/itinerary-schema.md \
  skill/happy-trip-site/references/extraction-rules.md \
  skill/happy-trip-site/scripts/create_site.py \
  skill/happy-trip-site/scripts/validate_site.py \
  skill/happy-trip-site/assets/static-template/index.html \
  skill/happy-trip-site/assets/static-template/assets/css/travel.css \
  skill/happy-trip-site/assets/static-template/assets/js/travel.js \
  tests/test_create_site.py \
  tests/test_skill_contract.py \
  tests/test_validate_site.py
git commit -m "feat: require confirmed themes and media for trip sites"
```

## Self-Review Checklist

Spec coverage:

- Theme options and `confirmed_theme_id`: Task 1 documents it, Task 2 tests it, Task 3 implements it, Task 5 validates it.
- Media candidates and `selected_asset_id`: Task 1 documents it, Task 2 tests it, Task 3 implements it, Task 5 validates it.
- Download confirmed images into `assets/media/`: Task 2 tests it, Task 3 implements it, Task 6 verifies it.
- Write `theme-brief.json`, `media-brief.json`, and `media-manifest.json`: Task 2 tests it, Task 3 implements it, Task 5 validates it.
- Preserve mobile UX skeleton and external link contract: Tasks 4 and 5 keep route overview, sidebar, checklist, and link validation.
- Remove old visual defaults and final fallback cards: Task 4 removes template tokens, Task 5 validates banned final visual tokens.
- Local validation before completion: Task 6 runs `validate_site.py` and full tests.

Type consistency:

- Python Theme Brief uses `confirmed_theme_id`; JS receives `theme.themeId`.
- Python Media Brief uses `asset_id` and `local_path`; JS receives `assetId` and `localPath`.
- Manifest uses snake_case because it is an output JSON artifact for validators and attribution.
- Day media keys use `day-N`, where `N` is the day object's `n` field.

Known execution risk:

- The repo currently has dirty files in the same paths this plan modifies. The implementer must inspect file diffs before staging or committing. Do not revert existing changes unless the user explicitly asks.
