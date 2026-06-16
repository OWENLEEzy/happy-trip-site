(function (global) {
  'use strict';

  // Pure layout composers: take a `parts` object of pre-rendered HTML fragments
  // and return the full <main> inner HTML string. They never touch the DOM, so
  // they are unit-testable in node. Item IDs are baked into parts.items /
  // parts.periods by the engine, so done-state and event wiring are layout-agnostic.

  function classic(parts) {
    return [
      parts.landing,
      parts.mapOverview,
      parts.periods.morning,
      parts.periods.afternoon,
      parts.periods.evening,
      parts.foot,
    ].join('');
  }

  function timeline(parts) {
    return [
      parts.landing,
      '<section class="timeline-stream" aria-label="Day timeline">' + parts.items.join('') + '</section>',
      parts.mapOverview,
      parts.foot,
    ].join('');
  }

  // Editorial / travel-magazine layout: a commanding full-bleed hero, then the
  // day's periods set as magazine sections, with the route card demoted to a
  // reference block at the foot. Same parts, same item IDs — purely a re-arrange;
  // all distinctive styling lives in css/layouts/editorial.css.
  function editorial(parts) {
    return [
      parts.landing,
      '<div class="ed-stack">',
      parts.periods.morning,
      parts.periods.afternoon,
      parts.periods.evening,
      '<div class="ed-reference">' + parts.mapOverview + '</div>',
      '</div>',
      parts.foot,
    ].join('');
  }

  // Sensory / cinematic photo-essay layout: photography leads the day. Periods
  // become large atmospheric chapters and items become image-led cards; the
  // route is a framed map plate at the foot. Styling in css/layouts/sensory.css.
  function sensory(parts) {
    return [
      parts.landing,
      '<div class="se-flow">',
      '<div class="se-periods">',
      parts.periods.morning,
      parts.periods.afternoon,
      parts.periods.evening,
      '</div>',
      '<div class="se-reference">' + parts.mapOverview + '</div>',
      '</div>',
      parts.foot,
    ].join('');
  }

  // Navigator / clear-practical layout: the route block is hoisted to the top as
  // the centrepiece, periods follow as a scannable time-column checklist.
  // Styling in css/layouts/navigator.css. (Named *Layout so it never shadows the
  // global `navigator`; the registry key stays "navigator".)
  function navigatorLayout(parts) {
    return [
      parts.landing,
      '<div class="nav-route-top">' + parts.mapOverview + '</div>',
      '<div class="nav-stack">',
      parts.periods.morning,
      parts.periods.afternoon,
      parts.periods.evening,
      '</div>',
      parts.foot,
    ].join('');
  }

  var registry = {
    classic: classic,
    timeline: timeline,
    editorial: editorial,
    sensory: sensory,
    navigator: navigatorLayout,
  };

  // Maps the skill's three UI archetypes (the "Sensory / Editorial /
  // Navigation-first" variants derived in SKILL.md step 5) to a composer key.
  // This closes the loop between destination analysis and the rendered layout:
  // the generator stamps `archetype` on the chosen option and the runtime
  // resolves it here. `navigation-first` is accepted as an alias for the SKILL
  // wording so either spelling lands on the navigator composer.
  var ARCHETYPE_LAYOUT = {
    sensory: 'sensory',
    editorial: 'editorial',
    navigator: 'navigator',
    'navigation-first': 'navigator',
  };

  // Resolve a requested layout name to a real composer key; unknown/empty -> classic.
  function pick(name) {
    return (name && Object.prototype.hasOwnProperty.call(registry, name)) ? name : 'classic';
  }

  // Resolve the composer key for a confirmed UI option. Precedence:
  //   1. an explicit, known `option.layout` (power-user override) wins;
  //   2. otherwise the option's `archetype` selects the matching composer;
  //   3. otherwise classic.
  function resolve(option) {
    if (!option) return 'classic';
    if (option.layout && Object.prototype.hasOwnProperty.call(registry, option.layout)) {
      return option.layout;
    }
    var key = option.archetype && ARCHETYPE_LAYOUT[option.archetype];
    if (key && Object.prototype.hasOwnProperty.call(registry, key)) {
      return key;
    }
    return 'classic';
  }

  var api = { registry: registry, pick: pick, resolve: resolve, ARCHETYPE_LAYOUT: ARCHETYPE_LAYOUT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.HappyTripLayouts = api;
})(typeof window !== 'undefined' ? window : globalThis);
