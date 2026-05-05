from pathlib import Path
import base64
import json
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CREATE = ROOT / "skill" / "happy-trip-site" / "scripts" / "create_site.py"
VALIDATE = ROOT / "skill" / "happy-trip-site" / "scripts" / "validate_site.py"
FIXTURE = ROOT / "tests" / "fixtures" / "osaka-nara-trip-brief.json"


PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


def write_image(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(PNG_BYTES)


def write_ui_brief(path: Path) -> Path:
    ui = {
        "recommended_option_id": "urban-bay-neon",
        "confirmed_option_id": "urban-bay-neon",
        "ui_options": [
            {
                "id": "urban-bay-neon",
                "name": "城市海湾夜行",
                "reason": "Dense city route.",
                "layout_profile": "bay-garden-evening",
                "palette": {
                    "background": "#DFF7F2",
                    "surface": "#FFFDF5",
                    "ink": "#102A2B",
                    "muted": "#557174",
                    "accent": "#006D77",
                    "accent2": "#FFB000",
                    "line": "rgba(16,42,43,.16)",
                },
                "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
                "density": "spacious",
                "navigation": "topbar-drawer",
                "hero_treatment": "full-bleed-photo",
                "card_treatment": "timeline-cards",
                "link_treatment": "pill-cluster",
                "map_treatment": "embed-with-stop-chips",
                "motion_level": "subtle",
                "motifs": ["bay", "metro", "night-lights"],
            },
            {
                "id": "street-blocks",
                "name": "街区色块",
                "reason": "Color-block neighborhood direction.",
                "layout_profile": "peranakan-tropical-blocks",
                "palette": {
                    "background": "#FFF8F0",
                    "surface": "#FFFFFF",
                    "ink": "#1E1B18",
                    "muted": "#766A5D",
                    "accent": "#008B8B",
                    "accent2": "#F06C4F",
                    "line": "rgba(30,27,24,.16)",
                },
                "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
                "density": "standard",
                "navigation": "topbar-drawer",
                "hero_treatment": "split-photo-panel",
                "card_treatment": "block-cards",
                "link_treatment": "pill-cluster",
                "map_treatment": "stop-chips-first",
                "motion_level": "expressive",
                "motifs": ["blocks", "street-color", "local-food"],
            },
            {
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
                    "line": "rgba(24,32,36,.14)",
                },
                "typography": {"sans": "system-ui", "serif": "serif", "display": "system-ui"},
                "density": "compact",
                "navigation": "bottom-day-tabs",
                "hero_treatment": "command-board",
                "card_treatment": "checklist-rows",
                "link_treatment": "route-first-toolbar",
                "map_treatment": "route-panel-first",
                "motion_level": "none",
                "motifs": ["metro", "food", "checklist"],
            }
        ],
    }
    path.write_text(json.dumps(ui), encoding="utf-8")
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
            "--ui-brief",
            str(write_ui_brief(tmp_path / "ui-brief.json")),
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


class ValidateSiteTest(unittest.TestCase):
    def test_validate_generated_site_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("validation passed", result.stdout)

    def test_validate_missing_trip_data_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            (project / "assets/js/trip-data.js").unlink()
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("assets/js/trip-data.js", result.stderr)

    def test_validate_requires_mobile_link_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            data_file = project / "assets/js/trip-data.js"
            data_file.write_text(
                "window.TRIP_SITE_DATA = {\n"
                '  "days": [{\n'
                '    "n": 1,\n'
                '    "morning": [{"title": "No link", "links": []}],\n'
                '    "afternoon": [],\n'
                '    "evening": []\n'
                "  }]\n"
                "};\n",
                encoding="utf-8",
            )
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("without links", result.stderr)
            self.assertIn("without routeOverview", result.stderr)

    def test_validate_requires_ui_brief_consistency(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            ui_path = project / "ui-brief.json"
            ui = json.loads(ui_path.read_text(encoding="utf-8"))
            ui["ui_options"][0]["navigation"] = "bottom-day-tabs"
            ui_path.write_text(json.dumps(ui), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("TRIP_SITE_DATA.ui.confirmed_option must match ui-brief.json confirmed option", result.stderr)

    def test_validate_rejects_reserved_default_ui_palette(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            ui_path = project / "ui-brief.json"
            ui = json.loads(ui_path.read_text(encoding="utf-8"))
            ui["ui_options"][0]["palette"] = {
                "background": "#F6F4EE",
                "surface": "#FFFFFF",
                "ink": "#171A1F",
                "muted": "#67717D",
                "accent": "#0E7C86",
                "accent2": "#D34F2F",
                "line": "rgba(23,26,31,.14)",
            }
            ui_path.write_text(json.dumps(ui), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("reserved default palette", result.stderr)

    def test_validate_rejects_ui_options_without_distinct_layouts(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            ui_path = project / "ui-brief.json"
            ui = json.loads(ui_path.read_text(encoding="utf-8"))
            ui["ui_options"][1]["layout_profile"] = "bay-garden-evening"
            ui_path.write_text(json.dumps(ui), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("3 distinct layout_profile", result.stderr)

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
            css_path.write_text(
                css_path.read_text(encoding="utf-8") + "\n#sakura-canvas { display:block; }\n",
                encoding="utf-8",
            )
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Final UI contains banned visual token: sakura-canvas", result.stderr)


if __name__ == "__main__":
    unittest.main()
