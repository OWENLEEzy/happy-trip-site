from pathlib import Path
import base64
import json
import re
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skill" / "happy-trip-site" / "scripts" / "create_site.py"
FIXTURE = ROOT / "tests" / "fixtures" / "osaka-nara-trip-brief.json"


def extract_trip_data(data_js):
    match = re.search(r"window\.TRIP_SITE_DATA\s*=\s*(\{.*\})\s*;\s*$", data_js, re.S)
    if not match:
        raise AssertionError("trip-data.js did not contain window.TRIP_SITE_DATA")
    return json.loads(match.group(1))


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
    site_url = (source_root / "missing-site-hero.png").resolve().as_uri() if bad_url else site_source.resolve().as_uri()
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


def run_create(
    output_root: Path,
    trip_data: Path = FIXTURE,
    theme_confirmed: bool = True,
    media_confirmed: bool = True,
    bad_media_url: bool = False,
):
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


class CreateSiteTest(unittest.TestCase):
    def test_create_site_writes_self_contained_static_project(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = run_create(Path(tmp))
            self.assertEqual(result.returncode, 0, result.stderr)
            project = Path(tmp) / "osaka-nara-three-day-travel-site"
            self.assertTrue((project / "index.html").exists())
            self.assertTrue((project / "vercel.json").exists())
            self.assertTrue((project / "assets/js/travel.js").exists())
            self.assertTrue((project / "assets/js/trip-data.js").exists())
            self.assertTrue((project / "trip-brief.json").exists())
            self.assertTrue((project / "theme-brief.json").exists())
            self.assertTrue((project / "media-brief.json").exists())
            self.assertTrue((project / "media-manifest.json").exists())
            self.assertTrue((project / "assets/media/site-hero-01.png").exists())
            self.assertTrue((project / "assets/media/day-1-hero-01.png").exists())
            self.assertFalse((project / "assets/icons/kansai-bears.svg").exists())
            self.assertFalse((project / "assets/audio/bgm.mp3").exists())
            self.assertFalse((project / "assets/js/trip-data.template.js").exists())
            data_js = (project / "assets/js/trip-data.js").read_text(encoding="utf-8")
            index = (project / "index.html").read_text(encoding="utf-8")
            css = (project / "assets/css/travel.css").read_text(encoding="utf-8")
            js = (project / "assets/js/travel.js").read_text(encoding="utf-8")
            self.assertNotIn("sakura-canvas", index + js + css)
            self.assertNotIn("kansai-bears", index + js + css)
            self.assertNotIn("ph-frame", js + css)
            self.assertNotIn('"heroImg"', data_js)
            self.assertIn("theme-badge", index + css)
            self.assertIn("site-hero-media", js + css)
            self.assertIn("window.TRIP_SITE_DATA", data_js)
            self.assertIn("Osaka Nara Three Day Trip", data_js)
            data = extract_trip_data(data_js)
            self.assertEqual(data["theme"]["themeId"], "urban-bay-neon")
            self.assertEqual(data["theme"]["palette"]["accent"], "#0E7C86")
            self.assertEqual(data["media"]["siteHero"]["localPath"], "assets/media/site-hero-01.png")
            self.assertEqual(data["media"]["dayHeroes"]["day-1"]["localPath"], "assets/media/day-1-hero-01.png")
            manifest = json.loads((project / "media-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(len(manifest["assets"]), 2)
            self.assertEqual(manifest["assets"][0]["source"], "Local test fixture")
            for day in data["days"]:
                self.assertTrue(day["routeOverview"]["stops"])
                for bucket in ["morning", "afternoon", "evening"]:
                    for item in day.get(bucket, []):
                        self.assertTrue(item["links"])
            brief = json.loads((project / "trip-brief.json").read_text(encoding="utf-8"))
            self.assertEqual(brief["trip_slug"], "osaka-nara-three-day")

    def test_create_site_infers_route_overview_for_mobile_map_link(self):
        with tempfile.TemporaryDirectory() as tmp:
            brief = {
                "trip_title": "Mobile Link Trip",
                "days": [
                    {
                        "n": 1,
                        "date": "Day 1",
                        "city": "Kyoto",
                        "cityJp": "Kyoto",
                        "title": "One tap Kyoto",
                        "themeJp": "リンク旅",
                        "morning": [
                            {
                                "time": "上午",
                                "tag": "temple",
                                "tagText": "景点",
                                "title": "Fushimi Inari Taisha",
                                "links": []
                            }
                        ],
                        "afternoon": [],
                        "evening": []
                    }
                ]
            }
            source = Path(tmp) / "brief.json"
            source.write_text(json.dumps(brief), encoding="utf-8")
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
            self.assertEqual(result.returncode, 0, result.stderr)
            data_js = (Path(result.stdout.strip()) / "assets/js/trip-data.js").read_text(encoding="utf-8")
            data = extract_trip_data(data_js)
            day = data["days"][0]
            self.assertEqual(day["routeOverview"]["stops"][0]["query"], "Fushimi Inari Taisha")
            self.assertTrue(day["morning"][0]["links"][0]["url"].startswith("https://maps.google.com/?q="))

    def test_create_site_fills_route_stop_query_from_label(self):
        with tempfile.TemporaryDirectory() as tmp:
            brief = {
                "trip_title": "Route Stop Query Trip",
                "days": [
                    {
                        "n": 1,
                        "date": "Day 1",
                        "city": "Osaka",
                        "cityJp": "Osaka",
                        "title": "Route stop fallback",
                        "themeJp": "地図",
                        "routeOverview": {
                            "title": "Today route",
                            "mode": "walking",
                            "stops": [{"label": "Namba Parks"}]
                        },
                        "morning": [{"title": "Namba Parks", "links": []}],
                        "afternoon": [],
                        "evening": []
                    }
                ]
            }
            source = Path(tmp) / "brief.json"
            source.write_text(json.dumps(brief), encoding="utf-8")
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
            self.assertEqual(result.returncode, 0, result.stderr)
            data_js = (Path(result.stdout.strip()) / "assets/js/trip-data.js").read_text(encoding="utf-8")
            data = extract_trip_data(data_js)
            self.assertEqual(data["days"][0]["routeOverview"]["stops"][0]["query"], "Namba Parks")

    def test_create_site_refuses_existing_folder_without_force(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = Path(tmp) / "osaka-nara-three-day-travel-site"
            project.mkdir()
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--trip-data",
                    str(FIXTURE),
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
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("already exists", result.stderr)

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


if __name__ == "__main__":
    unittest.main()
