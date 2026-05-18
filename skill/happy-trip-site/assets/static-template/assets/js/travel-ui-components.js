(function(){
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M17.5 18H8a5 5 0 1 1 1.1-9.9A6 6 0 0 1 20 11.5 3.5 3.5 0 0 1 17.5 18Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>',
    arr: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    maps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    tabelog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8a3 3 0 0 0 6 0V3M10 3v18"/><path d="M17 3c1.5 1.5 2 4 2 6s-.5 3-2 3v9"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><polygon points="10 9 16 12 10 15" fill="currentColor" stroke="none"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".8" fill="currentColor"/></svg>',
    xhs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 11c0 5.5-7 10-7 10Z"/></svg>'
  };

  const PERIODS = {
    morning: ['Morning', 'Start', '06-12', 'sun'],
    afternoon: ['Afternoon', 'Main route', '12-18', 'cloud'],
    evening: ['Evening', 'Wrap', '18-24', 'moon']
  };

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function attr(value){
    return esc(value).replace(/`/g, '&#96;');
  }

  function linkIconKey(type){
    return ({maps: 'maps', tabelog: 'tabelog', web: 'web', video: 'video', ig: 'ig', xhs: 'xhs'})[type] || 'web';
  }

  function mapSearchUrl(query){
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || '')}`;
  }

  function directionsUrl(route){
    const stops = route?.stops || [];
    if (stops.length === 0) return '';
    if (stops.length === 1) return mapSearchUrl(stops[0].query || stops[0].label);
    const params = new URLSearchParams({
      api: '1',
      origin: stops[0].query || stops[0].label || '',
      destination: stops[stops.length - 1].query || stops[stops.length - 1].label || '',
      travelmode: route.mode || 'transit'
    });
    const waypoints = stops.slice(1, -1).map(stop => stop.query || stop.label).filter(Boolean).join('|');
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function renderLink(link, className = 'lnk'){
    const type = linkIconKey(link.type);
    const label = link.label || (type === 'maps' ? 'Google Maps' : 'Open');
    return `
      <a class="${className} ${type}" href="${attr(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${attr(label)}">
        ${ICONS[type]}
        <span>${esc(label)}</span>
        ${ICONS.arr}
      </a>
    `;
  }

  function renderImage(asset, className, fallbackAlt){
    const src = asset?.url || asset?.src || asset?.local_path || asset?.localPath;
    if (!asset || !src) return '';
    const resolvedSrc = /^https?:\/\//.test(src) || src.startsWith('./') ? src : `./${src}`;
    const usage = asset.usage_note || asset.usageNote || asset.credit || asset.source_name || asset.sourceName || asset.source || '';
    return `
      <figure class="${className}">
        <img src="${attr(resolvedSrc)}" alt="${attr(asset.alt || asset.query || asset.matched_query || asset.matchedQuery || fallbackAlt)}" loading="lazy">
        ${usage ? `<figcaption>${esc(usage)}</figcaption>` : ''}
      </figure>
    `;
  }

  function renderStopLabels(labels){
    if (!Array.isArray(labels) || !labels.length) return '';
    return `<div class="map-stop-labels">${labels.map(label => `<span>${esc(label)}</span>`).join('')}</div>`;
  }

  window.HappyTripUIComponents = {
    ICONS,
    PERIODS,
    esc,
    attr,
    mapSearchUrl,
    directionsUrl,
    renderImage,
    renderLink,
    renderStopLabels
  };
})();
