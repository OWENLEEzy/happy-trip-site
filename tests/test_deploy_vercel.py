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
