#!/usr/bin/env node
// verify-mobile-runtime.mjs — browser-backed mobile usability QA.
//
// Complements verify-preview.mjs. The data verifier is deliberately
// zero-dependency and does not load CSS or the runtime engine; this script uses
// a real browser so CSS cascade, layout-specific overrides, and computed target
// sizes are checked before a preview/site is shown or published.
//
// Usage:
//   node scripts/verify-mobile-runtime.mjs <preview-or-index>.html [more.html ...]
//   node scripts/verify-mobile-runtime.mjs --report mobile-usability-result.json <index.html>

import { existsSync, writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';

const MIN_TARGET = 44;
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const CORE_TARGETS = [
  { selector: '.menu-btn', label: 'menu button', required: true },
  { selector: '.it-check', label: 'itinerary check buttons', required: true },
  { selector: '.quick-link', label: 'item link buttons', required: true },
  { selector: '.map-route-link', label: 'Google Maps route link', required: true },
  { selector: '.route-pin-link', label: 'route stop pins', required: true },
  { selector: '.nav-btn:not(:disabled)', label: 'enabled day navigation buttons', required: false },
];

function usage() {
  console.error('usage: node scripts/verify-mobile-runtime.mjs [--report result.json] <preview-or-index>.html [...]');
  process.exit(2);
}

function parseArgs(argv) {
  let report = null;
  const files = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--report') {
      report = argv[i + 1];
      if (!report) usage();
      i += 1;
    } else {
      files.push(arg);
    }
  }
  if (!files.length) usage();
  return { report, files };
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch (firstError) {
    try {
      return await import('playwright-core');
    } catch {
      const msg = [
        'Playwright is required for browser-backed mobile QA.',
        'Run this in an environment where the `playwright` package is available,',
        'or install it for the validation run. Static grep/verify-preview checks',
        'are not a substitute because they cannot see computed CSS sizes.',
        `Original error: ${firstError.message}`,
      ].join(' ');
      throw new Error(msg);
    }
  }
}

function toUrl(input) {
  if (/^https?:\/\//i.test(input) || /^file:\/\//i.test(input)) return input;
  const abs = resolvePath(input);
  if (!existsSync(abs)) throw new Error(`file does not exist: ${abs}`);
  return pathToFileURL(abs).href;
}

async function verifyTarget(page, target) {
  return page.$$eval(target.selector, (nodes, spec) => {
    function isVisible(el) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || 1) > 0 &&
        rect.width > 0 &&
        rect.height > 0;
    }

    return nodes.filter(isVisible).map((el, index) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector: spec.selector,
        label: spec.label,
        index,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
        minWidth: style.minWidth,
        minHeight: style.minHeight,
        display: style.display,
        position: style.position,
      };
    });
  }, target);
}

async function verifyOne(browser, input) {
  const url = toUrl(input);
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  const fails = [];
  const warns = [];
  const notes = [];

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 3500 }).catch(() => {});
    await page.waitForTimeout(500);

    const title = await page.title().catch(() => '');
    if (title) notes.push(`title: ${title}`);

    for (const target of CORE_TARGETS) {
      const boxes = await verifyTarget(page, target);
      if (!boxes.length) {
        const message = `${target.label} (${target.selector}) not visible in the mobile viewport.`;
        if (target.required) fails.push(message);
        else warns.push(message);
        continue;
      }

      for (const box of boxes) {
        if (box.width < MIN_TARGET || box.height < MIN_TARGET) {
          const text = box.text ? ` "${box.text}"` : '';
          fails.push(`${box.label}${text} is ${box.width}x${box.height}px at ${MOBILE_VIEWPORT.width}px viewport; required target size is at least ${MIN_TARGET}x${MIN_TARGET}px. Computed min-size: ${box.minWidth} x ${box.minHeight}.`);
        }
      }
    }
  } catch (e) {
    fails.push(`browser runtime check failed: ${e.message}`);
  } finally {
    await context.close();
  }

  return {
    file: input,
    url,
    viewport: MOBILE_VIEWPORT,
    mobile_usability_passed: fails.length === 0,
    fails,
    warns,
    notes,
  };
}

const { report, files } = parseArgs(process.argv.slice(2));
let chromium;
try {
  ({ chromium } = await loadPlaywright());
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(2);
}
const browser = await chromium.launch({ headless: true });

const results = [];
let anyFail = false;
try {
  for (const file of files) {
    const result = await verifyOne(browser, file);
    results.push(result);
    anyFail = anyFail || !result.mobile_usability_passed;

    console.log(`\n${result.mobile_usability_passed ? '✓ PASS' : '✗ FAIL'}  ${file}`);
    console.log(`   viewport: ${result.viewport.width}x${result.viewport.height}`);
    for (const f of result.fails) console.log(`   ✗ ${f}`);
    for (const w of result.warns) console.log(`   ⚠ ${w}`);
    for (const n of result.notes) console.log(`   · ${n}`);
  }
} finally {
  await browser.close();
}

if (report) {
  const payload = {
    mobile_usability_passed: !anyFail,
    checked_at: new Date().toISOString(),
    min_touch_target_px: MIN_TARGET,
    viewport: MOBILE_VIEWPORT,
    results,
  };
  writeFileSync(resolvePath(report), `${JSON.stringify(payload, null, 2)}\n`);
}

console.log('');
process.exit(anyFail ? 1 : 0);
