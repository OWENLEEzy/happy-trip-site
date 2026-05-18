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
from urllib.request import Request, urlopen


SKILL_ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = SKILL_ROOT / "assets" / "static-template"
MEDIA_REQUEST_HEADERS = {
    "User-Agent": "HappyTripSite/1.0 (+https://github.com/openai/codex)",
}
SUPPORTED_LAYOUT_PROFILES = {
    "bay-garden-evening",
    "peranakan-tropical-blocks",
    "metro-food-clean",
}
REQUIRED_UI_OPTION_FIELDS = [
    "layout_profile",
    "palette",
    "typography",
    "density",
    "navigation",
    "hero_treatment",
    "card_treatment",
    "link_treatment",
    "map_treatment",
    "motion_level",
    "motifs",
]
REQUIRED_PALETTE_FIELDS = ["background", "surface", "ink", "muted", "accent", "accent2", "line"]
DISTINCT_UI_TREATMENT_FIELDS = [
    "layout_profile",
    "density",
    "navigation",
    "hero_treatment",
    "card_treatment",
    "link_treatment",
    "map_treatment",
    "motion_level",
]
RESERVED_DEFAULT_PALETTES = {
    "template-neutral-fallback": {
        "background": "#f2f2ef",
        "surface": "#ffffff",
        "ink": "#202426",
        "muted": "#6a7072",
        "accent": "#66737a",
        "accent2": "#a27454",
        "line": "rgba(32,36,38,.14)",
    },
    "legacy-template-fallback": {
        "background": "#f6f4ee",
        "surface": "#ffffff",
        "ink": "#171a1f",
        "muted": "#67717d",
        "accent": "#0e7c86",
        "accent2": "#d34f2f",
        "line": "rgba(23,26,31,.14)",
    },
    "legacy-demo-fallback": {
        "background": "#f7f5ef",
        "surface": "#ffffff",
        "ink": "#17201d",
        "muted": "#63706a",
        "accent": "#007a78",
        "accent2": "#e05a3f",
        "line": "rgba(23,32,29,.14)",
    },
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "trip"


def maps_url(query: str) -> str:
    return "https://maps.google.com/?q=" + quote_plus(query)


def item_query(item: dict, day: dict) -> str:
    return str(item.get("title") or item.get("subtitle") or item.get("jp") or day.get("city") or "").strip()


def normalize_item_fields(item: dict) -> None:
    if not item.get("subtitle") and item.get("jp"):
        item["subtitle"] = item["jp"]
    item.pop("jp", None)


def normalize_day_fields(day: dict) -> None:
    if not day.get("areaLabel") and day.get("cityJp"):
        day["areaLabel"] = day["cityJp"]
    if not day.get("themeLabel") and day.get("themeJp"):
        day["themeLabel"] = day["themeJp"]
    day.pop("cityJp", None)
    day.pop("themeJp", None)
    day.pop("heroImg", None)
    for item in iter_day_items(day):
        normalize_item_fields(item)
    bind_map_stop_labels(day)


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
        bind_map_stop_labels(day)
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
    bind_map_stop_labels(day)


def route_stop_labels(day: dict) -> set[str]:
    labels: set[str] = set()
    route = day.get("routeOverview")
    if not isinstance(route, dict):
        return labels
    routes = []
    if isinstance(route.get("stops"), list):
        routes.append(route)
    if isinstance(route.get("sections"), list):
        routes.extend(section for section in route["sections"] if isinstance(section, dict))
    for route_like in routes:
        for stop in route_like.get("stops", []):
            if isinstance(stop, dict) and stop.get("label"):
                labels.add(str(stop["label"]))
    return labels


def bind_map_stop_labels(day: dict) -> None:
    labels = route_stop_labels(day)
    if not labels:
        return
    normalized = {label.casefold(): label for label in labels}
    for item in iter_day_items(day):
        existing = item.get("mapStopLabels")
        if isinstance(existing, list) and existing:
            continue
        candidates = [str(item.get("title") or ""), str(item.get("subtitle") or "")]
        item_links = item.get("links", [])
        if isinstance(item_links, list):
            candidates.extend(str(link.get("label") or "") for link in item_links if isinstance(link, dict))
        matched = []
        joined = " ".join(candidates).casefold()
        for key, label in normalized.items():
            if key and key in joined:
                matched.append(label)
        if matched:
            item["mapStopLabels"] = matched


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
            normalize_day_fields(day)
            add_missing_maps_links(day)
            ensure_route_overview(day)
    return data


def load_json_object(path: Path, label: str) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{label} must be a JSON object.")
    return data


def normalize_ui_brief(raw: dict) -> dict:
    if "ui_options" in raw or "confirmed_option_id" in raw:
        return raw
    # Backward-compatible alias for older Theme Brief files. The normalized
    # contract is still UI Brief; callers must supply full UI option fields.
    return {
        "recommended_option_id": raw.get("recommended_option_id") or raw.get("recommended_theme_id"),
        "confirmed_option_id": raw.get("confirmed_option_id") or raw.get("confirmed_theme_id"),
        "ui_options": raw.get("ui_options") or raw.get("theme_options"),
    }


def normalize_token(value: object) -> str:
    return re.sub(r"\s+", "", str(value or "").strip().lower())


def palette_signature(palette: dict) -> tuple[str, ...]:
    return tuple(normalize_token(palette.get(key)) for key in REQUIRED_PALETTE_FIELDS)


def reserved_default_palette_name(palette: dict) -> str:
    signature = palette_signature(palette)
    for name, reserved_palette in RESERVED_DEFAULT_PALETTES.items():
        if signature == palette_signature(reserved_palette):
            return name
    return ""


def ui_treatment_signature(option: dict) -> tuple[str, ...]:
    return tuple(normalize_token(option.get(field)) for field in DISTINCT_UI_TREATMENT_FIELDS)


def validate_ui_option(option: dict, option_id: str) -> None:
    missing_fields = [field for field in REQUIRED_UI_OPTION_FIELDS if field not in option]
    if missing_fields:
        raise ValueError(f"UI option {option_id} missing: " + ", ".join(missing_fields))
    layout_profile = str(option.get("layout_profile") or "").strip()
    if layout_profile not in SUPPORTED_LAYOUT_PROFILES:
        raise ValueError(f"Unsupported layout_profile: {layout_profile}")
    palette = option.get("palette")
    if not isinstance(palette, dict):
        raise ValueError(f"UI option {option_id} must contain palette.")
    missing_palette = [key for key in REQUIRED_PALETTE_FIELDS if not palette.get(key)]
    if missing_palette:
        raise ValueError(f"UI option {option_id} palette missing: " + ", ".join(missing_palette))
    reserved_palette = reserved_default_palette_name(palette)
    if reserved_palette:
        raise ValueError(
            f"UI option {option_id} palette matches reserved default palette "
            f"{reserved_palette}; choose destination-specific colors."
        )
    typography = option.get("typography")
    if not isinstance(typography, dict) or not typography:
        raise ValueError(f"UI option {option_id} must contain typography.")
    motifs = option.get("motifs")
    if not isinstance(motifs, list) or not motifs:
        raise ValueError(f"UI option {option_id} must contain motifs.")
    for field in ["density", "navigation", "hero_treatment", "card_treatment", "link_treatment", "map_treatment", "motion_level"]:
        if not str(option.get(field) or "").strip():
            raise ValueError(f"UI option {option_id} must contain {field}.")


def validate_ui_options_set(options: list[dict]) -> None:
    ids = [str(option.get("id") or "").strip() for option in options if isinstance(option, dict)]
    duplicate_ids = sorted({option_id for option_id in ids if ids.count(option_id) > 1})
    if duplicate_ids:
        raise ValueError("UI Brief options must have unique ids: " + ", ".join(duplicate_ids))
    if len(options) < 3:
        return
    layout_profiles = {str(option.get("layout_profile") or "").strip() for option in options if isinstance(option, dict)}
    if len(layout_profiles) < 3:
        raise ValueError("UI Brief options must include at least 3 distinct layout_profile values.")
    palette_signatures = {
        palette_signature(option.get("palette", {}))
        for option in options
        if isinstance(option, dict) and isinstance(option.get("palette"), dict)
    }
    if len(palette_signatures) < 3:
        raise ValueError("UI Brief options must include at least 3 distinct palette choices.")
    treatment_signatures = {ui_treatment_signature(option) for option in options if isinstance(option, dict)}
    if len(treatment_signatures) < 3:
        raise ValueError("UI Brief options must include at least 3 distinct UI treatment combinations.")


def selected_ui_option(ui_brief: dict) -> dict:
    confirmed_id = str(ui_brief.get("confirmed_option_id") or "").strip()
    if not confirmed_id:
        raise ValueError("UI Brief must contain confirmed_option_id.")
    options = ui_brief.get("ui_options")
    if not isinstance(options, list) or not options:
        raise ValueError("UI Brief must contain ui_options.")
    if len(options) < 3:
        raise ValueError("UI Brief must contain at least 3 ui_options for preview selection.")
    for option in options:
        if not isinstance(option, dict) or not option.get("id"):
            raise ValueError("UI Brief options must be objects with id.")
        validate_ui_option(option, str(option["id"]))
    validate_ui_options_set(options)
    for option in options:
        if isinstance(option, dict) and option.get("id") == confirmed_id:
            return option
    raise ValueError(f"confirmed_option_id does not match a UI option: {confirmed_id}")


def load_ui_brief(path: Path) -> tuple[dict, dict]:
    ui = normalize_ui_brief(load_json_object(path, "UI Brief"))
    option = selected_ui_option(ui)
    return ui, option


def legacy_theme_brief(ui: dict) -> dict:
    return {
        "recommended_theme_id": ui.get("recommended_option_id"),
        "confirmed_theme_id": ui.get("confirmed_option_id"),
        "theme_options": ui.get("ui_options", []),
    }


def is_network_url(value: object) -> bool:
    return str(value or "").strip().startswith(("http://", "https://"))


def media_asset_id(slot_name: str) -> str:
    if slot_name == "siteHero":
        return "site-hero"
    return f"{slot_name}-hero"


def ensure_media_local_path(value: str, asset_id: str) -> str:
    local_path = str(value or "").strip()
    if not local_path:
        raise ValueError(f"Media asset {asset_id} must contain local_path.")
    path = Path(local_path)
    if path.is_absolute() or ".." in path.parts or path.parts[:2] != ("assets", "media"):
        raise ValueError(f"Media asset {asset_id} local_path must stay under assets/media/.")
    return local_path


def normalize_network_media_asset(slot: dict, slot_name: str) -> dict:
    image_url = str(slot.get("url") or slot.get("remote_url") or "").strip()
    local_path = str(slot.get("local_path") or slot.get("localPath") or "").strip()
    asset_id = str(slot.get("asset_id") or slot.get("assetId") or media_asset_id(slot_name)).strip()
    if not image_url and not local_path:
        raise ValueError(f"{slot_name} must contain url or local_path.")
    if image_url and not is_network_url(image_url):
        raise ValueError(f"{slot_name} url must start with http:// or https://.")
    if local_path:
        local_path = ensure_media_local_path(local_path, asset_id)
    alt = str(slot.get("alt") or "").strip()
    if not alt:
        raise ValueError(f"{slot_name} must contain alt.")
    source_name = str(slot.get("source_name") or slot.get("source") or "").strip()
    source_url = str(slot.get("source_url") or "").strip()
    if not (source_name or source_url):
        raise ValueError(f"{slot_name} must contain source_name or source_url.")
    query = str(slot.get("query") or slot.get("matched_query") or "").strip()
    if not query:
        raise ValueError(f"{slot_name} must contain query.")
    return {
        "asset_id": asset_id,
        "url": image_url,
        "local_path": local_path,
        "source_name": source_name,
        "source_url": source_url,
        "alt": alt,
        "query": query,
        "reason": str(slot.get("reason") or "").strip(),
        "width": slot.get("width"),
        "height": slot.get("height"),
    }


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
        selected["asset_id"] = selected_asset_id
        selected["url"] = ""
        selected["source_name"] = selected.get("source", "")
        selected["source_url"] = selected.get("source_url", "")
        selected["alt"] = selected.get("alt") or selected.get("matched_query", "")
        selected["query"] = selected.get("matched_query", "")
        return selected
    raise ValueError(f"{slot_name} selected_asset_id does not match any candidate: {selected_asset_id}")


def normalize_media_slot(slot: dict, slot_name: str) -> dict:
    if not isinstance(slot, dict):
        raise ValueError(f"{slot_name} must be an object.")
    if "selected_asset_id" in slot or "candidates" in slot or "confirmed" in slot:
        return selected_media_candidate(slot, slot_name)
    return normalize_network_media_asset(slot, slot_name)


def load_media_brief_from_object(media: dict, days: list[dict]) -> tuple[dict, list[dict]]:
    assets: list[dict] = []
    assets.append(normalize_media_slot(media.get("siteHero"), "siteHero"))
    day_heroes = media.get("dayHeroes")
    if not isinstance(day_heroes, dict):
        raise ValueError("Media Brief must contain dayHeroes.")
    for day in days:
        key = f"day-{day.get('n')}"
        assets.append(normalize_media_slot(day_heroes.get(key), key))
    return media, assets


def load_media_brief(path: Path, days: list[dict]) -> tuple[dict, list[dict]]:
    media = load_json_object(path, "Media Brief")
    return load_media_brief_from_object(media, days)


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
    asset = {
        "asset_id": candidate["asset_id"],
        "url": candidate.get("url", ""),
        "local_path": candidate.get("local_path", ""),
        "source_name": candidate.get("source_name", ""),
        "source_url": candidate.get("source_url", ""),
        "alt": candidate.get("alt", ""),
        "query": candidate.get("query", ""),
        "source_type": candidate.get("source_type", "external" if candidate.get("url") or str(candidate.get("remote_url", "")).startswith("http") else "user-provided"),
        "source": candidate.get("source_name", candidate.get("source", "")),
        "credit": candidate.get("credit", ""),
        "usage_note": candidate.get("usage_note", ""),
        "prompt": candidate.get("prompt", ""),
        "matched_query": candidate.get("query") or candidate.get("matched_query", ""),
    }
    return {key: value for key, value in asset.items() if value not in ("", None)}


def public_ui_option(option: dict) -> dict:
    return {
        "id": option["id"],
        "name": option.get("name", option["id"]),
        "reason": option.get("reason", ""),
        "layout_profile": option["layout_profile"],
        "palette": option["palette"],
        "typography": option.get("typography", {}),
        "density": option["density"],
        "navigation": option["navigation"],
        "hero_treatment": option["hero_treatment"],
        "card_treatment": option["card_treatment"],
        "link_treatment": option["link_treatment"],
        "map_treatment": option["map_treatment"],
        "motion_level": option["motion_level"],
        "motifs": option.get("motifs", []),
    }


def download_media_assets(project: Path, assets: list[dict]) -> None:
    local_assets = [asset for asset in assets if asset.get("local_path")]
    if not local_assets:
        return
    (project / "assets" / "media").mkdir(parents=True, exist_ok=True)
    for candidate in local_assets:
        if candidate.get("url") or not candidate.get("remote_url"):
            continue
        target = project / candidate["local_path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            request = Request(candidate["remote_url"], headers=MEDIA_REQUEST_HEADERS)
            with urlopen(request, timeout=20) as response:
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
        TEMPLATE_ROOT / "assets/js/travel-ui-components.js",
        TEMPLATE_ROOT / "assets/js/travel-map.js",
        TEMPLATE_ROOT / "assets/js/travel.js",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing template files: " + ", ".join(missing))


def public_runtime_asset(candidate: dict) -> dict:
    asset = {
        "asset_id": candidate["asset_id"],
        "url": candidate.get("url", ""),
        "src": candidate.get("url") or candidate.get("local_path", ""),
        "local_path": candidate.get("local_path", ""),
        "source_type": candidate.get("source_type", "external" if candidate.get("url") or str(candidate.get("remote_url", "")).startswith("http") else "user-provided"),
        "source_name": candidate.get("source_name", ""),
        "source_url": candidate.get("source_url", ""),
        "source": candidate.get("source_name", candidate.get("source", "")),
        "credit": candidate.get("credit", ""),
        "usage_note": candidate.get("usage_note", ""),
        "prompt": candidate.get("prompt", ""),
        "matched_query": candidate.get("query") or candidate.get("matched_query", ""),
        "query": candidate.get("query", ""),
        "alt": candidate.get("alt") or candidate.get("matched_query", ""),
        "reason": candidate.get("reason", ""),
        "width": candidate.get("width"),
        "height": candidate.get("height"),
    }
    return {key: value for key, value in asset.items() if value not in ("", None)}


def runtime_days(brief: dict, media_assets: list[dict]) -> list[dict]:
    days = copy.deepcopy(brief["days"])
    for day, asset in zip(days, media_assets[1:]):
        day["hero"] = public_runtime_asset(asset)
    return days


def write_trip_data(project: Path, brief: dict, ui: dict, ui_option: dict, media: dict) -> None:
    _, media_assets = load_media_brief_from_object(media, brief["days"])
    site_hero = media_assets[0]
    public_option = public_ui_option(ui_option)
    data = {
        "meta": {
            "tripTitle": brief["trip_title"],
            "tripSlug": brief["trip_slug"],
            "dateRange": brief.get("date_range", ""),
            "language": brief.get("language", "zh-CN"),
            "assumptions": brief.get("assumptions", []),
            "uncertainItems": brief.get("uncertain_items", []),
            "hero": public_runtime_asset(site_hero),
        },
        "ui": {
            "recommended_option_id": ui.get("recommended_option_id"),
            "confirmed_option_id": ui.get("confirmed_option_id"),
            "confirmed_option": public_option,
            "ui_options": [public_ui_option(option) for option in ui.get("ui_options", []) if isinstance(option, dict)],
            "recommendedOptionId": ui.get("recommended_option_id"),
            "confirmedOptionId": ui.get("confirmed_option_id"),
            "confirmedOption": public_option,
            "options": [public_ui_option(option) for option in ui.get("ui_options", []) if isinstance(option, dict)],
        },
        "generalResources": brief.get("generalResources") or brief.get("general_resources") or {},
        "days": runtime_days(brief, media_assets),
    }
    output = "window.HAPPY_TRIP_DATA = "
    output += json.dumps(data, ensure_ascii=False, indent=2)
    output += ";\n"
    target = project / "assets/js/travel-data.js"
    target.write_text(output, encoding="utf-8")


def create_site(trip_data: Path, ui_brief: Path, media_brief: Path, output_root: Path, force: bool) -> Path:
    ensure_template()
    brief = load_trip_brief(trip_data)
    ui, ui_option = load_ui_brief(ui_brief)
    media, media_assets = load_media_brief(media_brief, brief["days"])
    project = output_root.expanduser().resolve() / f"{brief['trip_slug']}-travel-site"
    if project.exists():
        if not force:
            raise FileExistsError(f"Output folder already exists: {project}")
        shutil.rmtree(project)
    shutil.copytree(TEMPLATE_ROOT, project)
    generated_brief = copy.deepcopy(brief)
    download_media_assets(project, media_assets)
    write_trip_data(project, generated_brief, ui, ui_option, media)
    (project / "trip-brief.json").write_text(
        json.dumps(generated_brief, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (project / "ui-brief.json").write_text(
        json.dumps(ui, ensure_ascii=False, indent=2) + "\n",
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
    parser.add_argument("--ui-brief", required=False, type=Path)
    parser.add_argument("--theme-brief", required=False, type=Path)
    parser.add_argument("--media-brief", required=False, type=Path)
    parser.add_argument("--output-root", default=Path.home() / "Desktop", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args(argv)
    try:
        ui_brief = args.ui_brief or args.theme_brief
        if ui_brief is None:
            raise ValueError("--ui-brief is required")
        if args.media_brief is None:
            raise ValueError("--media-brief is required")
        project = create_site(args.trip_data, ui_brief, args.media_brief, args.output_root, args.force)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(project)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
