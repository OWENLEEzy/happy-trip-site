const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sortLinksByPriority, matchTodayIndex, buildAesthetic } = require(
  '../skill/happy-trip-site/assets/static-template/assets/js/travel-helpers.js'
);

test('sortLinksByPriority: critical first, primary default, secondary last', () => {
  const links = [
    { url: 'a', priority: 'secondary' },
    { url: 'b' },                         // defaults to primary
    { url: 'c', priority: 'critical' },
    { url: 'd', priority: 'primary' },
  ];
  const ordered = sortLinksByPriority(links).map(l => l.url);
  assert.deepEqual(ordered, ['c', 'b', 'd', 'a']);
});

test('sortLinksByPriority: stable within the same tier and pure (no mutation)', () => {
  const links = [{ url: 'x' }, { url: 'y' }];
  const out = sortLinksByPriority(links);
  assert.deepEqual(out.map(l => l.url), ['x', 'y']);
  assert.notEqual(out, links);                 // new array
});

test('matchTodayIndex: returns index of the day whose date is today', () => {
  const days = [
    { n: 1, date: '2026-06-12' },
    { n: 2, date: '2026-06-13' },
    { n: 3, date: '2026-06-14' },
  ];
  assert.equal(matchTodayIndex(days, '2026-06-13'), 1);
});

test('matchTodayIndex: extracts an ISO date from a noisy label', () => {
  const days = [{ n: 1, date: 'Day 1 · 2026-06-13 · Kyoto' }];
  assert.equal(matchTodayIndex(days, '2026-06-13'), 0);
});

test('matchTodayIndex: -1 when today is outside the trip or dates unparseable', () => {
  assert.equal(matchTodayIndex([{ n: 1, date: '2026-06-12' }], '2026-06-20'), -1);
  assert.equal(matchTodayIndex([{ n: 1, date: '上午出发' }], '2026-06-13'), -1);
  assert.equal(matchTodayIndex([], '2026-06-13'), -1);
});

test('buildAesthetic: maps texture/motif/fonts to css vars with defaults', () => {
  const out = buildAesthetic({
    texture: 'data:image/svg+xml,TX', motif: 'data:image/svg+xml,MO',
    fontDisplay: '"Shippori Mincho", serif', fontBody: '"Noto Sans JP", sans-serif',
  });
  assert.equal(out.vars['--texture-bg'], 'url("data:image/svg+xml,TX")');
  assert.equal(out.vars['--texture-opacity'], '0.12');   // default
  assert.equal(out.vars['--motif-bg'], 'url("data:image/svg+xml,MO")');
  assert.equal(out.vars['--serif'], '"Shippori Mincho", serif');
  assert.equal(out.vars['--sans'], '"Noto Sans JP", sans-serif');
});

test('buildAesthetic: allowlists the font link host and defaults glyph rotation', () => {
  const ok = buildAesthetic({ fontLink: 'https://fonts.googleapis.com/css2?family=X', glyph: { mark: '関西' } });
  assert.equal(ok.fontHref, 'https://fonts.googleapis.com/css2?family=X');
  assert.deepEqual(ok.glyph, { mark: '関西', rotate: -4 });
  const bad = buildAesthetic({ fontLink: 'https://evil.example.com/font.css', glyph: { mark: '' } });
  assert.equal(bad.fontHref, null);                       // rejected host
  assert.equal(bad.glyph, null);                          // empty mark → no glyph
});

test('buildAesthetic: rejects css-injection in url and font values', () => {
  const out = buildAesthetic({
    texture: 'data:image/svg+xml,X") ;background:url(http://evil',  // breaks out of url("...")
    motif: 'data:image/svg+xml,OK',                                  // safe, kept
    fontDisplay: 'serif; } body { display:none',                     // structural chars
    fontBody: '"Noto Sans JP", sans-serif',                          // quotes are legal in stacks
  });
  assert.equal(out.vars['--texture-bg'], undefined);   // rejected
  assert.equal(out.vars['--motif-bg'], 'url("data:image/svg+xml,OK")');
  assert.equal(out.vars['--serif'], undefined);        // rejected
  assert.equal(out.vars['--sans'], '"Noto Sans JP", sans-serif');
});

test('buildAesthetic: empty/invalid input yields empty layers', () => {
  const out = buildAesthetic(undefined);
  assert.deepEqual(out.vars, {});
  assert.equal(out.fontHref, null);
  assert.equal(out.glyph, null);
});

test('buildAesthetic: anchorColor and accentWarm inject CSS color vars', () => {
  const out = buildAesthetic({ anchorColor: '#2C4A7C', accentWarm: '#8B5C3A' });
  assert.equal(out.vars['--color-accent'], '#2C4A7C');
  assert.equal(out.vars['--color-accent-2'], '#8B5C3A');
});

test('buildAesthetic: rejects 3-digit shorthand hex and invalid hex', () => {
  const out = buildAesthetic({ anchorColor: '#2C4', accentWarm: 'red' });
  assert.equal(out.vars['--color-accent'], undefined);
  assert.equal(out.vars['--color-accent-2'], undefined);
});

test('buildAesthetic: accepts uppercase hex for anchorColor', () => {
  const out = buildAesthetic({ anchorColor: '#B45309' });
  assert.equal(out.vars['--color-accent'], '#B45309');
});
