from pathlib import Path
import base64
import json
import re
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


def extract_trip_data(data_js: str) -> dict:
    match = re.search(r"window\.HAPPY_TRIP_DATA\s*=\s*(\{.*\})\s*;\s*$", data_js, re.S)
    if not match:
        raise AssertionError("travel-data.js did not contain window.HAPPY_TRIP_DATA")
    return json.loads(match.group(1))


def write_trip_data(path: Path, data: dict) -> None:
    path.write_text(
        "window.HAPPY_TRIP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


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
    media = {
        "siteHero": {
            "url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
            "source_name": "Unsplash",
            "source_url": "https://unsplash.com/",
            "alt": "Osaka skyline at dusk",
            "query": "Osaka skyline",
            "reason": "Matches whole-trip hero.",
            "width": 1600,
            "height": 1000,
        },
        "dayHeroes": {
            "day-1": {
                "url": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9",
                "source_name": "Unsplash",
                "source_url": "https://unsplash.com/",
                "alt": "Dotonbori street lights at night",
                "query": "Dotonbori night",
                "reason": "Matches day 1 city walking.",
                "width": 1600,
                "height": 1000,
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
            (project / "assets/js/travel-data.js").unlink()
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("assets/js/travel-data.js", result.stderr)

    def test_validate_requires_mobile_link_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            data_file = project / "assets/js/travel-data.js"
            data_file.write_text(
                "window.HAPPY_TRIP_DATA = {\n"
                '  "meta": {"tripTitle": "Broken", "tripSlug": "broken", "language": "zh-CN"},\n'
                '  "ui": {},\n'
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
            self.assertIn("HAPPY_TRIP_DATA.ui.confirmed_option must match ui-brief.json confirmed option", result.stderr)

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
            data_file = project / "assets/js/travel-data.js"
            data = extract_trip_data(data_file.read_text(encoding="utf-8"))
            data["meta"]["hero"].pop("url", None)
            data["meta"]["hero"].pop("src", None)
            data["meta"]["hero"]["local_path"] = "assets/media/site-hero-01.png"
            write_trip_data(data_file, data)
            manifest_path = project / "media-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["assets"][0].pop("url", None)
            manifest["assets"][0]["local_path"] = "assets/media/site-hero-01.png"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
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
            data_file = project / "assets/js/travel-data.js"
            data = extract_trip_data(data_file.read_text(encoding="utf-8"))
            data["meta"]["hero"].pop("url", None)
            data["meta"]["hero"].pop("src", None)
            data["meta"]["hero"]["local_path"] = "assets/site-hero-01.png"
            write_trip_data(data_file, data)
            manifest_path = project / "media-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["assets"][0].pop("url", None)
            manifest["assets"][0]["local_path"] = "assets/site-hero-01.png"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
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
            manifest["assets"][0].pop("source_name")
            manifest["assets"][0].pop("source_url")
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("media-manifest asset site-hero missing source_name or source_url", result.stderr)

    def test_validate_manifest_url_must_match_trip_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = create_project(tmp)
            manifest_path = project / "media-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["assets"][0]["url"] = "https://example.com/different.jpg"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(VALIDATE), str(project)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("url must match media-manifest.json", result.stderr)

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
