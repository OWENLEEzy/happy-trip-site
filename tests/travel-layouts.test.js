const { test } = require('node:test');
const assert = require('node:assert/strict');
const { registry, pick, resolve } = require(
  '../skill/happy-trip-site/assets/static-template/assets/js/travel-layouts.js'
);

const PARTS = {
  landing: 'L',
  mapOverview: 'M',
  periods: { morning: 'PM', afternoon: 'PA', evening: 'PE' },
  items: ['I1', 'I2', 'I3'],
  foot: 'F',
};

test('classic: preserves today\'s section order (behavior-preserving)', () => {
  assert.equal(registry.classic(PARTS), 'LMPMPAPEF');
});

test('timeline: one stream of every item, no period grouping, keeps hero/map/foot', () => {
  const out = registry.timeline(PARTS);
  assert.match(out, /<section class="timeline-stream"/);  // attr may follow before '>'
  for (const it of PARTS.items) assert.ok(out.includes(it), `missing item ${it}`);
  // period-grouped sections must NOT be emitted by timeline
  assert.ok(!out.includes('PM') && !out.includes('PA') && !out.includes('PE'));
  assert.ok(out.includes('L') && out.includes('M') && out.includes('F'));
});

test('timeline: items appear inside the stream wrapper, in order', () => {
  const out = registry.timeline(PARTS);
  const stream = out.slice(out.indexOf('timeline-stream'));
  assert.ok(stream.indexOf('I1') < stream.indexOf('I2'));
  assert.ok(stream.indexOf('I2') < stream.indexOf('I3'));
});

test('pick: known name passes through, unknown/empty falls back to classic', () => {
  assert.equal(pick('timeline'), 'timeline');
  assert.equal(pick('classic'), 'classic');
  assert.equal(pick('editorial'), 'editorial');
  assert.equal(pick('sensory'), 'sensory');
  assert.equal(pick('navigator'), 'navigator');
  assert.equal(pick('bogus'), 'classic');
  assert.equal(pick(''), 'classic');
  assert.equal(pick(undefined), 'classic');
});

test('every registered composer keeps hero + foot and re-uses the same parts', () => {
  for (const [name, composer] of Object.entries(registry)) {
    const out = composer(PARTS);
    assert.equal(typeof out, 'string', `${name} must return a string`);
    assert.ok(out.includes('L'), `${name} dropped the landing/hero`);
    assert.ok(out.includes('F'), `${name} dropped the day foot`);
  }
});

test('editorial: periods become a magazine stack, route demoted to a foot reference', () => {
  const out = registry.editorial(PARTS);
  assert.match(out, /<div class="ed-stack">/);
  assert.match(out, /<div class="ed-reference">M<\/div>/); // map demoted, after periods
  assert.ok(out.indexOf('PM') < out.indexOf('ed-reference'));
});

test('navigator: route block is hoisted to the top, before the periods', () => {
  const out = registry.navigator(PARTS);
  assert.match(out, /<div class="nav-route-top">M<\/div>/);
  assert.ok(out.indexOf('nav-route-top') < out.indexOf('PM'), 'route must precede periods');
});

test('sensory: periods wrapped in a photo-essay flow, route as a reference plate', () => {
  const out = registry.sensory(PARTS);
  assert.match(out, /<div class="se-flow">/);
  assert.match(out, /<div class="se-reference">M<\/div>/);
});

test('resolve: explicit known layout wins over archetype', () => {
  assert.equal(resolve({ layout: 'timeline', archetype: 'sensory' }), 'timeline');
});

test('resolve: archetype selects the composer when layout is absent', () => {
  assert.equal(resolve({ archetype: 'sensory' }), 'sensory');
  assert.equal(resolve({ archetype: 'editorial' }), 'editorial');
  assert.equal(resolve({ archetype: 'navigator' }), 'navigator');
  assert.equal(resolve({ archetype: 'navigation-first' }), 'navigator'); // SKILL wording alias
});

test('resolve: unknown layout falls back to archetype, then to classic', () => {
  assert.equal(resolve({ layout: 'bogus', archetype: 'editorial' }), 'editorial');
  assert.equal(resolve({ layout: 'bogus', archetype: 'also-bogus' }), 'classic');
  assert.equal(resolve({}), 'classic');
  assert.equal(resolve(null), 'classic');
  assert.equal(resolve(undefined), 'classic');
});
