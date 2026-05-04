#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote_plus
from urllib.request import urlopen


SKILL_ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = SKILL_ROOT / "assets" / "static-template"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "trip"


def maps_url(query: str) -> str:
    return "https://maps.google.com/?q=" + quote_plus(query)


def item_query(item: dict, day: dict) -> str:
    return str(item.get("title") or item.get("jp") or day.get("city") or "").strip()


def add_missing_maps_links(day: dict) -> None:
    for bucket in ["morning", "afternoon", "evening"]:
        items = day.get(bucket)
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            links = item.get("links")
            if isinstance(links, list) and links:
                continue
            query = item_query(item, day)
            if not query:
                continue
            item["links"] = [
                {
                    "type": "maps",
                    "label": "Google Maps",
                    "url": maps_url(query),
                }
            ]


def iter_day_items(day: dict):
    for bucket in ["morning", "afternoon", "evening"]:
        items = day.get(bucket)
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, dict):
                yield item


def ensure_route_overview(day: dict) -> None:
    route = day.get("routeOverview")
    if isinstance(route, dict) and isinstance(route.get("stops"), list) and route["stops"]:
        for stop in route["stops"]:
            if not isinstance(stop, dict):
                continue
            if not stop.get("query") and stop.get("label"):
                stop["query"] = str(stop["label"]).strip()
            if not stop.get("label") and stop.get("query"):
                stop["label"] = str(stop["query"]).strip()
        return

    stops = []
    seen = set()
    for item in iter_day_items(day):
        query = item_query(item, day)
        if not query:
            continue
        key = query.casefold()
        if key in seen:
            continue
        seen.add(key)
        stops.append({"label": str(item.get("title") or query), "query": query, "inferred": True})

    if not stops and day.get("city"):
        city = str(day["city"]).strip()
        stops.append({"label": city, "query": city, "inferred": True})

    if stops:
        day["routeOverview"] = {
            "title": day.get("route_title") or "今日动线总览",
            "mode": day.get("route_mode") or "transit",
            "zoom": day.get("route_zoom") or 11,
            "stops": stops,
        }


def load_trip_brief(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("Trip brief must be a JSON object.")
    days = data.get("days")
    if not isinstance(days, list) or not days:
        raise ValueError("Trip brief must contain at least one day.")
    if not data.get("trip_title"):
        raise ValueError("Trip brief must contain trip_title.")
    if not data.get("trip_slug"):
        data["trip_slug"] = slugify(str(data["trip_title"]))
    data["trip_slug"] = slugify(str(data["trip_slug"]))
    data.pop("style_preset", None)
    for day in days:
        if isinstance(day, dict):
            day.pop("heroImg", None)
            add_missing_maps_links(day)
            ensure_route_overview(day)
    return data


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
        selected = dict(candidate)
        selected["local_path"] = ensure_media_local_path(selected.get("local_path", ""), selected_asset_id)
        return selected
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


def ensure_template() -> None:
    required = [
        TEMPLATE_ROOT / "index.html",
        TEMPLATE_ROOT / "vercel.json",
        TEMPLATE_ROOT / "assets/css/travel.css",
        TEMPLATE_ROOT / "assets/js/travel.js",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing template files: " + ", ".join(missing))


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


def create_site(trip_data: Path, theme_brief: Path, media_brief: Path, output_root: Path, force: bool) -> Path:
    ensure_template()
    brief = load_trip_brief(trip_data)
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create a Happy Trip Site static project.")
    parser.add_argument("--trip-data", required=True, type=Path)
    parser.add_argument("--theme-brief", required=False, type=Path)
    parser.add_argument("--media-brief", required=False, type=Path)
    parser.add_argument("--output-root", default=Path.home() / "Desktop", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args(argv)
    try:
        if args.theme_brief is None:
            raise ValueError("--theme-brief is required")
        if args.media_brief is None:
            raise ValueError("--media-brief is required")
        project = create_site(args.trip_data, args.theme_brief, args.media_brief, args.output_root, args.force)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(project)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
