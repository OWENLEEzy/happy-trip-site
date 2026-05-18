#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from create_site import (  # noqa: E402
    load_media_brief,
    load_trip_brief,
    load_ui_brief,
    normalize_media_slot,
    normalize_ui_brief,
    public_ui_option,
    validate_ui_option,
)


SLOTS = ["option-a", "option-b", "option-c", "option-d"]


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def selected_remote_media(media: dict, slot_name: str) -> dict:
    if slot_name == "siteHero":
        return normalize_media_slot(media.get("siteHero"), "siteHero")
    return normalize_media_slot(media.get("dayHeroes", {}).get(slot_name), slot_name)


def media_preview_src(asset: dict) -> str:
    return asset.get("url") or asset.get("remote_url") or asset.get("local_path") or ""


def first_items(day: dict, limit: int = 2) -> list[dict]:
    items: list[dict] = []
    for bucket in ["morning", "afternoon", "evening"]:
        for item in day.get(bucket, []) if isinstance(day.get(bucket), list) else []:
            if isinstance(item, dict):
                items.append(item)
            if len(items) >= limit:
                return items
    return items


def preview_html(brief: dict, option: dict, media: dict, slot_label: str) -> str:
    validate_ui_option(option, str(option.get("id") or slot_label))
    palette = option["palette"]
    day = brief["days"][0]
    hero = selected_remote_media(media, "siteHero")
    day_hero = selected_remote_media(media, f"day-{day.get('n')}")
    items = first_items(day)
    item_cards = "\n".join(
        f"""
        <article class="card">
          <div class="time">{esc(item.get("time"))}</div>
          <h3>{esc(item.get("title"))}</h3>
          <p>{esc(item.get("note"))}</p>
          <div class="links">
            {''.join(f'<span>{esc(link.get("label") or link.get("type") or "link")}</span>' for link in item.get("links", [])[:3] if isinstance(link, dict))}
          </div>
        </article>
        """
        for item in items
    )
    motifs_list = option.get("motifs", [])
    motifs = "".join(f"<span>{esc(motif)}</span>" for motif in motifs_list)
    palette_summary = " / ".join(
        f"{key}: {option['palette'].get(key)}"
        for key in ["background", "surface", "ink", "accent", "accent2"]
        if option["palette"].get(key)
    )
    typography = option.get("typography", {})
    typography_summary = " / ".join(
        f"{key}: {typography.get(key)}"
        for key in ["sans", "serif", "display"]
        if typography.get(key)
    )
    design_specs = [
        ("Layout", option.get("layout_profile")),
        ("Palette", palette_summary),
        ("Typography", typography_summary),
        ("Density", option.get("density")),
        ("Navigation", option.get("navigation")),
        ("Hero", option.get("hero_treatment")),
        ("Cards", option.get("card_treatment")),
        ("Links", option.get("link_treatment")),
        ("Map", option.get("map_treatment")),
        ("Motion", option.get("motion_level")),
        ("Motifs", ", ".join(str(motif) for motif in motifs_list)),
    ]
    design_rows = "".join(
        f"<li><b>{esc(label)}</b><span>{esc(value)}</span></li>"
        for label, value in design_specs
    )
    return f"""<!doctype html>
<html lang="{esc(brief.get('language') or 'zh-CN')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(option.get('name'))} UI Preview</title>
<style>
:root {{
  --bg: {palette['background']};
  --surface: {palette['surface']};
  --ink: {palette['ink']};
  --muted: {palette['muted']};
  --accent: {palette['accent']};
  --accent2: {palette['accent2']};
  --line: {palette['line']};
  --serif: {option.get('typography', {}).get('serif', 'Georgia, serif')};
  --sans: {option.get('typography', {}).get('sans', 'system-ui, sans-serif')};
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  min-height: 100vh;
  color: var(--ink);
  font-family: var(--sans);
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--accent) 14%, transparent) 0 28%, transparent 28%),
    linear-gradient(180deg, var(--bg), color-mix(in srgb, var(--surface) 52%, var(--bg)));
}}
main {{ width: min(1120px, calc(100vw - 28px)); margin: 0 auto; padding: 18px 0 34px; }}
.hero {{
  min-height: 58vh;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: 0 24px 70px -46px color-mix(in srgb, var(--ink) 50%, transparent);
}}
.copy {{ padding: clamp(22px, 5vw, 52px); display: flex; flex-direction: column; justify-content: center; }}
.kicker {{ color: var(--accent2); font-size: 12px; font-weight: 900; text-transform: uppercase; }}
h1 {{ margin: 10px 0 0; font-family: var(--serif); font-size: clamp(34px, 7vw, 78px); line-height: .98; letter-spacing: 0; }}
.reason {{ max-width: 560px; color: var(--muted); font-size: 17px; line-height: 1.6; }}
.photo {{ position: relative; min-height: 360px; }}
.photo img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
.photo::after {{ content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 28%, transparent), transparent 52%); }}
.motifs, .links {{ display: flex; flex-wrap: wrap; gap: 8px; }}
.motifs span, .links span {{ border: 1px solid var(--line); border-radius: 999px; padding: 7px 10px; background: var(--surface); font-size: 12px; font-weight: 800; }}
.board {{ display: grid; grid-template-columns: .9fr 1.1fr; gap: 14px; margin-top: 14px; }}
.spec, .cards {{ border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--surface) 88%, transparent); padding: 16px; }}
.spec h2, .cards h2 {{ margin: 0 0 12px; font-family: var(--serif); font-size: 22px; }}
.spec ul {{ list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }}
.spec li {{ display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); padding-bottom: 7px; }}
.spec b {{ color: var(--accent); }}
.spec span {{ color: var(--muted); text-align: right; }}
.card {{ border-left: 4px solid var(--accent); background: var(--surface); padding: 14px; margin-bottom: 10px; border-radius: 8px; }}
.time {{ color: var(--accent); font-size: 12px; font-weight: 900; }}
.card h3 {{ margin: 4px 0 6px; font-family: var(--serif); font-size: 20px; }}
.card p {{ margin: 0 0 10px; color: var(--muted); line-height: 1.55; }}
.route {{ margin-top: 14px; border: 1px dashed color-mix(in srgb, var(--accent) 60%, var(--line)); border-radius: 10px; padding: 13px; color: var(--muted); }}
@media (max-width: 760px) {{
  .hero, .board {{ grid-template-columns: 1fr; }}
  .photo {{ min-height: 260px; }}
}}
</style>
</head>
<body>
<main>
  <section class="hero">
    <div class="copy">
      <div class="kicker">{esc(slot_label)} · {esc(option.get('name'))}</div>
      <h1>{esc(brief.get('trip_title'))}</h1>
      <p class="reason">{esc(option.get('reason'))}</p>
      <div class="motifs">{motifs}</div>
    </div>
    <div class="photo"><img src="{esc(media_preview_src(hero) or media_preview_src(day_hero))}" alt="{esc(hero.get('alt') or hero.get('query') or hero.get('matched_query') or option.get('name'))}"></div>
  </section>
  <section class="board">
    <div class="spec">
      <h2>UI 选择清单</h2>
      <ul>{design_rows}</ul>
      <div class="route">路线预览：{esc(day.get('routeOverview', {}).get('title', '今日动线总览'))} · {len(day.get('routeOverview', {}).get('stops', []))} 个站点</div>
    </div>
    <div class="cards">
      <h2>{esc(day.get('title'))}</h2>
      {item_cards}
    </div>
  </section>
</main>
</body>
</html>
"""


