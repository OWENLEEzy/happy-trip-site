#!/usr/bin/env node
// verify-preview.mjs — zero-dependency QA for generated UI previews / sites.
//
// Catches the SILENT failures that grepping static HTML cannot:
//   - texture/motif data-URIs double-encoded as %2523 (filter ref breaks, grain renders nothing)
//   - item.mapStopLabels that don't byte-match a routeOverview stop label (numbered badge silently drops)
//   - a missing aesthetic block (site falls back to the neutral theme)
//   - thin "highlight reel" days and flat resource pages
//
// Usage:  node scripts/verify-preview.mjs <preview-or-index>.html [more.html ...]
// Exits non-zero if any FAIL is found. Warnings do not fail the run.
//
// It executes ONLY the inline data script in a sandboxed node:vm with stub
// window/document/localStorage — it never loads the rendering engine or network.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import vm from 'node:vm';

const MIN_ITEMS_PER_DAY = 6; // hard floor: below this a day reads as a thin highlight reel
const BENCHMARK_ITEMS = 8;   // target/day — kansai averages ~9.6; drive toward fullness, not just the floor

// Anchor selectors that ONLY exist in the COMPLETE engine stylesheet. A
// generated site copies travel.css verbatim from the template; if that copy is
// truncated or drifted (e.g. an uncommitted regression that deletes whole
// feature blocks), the page renders broken — unstyled Quick Links panels blow
// their SVG icons full-width — yet every data check still passes. Grepping for
// these proves the copied CSS is the whole file, not a stale subset.
const REQUIRED_CSS_ANCHORS = [
  '.quick-links-panel',   // day-feature link panel wrapper
  '.quick-link svg',      // icon sizing — its absence is the full-width-icon bug
  '.bottom-day-tabs',     // bottom navigation block
  '.landing-summary',     // hero stats row
  '.day-feature',         // day feature section
];

// Verify the sibling engine stylesheet of a generated index.html is complete.
// Returns {fails, warns} appended by the caller. No-op when there is no
// sibling assets/css/travel.css (e.g. a standalone preview fragment).
function checkStylesheet(htmlFile, fails, warns) {
  const cssPath = resolvePath(dirname(htmlFile), 'assets/css/travel.css');
  if (!existsSync(cssPath)) {
    warns.push('no sibling assets/css/travel.css found next to this index.html — cannot verify engine stylesheet integrity.');
    return;
  }
  let css;
  try { css = readFileSync(cssPath, 'utf8'); }
  catch (e) { fails.push(`could not read engine stylesheet ${cssPath}: ${e.message}`); return; }
  const missing = REQUIRED_CSS_ANCHORS.filter(sel => !css.includes(sel));
  if (missing.length) {
    fails.push(`engine stylesheet travel.css is truncated/incomplete — missing required rules: ${missing.join(', ')}. The page will render broken (e.g. full-width Quick Links icons). Re-copy travel.css from the committed template instead of a drifted working copy.`);
  }
}

