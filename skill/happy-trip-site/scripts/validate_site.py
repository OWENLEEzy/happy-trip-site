#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


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
UI_VALUE_FIELDS = [
    "density",
    "navigation",
    "hero_treatment",
    "card_treatment",
    "link_treatment",
    "map_treatment",
    "motion_level",
]
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


def extract_trip_data(data_js: str) -> dict:
    match = re.search(r"window\.HAPPY_TRIP_DATA\s*=\s*(\{.*\})\s*;\s*$", data_js, re.S)
    if not match:
        raise ValueError("assets/js/travel-data.js must assign window.HAPPY_TRIP_DATA.")
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


def is_network_url(value: object) -> bool:
    return str(value or "").strip().startswith(("http://", "https://"))


def iter_trip_media(data: dict):
    site_hero = data.get("meta", {}).get("hero")
    if isinstance(site_hero, dict):
        yield site_hero
    days = data.get("days", [])
    if isinstance(days, list):
        for day in days:
            if isinstance(day, dict) and isinstance(day.get("hero"), dict):
                yield day["hero"]


def find_confirmed_ui_option(ui_brief: dict) -> dict:
    confirmed_id = ui_brief.get("confirmed_option_id")
    options = ui_brief.get("ui_options", [])
    if not isinstance(options, list):
        return {}
    for option in options:
        if isinstance(option, dict) and option.get("id") == confirmed_id:
            return option
    return {}


def public_ui_option(option: dict) -> dict:
    return {
        "id": option.get("id"),
        "name": option.get("name", option.get("id")),
        "reason": option.get("reason", ""),
        "layout_profile": option.get("layout_profile"),
        "palette": option.get("palette"),
        "typography": option.get("typography", {}),
        "density": option.get("density"),
        "navigation": option.get("navigation"),
        "hero_treatment": option.get("hero_treatment"),
        "card_treatment": option.get("card_treatment"),
        "link_treatment": option.get("link_treatment"),
        "map_treatment": option.get("map_treatment"),
        "motion_level": option.get("motion_level"),
        "motifs": option.get("motifs", []),
    }


def external_url(value: object) -> bool:
    return str(value or "").startswith(("http://", "https://"))


def normalize_url(value: object) -> str:
    return str(value or "").strip()


def displayed_routes(day: dict) -> list[dict]:
    route = day.get("routeOverview")
    if not isinstance(route, dict):
        return []
    routes = []
    if isinstance(route.get("stops"), list):
        routes.append(route)
    if isinstance(route.get("sections"), list):
        routes.extend(section for section in route["sections"] if isinstance(section, dict))
    return routes


def route_labels(day: dict) -> list[str]:
    labels = []
    for route in displayed_routes(day):
        for stop in route.get("stops", []):
            if isinstance(stop, dict) and stop.get("label"):
                labels.append(str(stop["label"]))
    return labels


def iter_day_items(day: dict):
    for bucket in ["morning", "afternoon", "evening"]:
        items = day.get(bucket)
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, dict):
                yield item


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


def validate_ui_option(option: dict, label: str, failures: list[str]) -> None:
    for field in REQUIRED_UI_OPTION_FIELDS:
        if field not in option:
            failures.append(f"{label} missing {field}")
    for field in UI_VALUE_FIELDS:
        if not str(option.get(field) or "").strip():
            failures.append(f"{label} {field} must be non-empty")
    layout_profile = option.get("layout_profile")
    if layout_profile not in SUPPORTED_LAYOUT_PROFILES:
        failures.append(f"{label} has unsupported layout_profile: {layout_profile}")
    palette = option.get("palette")
    if not isinstance(palette, dict):
        failures.append(f"{label} palette must be an object")
    else:
        for key in REQUIRED_PALETTE_FIELDS:
            if not palette.get(key):
                failures.append(f"{label} palette missing {key}")
        reserved_palette = reserved_default_palette_name(palette)
        if reserved_palette:
            failures.append(f"{label} palette matches reserved default palette {reserved_palette}")
    typography = option.get("typography")
    if not isinstance(typography, dict) or not typography:
        failures.append(f"{label} typography must be a non-empty object")
    motifs = option.get("motifs")
    if not isinstance(motifs, list) or not motifs:
        failures.append(f"{label} motifs must be a non-empty list")


