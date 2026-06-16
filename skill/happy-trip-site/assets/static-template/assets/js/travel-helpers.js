(function (global) {
  'use strict';

  var PRIORITY_RANK = { critical: 0, primary: 1, secondary: 2 };

  // Pure: returns a new array sorted by link priority, stable within a tier.
  function sortLinksByPriority(links) {
    if (!Array.isArray(links)) return [];
    return links
      .map(function (link, i) { return { link: link, i: i }; })
      .sort(function (a, b) {
        var ra = PRIORITY_RANK[(a.link && a.link.priority) || 'primary'];
        var rb = PRIORITY_RANK[(b.link && b.link.priority) || 'primary'];
        if (ra !== rb) return ra - rb;
        return a.i - b.i; // stable
      })
      .map(function (x) { return x.link; });
  }

  // Pure: index of the day whose date matches todayISO ('YYYY-MM-DD'), else -1.
  // Tolerant: pulls the first YYYY-MM-DD out of a noisy date label.
  function matchTodayIndex(days, todayISO) {
    if (!Array.isArray(days) || !todayISO) return -1;
    for (var i = 0; i < days.length; i++) {
      var raw = days[i] && days[i].date;
      if (typeof raw !== 'string') continue;
      var m = raw.match(/\d{4}-\d{2}-\d{2}/);
      if (m && m[0] === todayISO) return i;
    }
    return -1;
  }

  var FONT_HOST = /^https:\/\/fonts\.googleapis\.com\//;

  // A url("...") value must not contain a quote that would break out of the quotes.
  function isSafeUrl(v) { return typeof v === 'string' && v && v.indexOf('"') === -1; }
  // A font stack value must not contain CSS-structural characters.
  function isSafeFont(v) { return typeof v === 'string' && v && !/[;{}<>]/.test(v); }
  // Full 6-digit hex only — 3-digit shorthands skipped for predictability.
  function isSafeHex(v) { return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v); }

  // Pure: turns an optional `aesthetic` block into { vars, fontHref, glyph }.
  // Omitted/invalid inputs produce no output for that layer (template renders nothing).
  function buildAesthetic(aesthetic) {
    var a = (aesthetic && typeof aesthetic === 'object') ? aesthetic : {};
    var vars = {};
    if (isSafeUrl(a.texture)) {
      vars['--texture-bg'] = 'url("' + a.texture + '")';
      vars['--texture-opacity'] = String(typeof a.textureOpacity === 'number' ? a.textureOpacity : 0.12);
    }
    if (isSafeUrl(a.motif)) {
      vars['--motif-bg'] = 'url("' + a.motif + '")';
    }
    if (isSafeFont(a.fontDisplay)) vars['--serif'] = a.fontDisplay;
    if (isSafeFont(a.fontBody)) vars['--sans'] = a.fontBody;
    if (isSafeHex(a.anchorColor)) vars['--color-accent'] = a.anchorColor;
    if (isSafeHex(a.accentWarm))  vars['--color-accent-2'] = a.accentWarm;
    var fontHref = (typeof a.fontLink === 'string' && FONT_HOST.test(a.fontLink)) ? a.fontLink : null;
    var glyph = (a.glyph && typeof a.glyph.mark === 'string' && a.glyph.mark)
      ? { mark: a.glyph.mark, rotate: (typeof a.glyph.rotate === 'number' ? a.glyph.rotate : -4) }
      : null;
    return { vars: vars, fontHref: fontHref, glyph: glyph };
  }

  var api = {
    sortLinksByPriority: sortLinksByPriority,
    matchTodayIndex: matchTodayIndex,
    buildAesthetic: buildAesthetic,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.TravelHelpers = api;
})(typeof window !== 'undefined' ? window : globalThis);
