from pathlib import Path
import base64
import json
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CREATE = ROOT / "skill" / "happy-trip-site" / "scripts" / "create_site.py"
DEPLOY = ROOT / "skill" / "happy-trip-site" / "scripts" / "deploy_vercel.py"
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
                    }
                ],
            }
        },
    }
    path.write_text(json.dumps(media), encoding="utf-8")
    return path


class DeployVercelTest(unittest.TestCase):
    def test_dry_run_writes_expected_commands(self):
        with tempfile.TemporaryDirectory() as tmp:
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
            self.assertEqual(create.returncode, 0, create.stderr)
            project = Path(create.stdout.strip())
            result = subprocess.run(
                [sys.executable, str(DEPLOY), str(project), "--dry-run"],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads((project / "deployment-result.json").read_text(encoding="utf-8"))
            self.assertTrue(data["dry_run"])
            self.assertIn("vercel --version", data["commands"])
            self.assertIn("vercel deploy --prod --yes", data["commands"])


if __name__ == "__main__":
    unittest.main()
