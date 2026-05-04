#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def extract_trip_data(data_js: str) -> dict:
    match = re.search(r"window\.TRIP_SITE_DATA\s*=\s*(\{.*\})\s*;\s*$", data_js, re.S)
    if not match:
        raise ValueError("assets/js/trip-data.js must assign window.TRIP_SITE_DATA.")
    return json.loads(match.group(1))


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


def validate(project: Path) -> list[str]:
    failures: list[str] = []
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
    for rel in required:
        if not (project / rel).exists():
            failures.append(f"Missing {rel}")
    if failures:
        return failures

    index = (project / "index.html").read_text(encoding="utf-8")
    if 'name="viewport"' not in index:
        failures.append("index.html missing mobile viewport meta")
    for rel in ["./assets/css/travel.css", "./assets/js/trip-data.js", "./assets/js/travel.js"]:
        if rel not in index:
            failures.append(f"index.html missing reference {rel}")

    try:
        vercel = json.loads((project / "vercel.json").read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(f"vercel.json is invalid JSON: {exc}")
        vercel = {}
    rewrites = vercel.get("rewrites", [])
    if not any(item.get("source") == "/" and item.get("destination") == "/index.html" for item in rewrites):
        failures.append("vercel.json must rewrite / to /index.html")

    try:
        data = extract_trip_data((project / "assets/js/trip-data.js").read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(str(exc))
        return failures

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

    days = data.get("days")
    if not isinstance(days, list) or not days:
        failures.append("TRIP_SITE_DATA.days must contain at least one day")
    else:
        has_item = False
        missing_links = 0
        invalid_links = 0
        missing_routes = 0
        missing_route_stops = 0
        invalid_route_stops = 0
        for day in days:
            if not isinstance(day, dict):
                failures.append("TRIP_SITE_DATA.days entries must be objects")
                continue
            route = day.get("routeOverview")
            if not isinstance(route, dict):
                missing_routes += 1
            else:
                stops = route.get("stops")
                if not isinstance(stops, list) or not stops:
                    missing_route_stops += 1
                else:
                    for stop in stops:
                        if not isinstance(stop, dict) or not stop.get("query") or not stop.get("label"):
                            invalid_route_stops += 1
            for key in ["morning", "afternoon", "evening"]:
                items = day.get(key)
                if not isinstance(items, list):
                    continue
                if items:
                    has_item = True
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    links = item.get("links")
                    if not isinstance(links, list) or not links:
                        missing_links += 1
                        continue
                    for link in links:
                        if not isinstance(link, dict) or not str(link.get("url", "")).startswith(("http://", "https://")):
                            invalid_links += 1
        if not has_item:
            failures.append("TRIP_SITE_DATA must contain at least one itinerary item")
        if missing_links:
            failures.append(f"TRIP_SITE_DATA contains {missing_links} itinerary item(s) without links")
        if invalid_links:
            failures.append(f"TRIP_SITE_DATA contains {invalid_links} invalid external link(s)")
        if missing_routes:
            failures.append(f"TRIP_SITE_DATA contains {missing_routes} day(s) without routeOverview")
        if missing_route_stops:
            failures.append(f"TRIP_SITE_DATA contains {missing_route_stops} routeOverview object(s) without stops")
        if invalid_route_stops:
            failures.append(f"TRIP_SITE_DATA contains {invalid_route_stops} invalid route stop(s)")

    banned_tokens = [
        "sakura-canvas",
        "kansai-bears",
        "ph-frame",
        "ph-jp",
        "ph-cn",
        "stylePreset",
        "関西",
        "heroImg",
        "bgMusic",
        "music-toggle",
        "day3Route",
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

    return failures


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a generated Happy Trip Site project.")
    parser.add_argument("project", type=Path)
    args = parser.parse_args(argv)
    project = args.project.expanduser().resolve()
    failures = validate(project)
    result_path = project / "validation-result.json"
    result_path.write_text(
        json.dumps({"ok": not failures, "failures": failures}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        return 1
    print("validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