def create_previews(trip_data: Path, ui_brief: Path, media_brief: Path, output_dir: Path) -> Path:
    brief = load_trip_brief(trip_data)
    ui, _ = load_ui_brief(ui_brief)
    ui = normalize_ui_brief(ui)
    media, _ = load_media_brief(media_brief, brief["days"])
    options = ui.get("ui_options", [])
    if not isinstance(options, list) or len(options) < 3:
        raise ValueError("UI previews require at least 3 ui_options.")
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "trip_title": brief["trip_title"],
        "recommended_option_id": ui.get("recommended_option_id"),
        "confirmed_option_id": ui.get("confirmed_option_id"),
        "previews": [],
    }
    for index, option in enumerate(options[: len(SLOTS)]):
        if not isinstance(option, dict):
            continue
        slot = SLOTS[index]
        path = output_dir / f"{slot}.html"
        path.write_text(preview_html(brief, option, media, slot), encoding="utf-8")
        manifest["previews"].append(
            {
                "slot": slot,
                "option_id": option.get("id"),
                "name": option.get("name"),
                "path": str(path),
                "ui_option": public_ui_option(option),
            }
        )
    (output_dir / "preview-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return output_dir


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create Happy Trip Site UI preview files.")
    parser.add_argument("--trip-data", required=True, type=Path)
    parser.add_argument("--ui-brief", required=True, type=Path)
    parser.add_argument("--media-brief", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        output_dir = create_previews(args.trip_data, args.ui_brief, args.media_brief, args.output_dir)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