function extractTripData(html, htmlFile) {
  // Pull every inline <script> (no src=) and run them in a tolerant sandbox.
  // A raw .js file (travel-data.js) has no <script> tags — treat the whole file as one script.
  let scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  // A real generated index.html loads data via <script src="...travel-data.js">,
  // not inline — resolve and read that sibling file so the verifier validates the
  // DEPLOYED artifact, not just an inlined preview.
  if (!scripts.length && htmlFile) {
    const srcs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    const dataSrc = srcs.find(s => /travel-data\.js/.test(s));
    if (dataSrc) {
      const dataPath = resolvePath(dirname(htmlFile), dataSrc.split('?')[0]);
      try { if (existsSync(dataPath)) scripts = [readFileSync(dataPath, 'utf8')]; } catch { /* fall through */ }
    }
  }
  if (!scripts.length) scripts = [html];
  const noop = new Proxy(() => noop, { get: () => noop, set: () => true });
  const sandbox = {
    window: {}, self: {}, globalThis: {},
    document: noop, localStorage: { setItem() {}, getItem() { return null; } },
    console: { log() {}, warn() {}, error() {} },
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  for (const code of scripts) {
    try { vm.runInContext(code, sandbox, { timeout: 2000 }); } catch { /* engine IIFEs may throw on stub DOM; ignore */ }
    if (sandbox.window.HAPPY_TRIP_DATA) break;
  }
  return sandbox.window.HAPPY_TRIP_DATA || null;
}

function checkDataUris(html, fails) {
  if (html.includes('%2523')) {
    fails.push('texture/motif data-URI is double-encoded (%2523 found). The `#` was pre-encoded then encoded again, so url(%23t) breaks and the grain renders nothing. Write a literal `#` and URL-encode exactly once.');
  }
  for (const m of html.matchAll(/data:image\/svg\+xml,[^"')]+/g)) {
    const uri = m[0];
    if (/filter%3D|filter=/.test(uri) && /url\(/.test(decodeSafe(uri)) && !uri.includes('%23') && !uri.includes('#')) {
      fails.push('a feTurbulence data-URI references a filter but contains no `#`/`%23` id reference — the filter will not resolve.');
    }
  }
}

function decodeSafe(s) { try { return decodeURIComponent(s); } catch { return s; } }

// WCAG AA contrast helpers — sRGB linearisation per IEC 61966-2-1
function hexToLuminance(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  const weights = [0.2126, 0.7152, 0.0722];
  return [m[1], m[2], m[3]].reduce((L, c, i) => {
    const n = parseInt(c, 16) / 255;
    return L + (n > 0.04045 ? ((n + 0.055) / 1.055) ** 2.4 : n / 12.92) * weights[i];
  }, 0);
}

function contrastRatio(La, Lb) {
  const [hi, lo] = La > Lb ? [La, Lb] : [Lb, La];
  return (hi + 0.05) / (lo + 0.05);
}

function dayItems(day) {
  return ['morning', 'afternoon', 'evening'].flatMap(k => Array.isArray(day[k]) ? day[k] : []);
}

function dayStopLabels(day) {
  const r = day.routeOverview || {};
  const stops = (r.stops && r.stops.length ? r.stops : (r.sections || []).flatMap(s => s.stops || []));
  const set = new Set();
  for (const s of stops) { if (s.label) set.add(s.label); if (s.query) set.add(s.query); }
  return set;
}

function verify(file) {
  const html = readFileSync(file, 'utf8');
  const fails = [];
  const warns = [];
  const notes = [];

  // 1. Engine wiring (only meaningful for HTML previews, not raw travel-data.js)
  if (/\.html?$/i.test(file)) {
    // Real engine = either inlined data + render markers (preview), OR a real
    // index.html that loads travel-data.js + travel.js via <script src>.
    const inlineEngine = /HAPPY_TRIP_DATA/.test(html) && /(it-check|renderItem|route-pin)/.test(html);
    const externalEngine = /src=["'][^"']*travel-data\.js/.test(html) && /src=["'][^"']*travel\.js/.test(html);
    if (!inlineEngine && !externalEngine) warns.push('preview does not appear to wire the real engine (no inline HAPPY_TRIP_DATA + render markers, and no travel-data.js/travel.js script tags found).');
    // 1b. Engine stylesheet integrity — catches a truncated/drifted travel.css
    // copy that data checks would otherwise wave through.
    checkStylesheet(file, fails, warns);
  }

  // 2. Data-URI encoding traps (works even without parsing data)
  checkDataUris(html, fails);

  // 3. Parse the inline trip data
  const data = extractTripData(html, file);
  if (!data) {
    fails.push('could not extract window.HAPPY_TRIP_DATA from inline scripts — cannot validate content.');
    return { file, fails, warns, notes };
  }

  // 4. Aesthetic block (or the site silently uses the neutral fallback theme)
  // The runtime accepts either spelling (travel.js: confirmed_option || confirmedOption).
  const opt = data.ui && (data.ui.confirmed_option || data.ui.confirmedOption);
  if (!opt) {
    fails.push('ui.confirmed_option (or confirmedOption) is missing — the runtime reads this, not ui_options[].');
  } else {
    const a = opt.aesthetic || {};
    if (!a.texture && !a.motif && !a.glyph && !a.fontDisplay) {
      warns.push('confirmed_option has no aesthetic layers (texture/motif/glyph/font) — the page will read as a plain recolor, not destination-distinct.');
    }
    for (const key of ['texture', 'motif']) {
      if (typeof a[key] === 'string' && a[key].includes('"')) {
        fails.push(`aesthetic.${key} contains a literal " (double quote) — the runtime's isSafeUrl rejects it and silently falls back to the neutral theme. URL-encode the data-URI once (quotes become %22) or use single quotes inside the SVG.`);
      }
    }
    // Palette completeness + WCAG AA contrast enforcement
    const p = opt.palette || {};
    if (!p.accent) warns.push('confirmed_option.palette.accent is missing — themed accents will fall back.');
    if (!p.surface) warns.push('confirmed_option.palette.surface is missing — card backgrounds will use the template default; WCAG checks against card surfaces are skipped.');
    const TEXT_ROLES = [
      { key: 'ink',     role: 'body text' },
      { key: 'muted',   role: 'secondary text (most common WCAG failure — verify independently)' },
      { key: 'accent',  role: 'links and buttons' },
      { key: 'accent2', role: 'eyebrow labels' },
    ];
    const bgL = hexToLuminance(p.background);
    const surfL = hexToLuminance(p.surface);
    for (const { key, role } of TEXT_ROLES) {
      const fgL = hexToLuminance(p[key]);
      if (fgL === null) continue; // non-hex value (CSS var, rgba) — skip
      for (const [bgName, bgLum] of [['background', bgL], ['surface', surfL]]) {
        if (bgLum === null) continue;
        const ratio = contrastRatio(fgL, bgLum);
        if (ratio < 4.5) {
          fails.push(`WCAG AA FAIL: palette.${key} ("${p[key]}", ${role}) has ${ratio.toFixed(2)}:1 contrast against palette.${bgName} ("${p[bgName]}") — minimum 4.5:1 required. Choose a darker shade.`);
        }
      }
    }
  }

  // Layout visibility: echo which composer the site will use. Unknown layouts
  // degrade to classic (graceful, not broken), so this is a note, not a fail.
  // Mirror travel-layouts.js resolve(): an explicit known `layout` wins, else the
  // option's `archetype` selects the composer, else classic.
  if (opt) {
    const KNOWN_LAYOUTS = ['classic', 'timeline', 'editorial', 'sensory', 'navigator'];
    const ARCHETYPE_LAYOUT = { sensory: 'sensory', editorial: 'editorial', navigator: 'navigator', 'navigation-first': 'navigator' };
    const explicit = typeof opt.layout === 'string' ? opt.layout : '';
    if (explicit && !KNOWN_LAYOUTS.includes(explicit)) {
      warns.push(`confirmed_option.layout "${explicit}" is not a known layout (${KNOWN_LAYOUTS.join(', ')}) — the runtime will silently fall back to classic.`);
    }
    if (!explicit && opt.archetype && !ARCHETYPE_LAYOUT[opt.archetype]) {
      warns.push(`confirmed_option.archetype "${opt.archetype}" is not a known archetype (sensory, editorial, navigator) — the runtime will fall back to classic.`);
    }
    const viaArchetype = !KNOWN_LAYOUTS.includes(explicit) && !!ARCHETYPE_LAYOUT[opt.archetype];
    const resolved = KNOWN_LAYOUTS.includes(explicit) ? explicit : (ARCHETYPE_LAYOUT[opt.archetype] || 'classic');
    notes.push(`layout: "${resolved}" composer selected${viaArchetype ? ` (via archetype "${opt.archetype}")` : ''}.`);
  }

  // 5. Per-day content + map-seq label integrity
  const days = Array.isArray(data.days) ? data.days : [];
  if (!days.length) fails.push('no days[] in the data.');
  const counts = days.map(d => dayItems(d).length);
  const maxDay = counts.length ? Math.max(...counts) : 0;
  const meanDay = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  let sawSections = false;
  for (const day of days) {
    const items = dayItems(day);
    const labels = dayStopLabels(day);
    if (items.length < MIN_ITEMS_PER_DAY) {
      warns.push(`day ${day.n}: only ${items.length} items (< floor ${MIN_ITEMS_PER_DAY}). Add the connective tissue (transfer / check-in / inter-city leg / return) so it is not a thin highlight reel.`);
    } else if (days.length >= 2 && items.length < Math.ceil(0.7 * maxDay)) {
      warns.push(`day ${day.n}: ${items.length} items is materially below this trip's richest day (${maxDay}) — even the floor passes, but uneven days read as neglected; fill toward a consistent ~${BENCHMARK_ITEMS}/day.`);
    }
    for (const it of items) {
      if (Array.isArray(it.sections) && it.sections.length) sawSections = true;
      // Every item must expose at least one tappable link (SKILL.md invariant + a blocking Readiness Checklist item).
      // The verifier guards it because grep only proves *some* link exists, not that *every* item has one — a green
      // run would otherwise hide linkless connective-tissue items (rest / check-in / luggage drop) that ship without
      // the maps-search fallback the rules require.
      if (!Array.isArray(it.links) || !it.links.length) {
        fails.push(`day ${day.n}: item "${(it.title || '').slice(0, 24)}" has no links[] — every itinerary item must expose at least one tappable link pill. Add a Google Maps search link for connective-tissue items (rest / check-in / inter-city leg) that have no natural place URL.`);
      }
      for (const lbl of (it.mapStopLabels || [])) {
        if (!labels.has(lbl)) {
          fails.push(`day ${day.n}: item "${(it.title || '').slice(0, 24)}" has mapStopLabels "${lbl}" that does not byte-match any routeOverview stop label — the numbered it-map-seq badge will silently drop.`);
        }
      }
    }
  }
  if (days.length && !sawSections) warns.push('no item carries structured `sections` — anchor stops should use the it-sections grid for benchmark density.');
  if (days.length >= 2 && meanDay < BENCHMARK_ITEMS) {
    notes.push(`trip mean ${meanDay.toFixed(1)} items/day is below the benchmark ~${BENCHMARK_ITEMS}/day (kansai ≈ 9.6). Structurally valid, but enriching toward benchmark fullness would close the gap.`);
  }

  // 6. General resources structure
  const gr = data.generalResources || {};
  const grSections = Array.isArray(gr.sections) ? gr.sections : [];
  if (grSections.length) {
    const structured = grSections.some(s => (s.steps && s.steps.length) || (s.points && s.points.length) || (s.items && s.items.length));
    if (!structured) warns.push('generalResources has sections but none use steps/points — the 全程通用攻略 page is a flat note dump.');
  } else {
    notes.push('no generalResources.sections (the shared 攻略 page will be link-only).');
  }

  return { file, fails, warns, notes };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node scripts/verify-preview.mjs <preview>.html [...]');
  process.exit(2);
}

let anyFail = false;
for (const file of files) {
  let r;
  try { r = verify(file); }
  catch (e) { console.error(`\n✗ ${file}\n  ERROR reading/parsing: ${e.message}`); anyFail = true; continue; }
  const ok = r.fails.length === 0;
  anyFail = anyFail || !ok;
  console.log(`\n${ok ? '✓ PASS' : '✗ FAIL'}  ${file}`);
  for (const f of r.fails) console.log(`   ✗ ${f}`);
  for (const w of r.warns) console.log(`   ⚠ ${w}`);
  for (const n of r.notes) console.log(`   · ${n}`);
}
console.log('');
process.exit(anyFail ? 1 : 0);
