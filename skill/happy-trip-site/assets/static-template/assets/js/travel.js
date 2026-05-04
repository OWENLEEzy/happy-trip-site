(function(){
  const data = window.TRIP_SITE_DATA || {days: []};
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const menuBtn = document.getElementById('menuBtn');
  const dayList = document.getElementById('dayList');
  const main = document.getElementById('main');
  const topJp = document.getElementById('topJp');
  const topCn = document.getElementById('topCn');
  const sidebarTitle = document.getElementById('sidebarTitle');
  const sidebarSub = document.getElementById('sidebarSub');
  const sidebarPrimaryMeta = document.getElementById('sidebarPrimaryMeta');
  const sidebarSecondaryMeta = document.getElementById('sidebarSecondaryMeta');
  const themeBadgeText = document.getElementById('themeBadgeText');

  const KEY_DAY = 'happyTripSite.activeDay';
  const KEY_DONE = 'happyTripSite.done';

  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3"/></svg>',
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

  function getDone(){
    try { return JSON.parse(localStorage.getItem(KEY_DONE) || '{}'); }
    catch(e){ return {}; }
  }

  function setDone(map){
    localStorage.setItem(KEY_DONE, JSON.stringify(map));
  }

  let activeDay = parseInt(localStorage.getItem(KEY_DAY) || '1', 10);
  if (isNaN(activeDay) || activeDay < 1 || activeDay > data.days.length) activeDay = 1;

  function applyTheme(){
    const theme = data.theme || {};
    const palette = theme.palette || {};
    const typography = theme.typography || {};
    const root = document.documentElement;
    const tokens = {
      '--color-bg': palette.background || '#F6F4EE',
      '--color-surface': palette.surface || '#FFFFFF',
      '--color-ink': palette.ink || '#171A1F',
      '--color-muted': palette.muted || '#67717D',
      '--color-accent': palette.accent || '#0E7C86',
      '--color-accent-2': palette.accent2 || '#D34F2F',
      '--color-line': palette.line || 'rgba(23,26,31,.14)'
    };
    Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
    if (typography.sans) root.style.setProperty('--sans', typography.sans);
    if (typography.serif) root.style.setProperty('--serif', typography.serif);
    if (theme.themeId) document.body.dataset.theme = theme.themeId;
  }

  function mediaAlt(asset, fallback){
    if (!asset) return fallback;
    return asset.matchedQuery || asset.reason || fallback;
  }

  function renderMediaFigure(asset, className, fallbackAlt){
    if (!asset || !asset.localPath) return '';
    const credit = asset.credit || asset.source || '';
    return `
      <figure class="${className}">
        <img src="./${attr(asset.localPath)}" alt="${attr(mediaAlt(asset, fallbackAlt))}" loading="lazy">
        ${credit ? `<figcaption>${esc(credit)}</figcaption>` : ''}
      </figure>
    `;
  }

  function dayHeroAsset(day){
    return data.media?.dayHeroes?.[`day-${day.n}`] || data.media?.siteHero || null;
  }

  function linkIconKey(type){
    return ({maps: 'maps', tabelog: 'tabelog', web: 'web', video: 'video', ig: 'ig', xhs: 'xhs'})[type] || 'web';
  }

  function setStaticShell(){
    const title = data.title || 'Happy Trip';
    document.title = title;
    if (topCn) topCn.textContent = title;
    if (sidebarTitle) {
      sidebarTitle.textContent = '';
      const name = document.createElement('span');
      name.textContent = title;
      const count = document.createElement('em');
      count.textContent = `${data.days.length}日`;
      sidebarTitle.append(name, count);
    }
    if (sidebarSub) sidebarSub.textContent = data.dateRange || 'HAPPY TRIP';
    if (sidebarPrimaryMeta) sidebarPrimaryMeta.textContent = data.days.map(day => day.city).filter(Boolean).slice(0, 3).join(' · ') || 'TRIP';
    if (sidebarSecondaryMeta) sidebarSecondaryMeta.textContent = 'ONE-TAP LINKS';
    if (themeBadgeText) themeBadgeText.textContent = (data.theme?.name || 'TRIP').slice(0, 4);
  }

  function renderSidebar(){
    dayList.querySelectorAll('.day-item').forEach(node => node.remove());
    data.days.forEach(day => {
      const btn = document.createElement('button');
      btn.className = 'day-item' + (day.n === activeDay ? ' active' : '');
      btn.setAttribute('data-day', day.n);
      btn.innerHTML = `
        <div class="di-num">
          <div class="small">DAY</div>
          <div class="big">${String(day.n).padStart(2, '0')}</div>
        </div>
        <div class="di-text">
          <span class="di-date">${esc(day.date)}</span>
          <span class="di-where">${esc([day.city, day.cityJp].filter(Boolean).join(' · '))}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        setActiveDay(day.n);
        closeSidebar();
      });
      dayList.appendChild(btn);
    });
  }

  function renderImg(img){
    if (!img || !img.src) return '';
    return `
      <figure class="it-media">
        <img src="${attr(img.src)}" alt="${attr(img.alt || img.caption || 'Trip photo')}" loading="lazy">
        ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
      </figure>
    `;
  }

  function renderImgs(imgs){
    if (!imgs || imgs.length === 0) return '';
    return imgs.map(renderImg).join('');
  }

  function renderItem(item, dayN, periodKey, idx){
    const id = `d${dayN}-${periodKey}-${idx}`;
    const done = !!getDone()[id];
    const tagClass = item.tag ? `tag-${attr(item.tag)}` : '';
    const links = (item.links || []).map(link => {
      const type = linkIconKey(link.type);
      const label = link.label || (type === 'maps' ? 'Google Maps' : '打开链接');
      return `
        <a class="lnk ${type}" href="${attr(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${attr(item.title)} · ${attr(label)}">
          ${ICONS[type]}
          <span>${esc(label)}</span>
          ${ICONS.arr}
        </a>
      `;
    }).join('');
    const imgs = item.img ? (Array.isArray(item.img) ? item.img : [item.img]) : null;

    return `
      <div class="item ${done ? 'done' : ''}" data-id="${attr(id)}">
        <div class="it-head">
          <button class="it-check" aria-label="标记为已完成">${ICONS.check}</button>
          <div class="it-body">
            <div class="it-time">${esc(item.time || '')}</div>
            <div class="it-title">
              ${esc(item.title)}
              ${item.tagText ? `<span class="it-tag ${tagClass}">${esc(item.tagText)}</span>` : ''}
            </div>
            ${item.jp ? `<div class="it-jp">${esc(item.jp)}</div>` : ''}
            ${imgs ? renderImgs(imgs) : ''}
            ${item.note ? `<div class="it-note">${esc(item.note)}</div>` : ''}
            ${links ? `<div class="links">${links}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderPeriod(label, labelJp, range, iconKey, items, dayN, periodKey){
    if (!items || items.length === 0) return '';
    return `
      <section class="period">
        <div class="period-head">
          <div class="icon">${ICONS[iconKey]}</div>
          <div class="label-wrap">
            <div class="label-cn">${label}</div>
            <div class="label-jp">${labelJp}</div>
          </div>
          <div class="time-range">${range}</div>
        </div>
        <div class="items">
          ${items.map((item, index) => renderItem(item, dayN, periodKey, index)).join('')}
        </div>
      </section>
    `;
  }

  function encodeMapQuery(value){
    return encodeURIComponent(value || '');
  }

  function buildGoogleMapsEmbedUrl(route){
    const stops = route?.stops || [];
    if (stops.length === 0) return '';
    const routeSegments = stops
      .map(stop => `!4m1!2s${encodeURIComponent(stop.query)}`)
      .join('');
    const routeGroupSize = stops.length * 2;
    const outerGroupSize = routeGroupSize + 1;
    const pb = `!1m${outerGroupSize}!4m${routeGroupSize}${routeSegments}!3m1!1szh-CN!5m1!1szh-CN`;
    return `https://www.google.com/maps/embed?origin=mfe&pb=${pb}`;
  }

  function buildGoogleMapsDirectionsUrl(route){
    const stops = route?.stops || [];
    if (stops.length === 0) return '';
    if (stops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeMapQuery(stops[0].query)}`;
    }
    const params = new URLSearchParams({
      api: '1',
      origin: stops[0].query,
      destination: stops[stops.length - 1].query,
      travelmode: route.mode || 'transit'
    });
    const waypoints = stops.slice(1, -1).map(stop => stop.query).join('|');
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function renderRoutePin(stop, index, routeUrl){
    const step = String(index + 1).padStart(2, '0');
    const href = stop.query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeMapQuery(stop.query)}`
      : routeUrl;
    return `
      <a class="route-pin route-pin-link" href="${attr(href)}" target="_blank" rel="noopener noreferrer">
        <span class="route-pin-index">${step}</span>
        <span class="route-pin-label">
          <span class="route-pin-order">${step} /</span>
          <span class="route-pin-name">${esc(stop.label || stop.query || 'Stop')}</span>
        </span>
      </a>
    `;
  }

  function renderMapOverview(day){
    const route = day.routeOverview;
    if (!route || !route.stops || route.stops.length === 0) return '';

    const embedUrl = buildGoogleMapsEmbedUrl(route);
    const directionsUrl = buildGoogleMapsDirectionsUrl(route);
    const title = `${day.date || ''} ${route.title || '今日动线总览'}`.trim();
    return `
      <div class="map-overview-card">
        <div class="map-overview-stage" data-map-state="embed">
          <iframe class="map-overview-frame" title="${attr(title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${attr(embedUrl)}"></iframe>
        </div>
        <div class="map-overview-body">
          <div class="map-overview-meta">
            <div>
              <div class="map-overview-title">${esc(route.title || '今日动线总览')}</div>
              <div class="map-overview-sub">${route.stops.length} 个节点 · ${route.mode === 'walking' ? '步行' : '公共交通'}视图</div>
            </div>
            <a class="map-route-link" href="${attr(directionsUrl)}" target="_blank" rel="noopener noreferrer">
              在 Google Maps 打开
              ${ICONS.arr}
            </a>
          </div>
          <div class="route-pins" aria-label="今日路线站点">
            ${route.stops.map((stop, index) => renderRoutePin(stop, index, directionsUrl)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderDay(){
    const day = data.days.find(entry => entry.n === activeDay);
    if (!day) return;

    if (topJp) topJp.textContent = `DAY ${String(day.n).padStart(2, '0')} · ${day.cityJp || day.city || ''}`;
    if (topCn) topCn.textContent = day.title || data.title || 'Happy Trip';

    const periods = [['morning', day.morning], ['afternoon', day.afternoon], ['evening', day.evening]];
    const doneMap = getDone();
    let total = 0;
    let done = 0;
    periods.forEach(([key, list]) => {
      (list || []).forEach((_, index) => {
        total++;
        if (doneMap[`d${day.n}-${key}-${index}`]) done++;
      });
    });
    const pct = total ? Math.round(done / total * 100) : 0;

    main.innerHTML = `
      ${renderMediaFigure(data.media?.siteHero, 'site-hero-media', `${data.title || 'Trip'} hero photo`)}
      <header class="day-hero">
        <div class="num-block">
          <div class="label">DAY</div>
          <div class="num">${String(day.n).padStart(2, '0')}</div>
          <div class="of">/ ${String(data.days.length).padStart(2, '0')}</div>
        </div>
        <div class="hero-text">
          <div class="date">${esc([day.date, day.city].filter(Boolean).join(' · '))}</div>
          <h1>${esc(day.title)}</h1>
          <div class="theme-jp">${esc(day.themeJp || data.theme?.name || '')}</div>
        </div>
        <div class="progress">
          <div>${done}/${total} 完成</div>
          <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
        </div>
      </header>

      ${renderMediaFigure(dayHeroAsset(day), 'day-hero-media', `${day.city || day.title} trip photo`)}
      ${renderMapOverview(day)}
      ${renderPeriod('上 午', 'MORNING', '06-12', 'sun', day.morning, day.n, 'morning')}
      ${renderPeriod('下 午', 'AFTERNOON', '12-18', 'cloud', day.afternoon, day.n, 'afternoon')}
      ${renderPeriod('晚 上', 'EVENING', '18-24', 'moon', day.evening, day.n, 'evening')}

      <div class="day-foot">
        <button class="nav-btn prev" ${day.n <= 1 ? 'disabled' : ''}>
          <span class="nb-label">前一天</span>
          <span class="nb-title">${day.n > 1 ? esc(data.days[day.n - 2].title) : '-'}</span>
        </button>
        <button class="nav-btn next" ${day.n >= data.days.length ? 'disabled' : ''}>
          <span class="nb-label">后一天</span>
          <span class="nb-title">${day.n < data.days.length ? esc(data.days[day.n].title) : '-'}</span>
        </button>
      </div>
    `;

    main.querySelectorAll('.item').forEach(element => {
      const id = element.getAttribute('data-id');
      const button = element.querySelector('.it-check');
      button.addEventListener('click', event => {
        event.stopPropagation();
        const map = getDone();
        if (map[id]) delete map[id]; else map[id] = true;
        setDone(map);
        renderDay();
      });
    });

    const prev = main.querySelector('.nav-btn.prev');
    const next = main.querySelector('.nav-btn.next');
    if (prev) prev.addEventListener('click', () => {
      if (activeDay > 1) {
        setActiveDay(activeDay - 1);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
    if (next) next.addEventListener('click', () => {
      if (activeDay < data.days.length) {
        setActiveDay(activeDay + 1);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
  }

  function setActiveDay(n){
    activeDay = n;
    localStorage.setItem(KEY_DAY, String(n));
    renderSidebar();
    renderDay();
  }

  function openSidebar(){
    sidebar.classList.add('open');
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar(){
    sidebar.classList.remove('open');
    scrim.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (scrim) scrim.addEventListener('click', closeSidebar);

  let touchStartX = null;
  if (sidebar) {
    sidebar.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; }, {passive: true});
    sidebar.addEventListener('touchmove', event => {
      if (touchStartX === null) return;
      const dx = event.touches[0].clientX - touchStartX;
      if (dx < -60) {
        closeSidebar();
        touchStartX = null;
      }
    }, {passive: true});
  }

  applyTheme();
  setStaticShell();
  renderSidebar();
  renderDay();
})();