def validate_ui_options_set(options: list[dict], label: str, failures: list[str]) -> None:
    ids = [str(option.get("id") or "").strip() for option in options if isinstance(option, dict)]
    duplicate_ids = sorted({option_id for option_id in ids if ids.count(option_id) > 1})
    if duplicate_ids:
        failures.append(f"{label} must have unique ids: " + ", ".join(duplicate_ids))
    if len(options) < 3:
        return
    layout_profiles = {str(option.get("layout_profile") or "").strip() for option in options if isinstance(option, dict)}
    if len(layout_profiles) < 3:
        failures.append(f"{label} must include at least 3 distinct layout_profile values")
    palette_signatures = {
        palette_signature(option.get("palette", {}))
        for option in options
        if isinstance(option, dict) and isinstance(option.get("palette"), dict)
    }
    if len(palette_signatures) < 3:
        failures.append(f"{label} must include at least 3 distinct palette choices")
    treatment_signatures = {ui_treatment_signature(option) for option in options if isinstance(option, dict)}
    if len(treatment_signatures) < 3:
        failures.append(f"{label} must include at least 3 distinct UI treatment combinations")


def validate(project: Path) -> list[str]:
    failures: list[str] = []
    required = [
        "index.html",
        "vercel.json",
        "assets/css/travel.css",
        "assets/js/travel-data.js",
        "assets/js/travel-ui-components.js",
        "assets/js/travel-map.js",
        "assets/js/travel.js",
        "trip-brief.json",
        "ui-brief.json",
        "media-brief.json",
        "media-manifest.json",
        "generation-result.json",
    ]
    for rel in required:
        if not (project / rel).exists():
            failures.append(f"Missing {rel}")
    if failures:
        return failures

    index = (project / "index.html").read_text(encoding="utf-8")
    if 'name="viewport"' not in index:
        failures.append("index.html missing mobile viewport meta")
    script_order = [
        "./assets/js/travel-data.js",
        "./assets/js/travel-ui-components.js",
        "./assets/js/travel-map.js",
        "./assets/js/travel.js",
    ]
    for rel in ["./assets/css/travel.css", *script_order]:
        if rel not in index:
            failures.append(f"index.html missing reference {rel}")
    positions = [index.find(rel) for rel in script_order]
    if any(pos < 0 for pos in positions) or positions != sorted(positions):
        failures.append("index.html must load scripts in order: data, UI components, map, app")

    try:
        vercel = json.loads((project / "vercel.json").read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(f"vercel.json is invalid JSON: {exc}")
        vercel = {}
    rewrites = vercel.get("rewrites", [])
    if not any(item.get("source") == "/" and item.get("destination") == "/index.html" for item in rewrites):
        failures.append("vercel.json must rewrite / to /index.html")

    try:
        data = extract_trip_data((project / "assets/js/travel-data.js").read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(str(exc))
        return failures

    ui_brief = load_json_file(project / "ui-brief.json", "ui-brief.json", failures)
    media_manifest = load_json_file(project / "media-manifest.json", "media-manifest.json", failures)

    meta = data.get("meta")
    if not isinstance(meta, dict):
        failures.append("HAPPY_TRIP_DATA.meta must be an object")
    else:
        for key in ["tripTitle", "tripSlug", "language"]:
            if not meta.get(key):
                failures.append(f"HAPPY_TRIP_DATA.meta.{key} is required")

    ui = data.get("ui")
    confirmed_ui = find_confirmed_ui_option(ui_brief) if ui_brief else {}
    if not isinstance(ui, dict):
        failures.append("HAPPY_TRIP_DATA.ui must be an object")
    else:
        confirmed_option_id = ui.get("confirmed_option_id") or ui.get("confirmedOptionId")
        if not confirmed_option_id:
            failures.append("HAPPY_TRIP_DATA.ui.confirmed_option_id is required")
        if ui.get("confirmedOptionId") != confirmed_option_id:
            failures.append("HAPPY_TRIP_DATA.ui.confirmedOptionId must mirror confirmed_option_id")
        if ui.get("recommendedOptionId") != ui.get("recommended_option_id"):
            failures.append("HAPPY_TRIP_DATA.ui.recommendedOptionId must mirror recommended_option_id")
        if ui_brief:
            if ui_brief.get("confirmed_option_id") != confirmed_option_id:
                failures.append("HAPPY_TRIP_DATA.ui.confirmed_option_id must match ui-brief.json confirmed_option_id")
            options = ui_brief.get("ui_options")
            if not isinstance(options, list) or not options:
                failures.append("ui-brief.json must contain ui_options")
            elif len(options) < 3:
                failures.append("ui-brief.json must contain at least 3 ui_options")
            else:
                valid_options = []
                for option in options:
                    if isinstance(option, dict):
                        valid_options.append(option)
                        validate_ui_option(option, f"ui option {option.get('id') or '<missing>'}", failures)
                    else:
                        failures.append("ui-brief.json ui_options entries must be objects")
                validate_ui_options_set(valid_options, "ui-brief.json ui_options", failures)
        confirmed_option = ui.get("confirmed_option") or ui.get("confirmedOption")
        if not isinstance(confirmed_option, dict):
            failures.append("HAPPY_TRIP_DATA.ui.confirmed_option must be an object")
        else:
            validate_ui_option(confirmed_option, "HAPPY_TRIP_DATA.ui.confirmed_option", failures)
            if confirmed_option_id and confirmed_option.get("id") != confirmed_option_id:
                failures.append("HAPPY_TRIP_DATA.ui.confirmed_option.id must match confirmed_option_id")
            if ui.get("confirmedOption") != confirmed_option:
                failures.append("HAPPY_TRIP_DATA.ui.confirmedOption must mirror confirmed_option")
            if confirmed_ui and confirmed_option != public_ui_option(confirmed_ui):
                failures.append("HAPPY_TRIP_DATA.ui.confirmed_option must match ui-brief.json confirmed option")
        data_options = ui.get("ui_options") or ui.get("options")
        if not isinstance(data_options, list) or not data_options:
            failures.append("HAPPY_TRIP_DATA.ui.ui_options must contain UI options")
        elif ui_brief and isinstance(ui_brief.get("ui_options"), list):
            validate_ui_options_set(
                [option for option in data_options if isinstance(option, dict)],
                "HAPPY_TRIP_DATA.ui.ui_options",
                failures,
            )
            expected_options = [public_ui_option(option) for option in ui_brief["ui_options"] if isinstance(option, dict)]
            if data_options != expected_options:
                failures.append("HAPPY_TRIP_DATA.ui.ui_options must match ui-brief.json ui_options")
            if ui.get("options") != data_options:
                failures.append("HAPPY_TRIP_DATA.ui.options must mirror ui_options")

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
            url = asset.get("url")
            local_path = asset.get("local_path")
            if url and not is_network_url(url):
                failures.append(f"media-manifest asset {asset_id or '<missing>'} url must start with http:// or https://")
            if not url and not local_path:
                failures.append(f"media-manifest asset {asset_id or '<missing>'} missing url or local_path")
            if not asset.get("alt"):
                failures.append(f"media-manifest asset {asset_id or '<missing>'} missing alt")
            if not (asset.get("source_name") or asset.get("source_url") or asset.get("source")):
                failures.append(f"media-manifest asset {asset_id or '<missing>'} missing source_name or source_url")
            if not (asset.get("query") or asset.get("matched_query")):
                failures.append(f"media-manifest asset {asset_id or '<missing>'} missing query")
            source_type = asset.get("source_type")
            if source_type not in {"ai-generated", "user-provided", "external"}:
                failures.append(f"media-manifest asset {asset_id or '<missing>'} has invalid source_type")
            if source_type == "ai-generated" and not asset.get("prompt"):
                failures.append(f"media-manifest ai-generated asset {asset_id or '<missing>'} missing prompt")
            if asset.get("local_path"):
                validate_media_path(project, asset["local_path"], failures)

    media_assets = list(iter_trip_media(data))
    if not media_assets:
        failures.append("HAPPY_TRIP_DATA must reference at least one media asset")
    for asset in media_assets:
        asset_id = asset.get("asset_id") or asset.get("assetId")
        image_url = asset.get("url") or asset.get("src")
        local_path = asset.get("local_path") or asset.get("localPath")
        if not asset_id:
            failures.append("HAPPY_TRIP_DATA media asset missing asset_id")
        if image_url and is_network_url(image_url):
            pass
        elif local_path:
            validate_media_path(project, local_path, failures)
        else:
            failures.append(f"HAPPY_TRIP_DATA media asset {asset_id or '<missing>'} missing url or local_path")
        if not asset.get("alt"):
            failures.append(f"HAPPY_TRIP_DATA media asset {asset_id or '<missing>'} missing alt")
        if not (asset.get("source_name") or asset.get("source_url") or asset.get("source") or asset.get("sourceName") or asset.get("sourceUrl")):
            failures.append(f"HAPPY_TRIP_DATA media asset {asset_id or '<missing>'} missing source_name or source_url")
        if asset_id and asset_id not in manifest_by_id:
            failures.append(f"HAPPY_TRIP_DATA media asset missing from manifest: {asset_id}")
        elif asset_id:
            manifest_asset = manifest_by_id[asset_id]
            manifest_url = manifest_asset.get("url")
            if image_url and is_network_url(image_url) and manifest_url and image_url != manifest_url:
                failures.append(f"HAPPY_TRIP_DATA media asset {asset_id} url must match media-manifest.json")
            if local_path and manifest_asset.get("local_path") and local_path != manifest_asset["local_path"]:
                failures.append(f"HAPPY_TRIP_DATA media asset {asset_id} local_path must match media-manifest.json")
            if asset.get("alt") and manifest_asset.get("alt") and asset["alt"] != manifest_asset["alt"]:
                failures.append(f"HAPPY_TRIP_DATA media asset {asset_id} alt must match media-manifest.json")

    days = data.get("days")
    if not isinstance(days, list) or not days:
        failures.append("HAPPY_TRIP_DATA.days must contain at least one day")
    else:
        has_item = False
        missing_links = 0
        invalid_links = 0
        duplicate_urls: set[str] = set()
        seen_urls: set[str] = set()
        missing_routes = 0
        missing_route_stops = 0
        invalid_route_stops = 0
        duplicate_stop_labels = 0
        invalid_map_stop_labels = 0
        unmatched_route_stops = 0
        for day in days:
            if not isinstance(day, dict):
                failures.append("HAPPY_TRIP_DATA.days entries must be objects")
                continue
            routes = displayed_routes(day)
            labels = route_labels(day)
            labels_set = set(labels)
            if not routes:
                missing_routes += 1
            else:
                if len(labels) != len(labels_set):
                    duplicate_stop_labels += 1
                for route in routes:
                    stops = route.get("stops")
                    if not isinstance(stops, list) or not stops:
                        missing_route_stops += 1
                    else:
                        for stop in stops:
                            if not isinstance(stop, dict) or not stop.get("query") or not stop.get("label"):
                                invalid_route_stops += 1
                            if (
                                isinstance(stop, dict)
                                and not stop.get("inferred")
                                and not any(
                                    stop.get("label") in (item.get("mapStopLabels") or [])
                                    for item in iter_day_items(day)
                                )
                            ):
                                unmatched_route_stops += 1
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
                    else:
                        for link in links:
                            url = normalize_url(link.get("url") if isinstance(link, dict) else "")
                            if not isinstance(link, dict) or not external_url(url):
                                invalid_links += 1
                            elif url in seen_urls:
                                duplicate_urls.add(url)
                            else:
                                seen_urls.add(url)
                    item_labels = item.get("mapStopLabels")
                    if isinstance(item_labels, list):
                        for label in item_labels:
                            if str(label) not in labels_set:
                                invalid_map_stop_labels += 1
        if not has_item:
            failures.append("HAPPY_TRIP_DATA must contain at least one itinerary item")
        if missing_links:
            failures.append(f"HAPPY_TRIP_DATA contains {missing_links} itinerary item(s) without links")
        if invalid_links:
            failures.append(f"HAPPY_TRIP_DATA contains {invalid_links} invalid external link(s)")
        if duplicate_urls:
            failures.append(f"HAPPY_TRIP_DATA contains duplicate visible URL(s): {', '.join(sorted(duplicate_urls))}")
        if missing_routes:
            failures.append(f"HAPPY_TRIP_DATA contains {missing_routes} day(s) without routeOverview")
        if missing_route_stops:
            failures.append(f"HAPPY_TRIP_DATA contains {missing_route_stops} routeOverview object(s) without stops")
        if invalid_route_stops:
            failures.append(f"HAPPY_TRIP_DATA contains {invalid_route_stops} invalid route stop(s)")
        if duplicate_stop_labels:
            failures.append(f"HAPPY_TRIP_DATA contains {duplicate_stop_labels} day route(s) with duplicate stop labels")
        if invalid_map_stop_labels:
            failures.append(f"HAPPY_TRIP_DATA contains {invalid_map_stop_labels} mapStopLabels value(s) without displayed route stop labels")
        if unmatched_route_stops:
            failures.append(f"HAPPY_TRIP_DATA contains {unmatched_route_stops} non-exempt route stop(s) without matching itinerary mapStopLabels")

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
        "cityJp",
        "themeJp",
        "item.jp",
        "label-jp",
        "it-jp",
        "topJp",
        "旅 の 栞",
        "しおり",
    ]
    final_ui_text = "\n".join(
        [
            index,
            (project / "assets/css/travel.css").read_text(encoding="utf-8"),
            (project / "assets/js/travel-ui-components.js").read_text(encoding="utf-8"),
            (project / "assets/js/travel-map.js").read_text(encoding="utf-8"),
            (project / "assets/js/travel.js").read_text(encoding="utf-8"),
            (project / "assets/js/travel-data.js").read_text(encoding="utf-8"),
        ]
    )
    for token in banned_tokens:
        if token in final_ui_text:
            failures.append(f"Final UI contains banned visual token: {token}")
    required_module_tokens = ["landing-", "quick-links-panel", "day-feature", "map-overview-card"]
    if not any(token in final_ui_text for token in required_module_tokens):
        failures.append("Final UI must contain at least one layout-profile driven module")
    for token in ["window.HappyTripUIComponents", "window.HappyTripMap", "loadLeaflet", "renderMarkerMap", "fullscreen"]:
        if token not in final_ui_text:
            failures.append(f"Runtime missing map/UI module token: {token}")

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
