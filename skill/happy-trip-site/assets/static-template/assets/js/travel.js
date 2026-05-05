(function(){
  const data = window.TRIP_SITE_DATA || {days: []};
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const menuBtn = document.getElementById('menuBtn');
  const dayList = document.getElementById('dayList');
  const main = document.getElementById('main');
  const topMeta = document.getElementById('topMeta');
  const topCn = document.getElementById('topCn');
  const sidebarTitle = document.getElementById('sidebarTitle');
  const sidebarSub = document.getElementById('sidebarSub');
  const sidebarPrimaryMeta = document.getElementById('sidebarPrimaryMeta');
  const sidebarSecondaryMeta = document.getElementById('sidebarSecondaryMeta');
  const themeBadgeText = document.getElementById('themeBadgeText');
  const bottomDayTabs = document.getElementById('bottomDayTabs');

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

  const PROFILES = {
    'bay-garden-evening': {
      badge: 'BAY',
      shellMeta: '海湾 · 花园 · 小贩',
      shellMode: 'MRT + 步行',
      landingLabel: '城市花园与海湾美食',
      landingLine: '滨海湾夜景、热带温室、小贩中心和圣淘沙海边，用慢节奏串成第一次到新加坡的三天入口。',
      routeTone: '海湾步道 / MRT / 小贩中心',
      motif: ['Marina Bay', 'Tropical garden', 'Hawker night'],
      periods: {
        morning: ['上午', '清凉开场', '06-12', 'sun'],
        afternoon: ['下午', '室内与街区', '12-18', 'cloud'],
        evening: ['晚上', '夜景与收尾', '18-24', 'moon']
      }
    },
    'peranakan-tropical-blocks': {
      badge: 'BLOCK',
      shellMeta: '娘惹 · 街区 · 色彩',
      shellMode: '街区漫游',
      landingLabel: '彩色店屋旅行板',
      landingLine: '把每日行程拆成像店屋立面一样的色块，突出 Joo Chiat、Katong 和多元街区。',
      routeTone: '街区照片 / 小店 / 本地食物',
      motif: ['Shophouse blocks', 'Street murals', 'Local coffee'],
      periods: {
        morning: ['上午', '街区开门', '06-12', 'sun'],
        afternoon: ['下午', '色块漫游', '12-18', 'cloud'],
        evening: ['晚上', '本地餐桌', '18-24', 'moon']
      }
    },
    'metro-food-clean': {
      badge: 'MRT',
      shellMeta: '路线 · 美食 · 链接',
      shellMode: '工具清单',
      landingLabel: '地铁美食行动台',
      landingLine: '优先把路线、地图、官网和餐食入口放在手边，适合边走边查。',
      routeTone: '站点 / 餐食 / 一键导航',
      motif: ['Station hops', 'Food stops', 'Action links'],
      periods: {
        morning: ['上午', '第一段路线', '06-12', 'sun'],
        afternoon: ['下午', '主路线', '12-18', 'cloud'],
        evening: ['晚上', '晚餐与返回', '18-24', 'moon']
      }
    }
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

  function getUiOption(){
    return data.ui?.confirmedOption || data.ui?.confirmed_option || {
      id: data.theme?.themeId || 'bay-garden-evening',
      name: data.theme?.name || '城市花园夜行',
      layout_profile: data.theme?.layoutProfile || 'bay-garden-evening',
      palette: data.theme?.palette || {},
      typography: data.theme?.typography || {},
      density: 'standard',
      navigation: 'topbar-drawer',
      hero_treatment: 'full-bleed-photo',
      card_treatment: 'timeline-cards',
      link_treatment: 'pill-cluster',
      map_treatment: 'embed-with-stop-chips',
      motion_level: 'subtle',
      motifs: data.theme?.motifs || []
    };
  }

  function getProfile(){
    const option = getUiOption();
    const id = option.layout_profile || 'bay-garden-evening';
    const profile = PROFILES[id] || PROFILES['bay-garden-evening'];
    return {
      ...profile,
      option,
      motif: option.motifs?.length ? option.motifs : profile.motif
    };
  }

  function getProfileId(){
    const id = getUiOption().layout_profile || 'bay-garden-evening';
    return PROFILES[id] ? id : 'bay-garden-evening';
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
    const option = getUiOption();
    const palette = option.palette || {};
    const typography = option.typography || {};
    const root = document.documentElement;
    const tokens = {
      '--color-bg': palette.background || '#F2F2EF',
      '--color-surface': palette.surface || '#FFFFFF',
      '--color-ink': palette.ink || '#202426',
      '--color-muted': palette.muted || '#6A7072',
      '--color-accent': palette.accent || '#66737A',
      '--color-accent-2': palette.accent2 || '#A27454',
      '--color-line': palette.line || 'rgba(32,36,38,.14)'
    };
    Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
    if (typography.sans) root.style.setProperty('--sans', typography.sans);
    if (typography.serif) root.style.setProperty('--serif', typography.serif);
    document.body.dataset.theme = option.id || getProfileId();
    document.body.dataset.layoutProfile = getProfileId();
    document.body.dataset.density = option.density || 'standard';
    document.body.dataset.navigation = option.navigation || 'topbar-drawer';
    document.body.dataset.heroTreatment = option.hero_treatment || 'full-bleed-photo';
    document.body.dataset.cardTreatment = option.card_treatment || 'timeline-cards';
    document.body.dataset.linkTreatment = option.link_treatment || 'pill-cluster';
    document.body.dataset.mapTreatment = option.map_treatment || 'embed-with-stop-chips';
    document.body.dataset.motionLevel = option.motion_level || 'subtle';
  }

  function mediaAlt(asset, fallback){
    if (!asset) return fallback;
    return asset.matchedQuery || asset.reason || fallback;
  }

  function renderImage(asset, className, fallbackAlt){
    const src = asset?.localPath || asset?.src;
    if (!asset || !src) return '';
    const resolvedSrc = /^https?:\/\//.test(src) || src.startsWith('./') ? src : `./${src}`;
    const credit = asset.credit || asset.source || '';
    return `
      <figure class="${className}">
        <img src="${attr(resolvedSrc)}" alt="${attr(mediaAlt(asset, fallbackAlt))}" loading="lazy">
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

  function dayItems(day){
    return ['morning', 'afternoon', 'evening'].flatMap(key => (day[key] || []).map((item, index) => ({item, key, index})));
  }

  function uniqueDayLinks(day){
    const seen = new Set();
    const links = [];
    dayItems(day).forEach(({item}) => {
      (item.links || []).forEach(link => {
        if (!link?.url || seen.has(link.url)) return;
        seen.add(link.url);
        links.push({ ...link, itemTitle: item.title });
      });
    });
    return links;
  }

  function renderLink(link, className = 'lnk'){
    const type = linkIconKey(link.type);
    const label = link.label || (type === 'maps' ? 'Google Maps' : '打开链接');
    const itemTitle = link.itemTitle ? `${link.itemTitle} · ` : '';
    return `
      <a class="${className} ${type}" href="${attr(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${attr(itemTitle + label)}">
        ${ICONS[type]}
        <span>${esc(label)}</span>
        ${ICONS.arr}
      </a>
    `;
  }

  function completionForDay(day){
    const doneMap = getDone();
    let total = 0;
    let done = 0;
    ['morning', 'afternoon', 'evening'].forEach(key => {
      (day[key] || []).forEach((_, index) => {
        total++;
        if (doneMap[`d${day.n}-${key}-${index}`]) done++;
      });
    });
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function setStaticShell(){
    const profile = getProfile();
    const title = data.title || 'Happy Trip';
    document.title = title;
    if (topCn) topCn.textContent = title;
    if (sidebarTitle) {
      sidebarTitle.textContent = '';
      const name = document.createElement('span');
      name.textContent = title;
      const count = document.createElement('em');
      count.textContent = `${data.days.length}天`;
      sidebarTitle.append(name, count);
    }
    if (sidebarSub) sidebarSub.textContent = data.dateRange || profile.landingLabel;
    if (sidebarPrimaryMeta) sidebarPrimaryMeta.textContent = profile.shellMeta;
    if (sidebarSecondaryMeta) sidebarSecondaryMeta.textContent = profile.shellMode;
    if (themeBadgeText) themeBadgeText.textContent = profile.badge || getUiOption().name.slice(0, 4);
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
          <span class="di-where">${esc([day.city, day.areaLabel].filter(Boolean).join(' · '))}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        setActiveDay(day.n);
        closeSidebar();
      });
      dayList.appendChild(btn);
    });
    renderBottomTabs();
  }

  function renderBottomTabs(){
    if (!bottomDayTabs) return;
    bottomDayTabs.innerHTML = data.days.map(day => `
      <button class="bottom-day-tab ${day.n === activeDay ? 'active' : ''}" data-bottom-day="${day.n}">
        <span>Day ${day.n}</span>
        <strong>${esc(day.themeLabel || day.title || '')}</strong>
      </button>
    `).join('');
    bottomDayTabs.querySelectorAll('[data-bottom-day]').forEach(button => {
      button.addEventListener('click', () => setActiveDay(Number(button.getAttribute('data-bottom-day'))));
    });
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
    const profile = getProfile();
    const embedUrl = buildGoogleMapsEmbedUrl(route);
    const directionsUrl = buildGoogleMapsDirectionsUrl(route);
    const title = `${day.date || ''} ${route.title || '今日动线总览'}`.trim();
    return `
      <section class="map-overview-card">
        <div class="map-overview-stage" data-map-state="embed">
          <iframe class="map-overview-frame" title="${attr(title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${attr(embedUrl)}"></iframe>
        </div>
        <div class="map-overview-body">
          <div class="map-overview-meta">
            <div>
              <div class="map-overview-title">${esc(route.title || '今日动线总览')}</div>
              <div class="map-overview-sub">${route.stops.length} 个节点 · ${esc(profile.routeTone)}</div>
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
      </section>
    `;
  }

  function renderQuickLinks(day){
    const links = uniqueDayLinks(day).slice(0, 8);
    if (!links.length) return '';
    return `
      <section class="quick-links-panel">
        <div class="quick-head">
          <span>今日快捷入口</span>
          <em>${links.length} 个链接</em>
        </div>
        <div class="quick-links">
          ${links.map(link => renderLink(link, 'quick-link')).join('')}
        </div>
      </section>
    `;
  }

  function renderLanding(day, completion){
    const profile = getProfile();
    const profileId = getProfileId();
    const hero = data.media?.siteHero;
    const motif = profile.motif.map(text => `<span>${esc(text)}</span>`).join('');
    const dayChips = data.days.map(entry => `
      <button class="landing-day-chip ${entry.n === activeDay ? 'active' : ''}" data-landing-day="${entry.n}">
        <span>Day ${entry.n}</span>
        <strong>${esc(entry.themeLabel || entry.title)}</strong>
      </button>
    `).join('');

    if (profileId === 'metro-food-clean') {
      return `
        <section class="landing landing-metro">
          <div class="landing-copy">
            <div class="eyebrow">${esc(profile.landingLabel)}</div>
            <h1>${esc(data.title || 'Happy Trip')}</h1>
            <p>${esc(profile.landingLine)}</p>
            <div class="motif-row">${motif}</div>
          </div>
          <div class="metro-board">
            <div class="metro-board-title">今日行动台</div>
            <div class="metro-board-grid">
              <div><span>当前</span><strong>Day ${day.n}</strong></div>
              <div><span>完成</span><strong>${completion.done}/${completion.total}</strong></div>
              <div><span>动线</span><strong>${day.routeOverview?.stops?.length || 0} 站</strong></div>
            </div>
            ${renderQuickLinks(day)}
          </div>
        </section>
      `;
    }

    if (profileId === 'peranakan-tropical-blocks') {
      return `
        <section class="landing landing-blocks">
          <div class="block-copy">
            <div class="eyebrow">${esc(profile.landingLabel)}</div>
            <h1>${esc(day.title || data.title)}</h1>
            <p>${esc(profile.landingLine)}</p>
          </div>
          ${renderImage(hero, 'block-photo', `${data.title || 'Trip'} hero photo`)}
          <div class="block-days">${dayChips}</div>
        </section>
      `;
    }

    return `
      <section class="landing landing-bay">
        ${hero ? `<img class="landing-bg" src="./${attr(hero.localPath)}" alt="${attr(mediaAlt(hero, 'Singapore skyline'))}">` : ''}
        <div class="landing-shade"></div>
        <div class="landing-copy">
          <div class="eyebrow">${esc(profile.landingLabel)}</div>
          <h1>${esc(data.title || 'Happy Trip')}</h1>
          <p>${esc(profile.landingLine)}</p>
          <div class="motif-row">${motif}</div>
        </div>
        <div class="landing-summary">
          <div><span>天数</span><strong>${data.days.length} 天</strong></div>
          <div><span>当前</span><strong>Day ${day.n}</strong></div>
          <div><span>进度</span><strong>${completion.done}/${completion.total}</strong></div>
        </div>
      </section>
      ${renderQuickLinks(day)}
    `;
  }

  function renderDayFeature(day, completion){
    const asset = dayHeroAsset(day);
    return `
      <section class="day-feature">
        ${renderImage(asset, 'day-feature-photo', `${day.city || day.title} trip photo`)}
        <div class="day-feature-copy">
          <div class="feature-meta">${esc([day.date, day.city, day.areaLabel].filter(Boolean).join(' · '))}</div>
          <h2>${esc(day.title)}</h2>
          <p>${esc(day.themeLabel || getUiOption().name || '')}</p>
          <div class="progress">
            <div>${completion.done}/${completion.total} 完成</div>
            <div class="bar"><div class="fill" style="width:${completion.pct}%"></div></div>
          </div>
        </div>
      </section>
    `;
  }

  function renderItem(item, dayN, periodKey, idx){
    const id = `d${dayN}-${periodKey}-${idx}`;
    const done = !!getDone()[id];
    const tagClass = item.tag ? `tag-${attr(item.tag)}` : '';
    const links = (item.links || []).map(link => renderLink(link)).join('');
    const imgs = item.img ? (Array.isArray(item.img) ? item.img : [item.img]) : null;

    return `
      <article class="item ${done ? 'done' : ''}" data-id="${attr(id)}">
        <button class="it-check" aria-label="标记为已完成">${ICONS.check}</button>
        <div class="it-body">
          <div class="it-time">${esc(item.time || '')}</div>
          <div class="it-title">
            ${esc(item.title)}
            ${item.tagText ? `<span class="it-tag ${tagClass}">${esc(item.tagText)}</span>` : ''}
          </div>
          ${item.subtitle ? `<div class="it-subtitle">${esc(item.subtitle)}</div>` : ''}
          ${imgs ? imgs.map(img => renderImage(img, 'it-media', img.alt || img.caption || 'Trip photo')).join('') : ''}
          ${item.note ? `<div class="it-note">${esc(item.note)}</div>` : ''}
          ${links ? `<div class="links">${links}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderPeriod(periodKey, items, dayN){
    if (!items || items.length === 0) return '';
    const [label, descriptor, range, iconKey] = getProfile().periods[periodKey];
    return `
      <section class="period period-${periodKey}">
        <div class="period-head">
          <div class="icon">${ICONS[iconKey]}</div>
          <div class="label-wrap">
            <div class="label-main">${label}</div>
            <div class="label-sub">${descriptor}</div>
          </div>
          <div class="time-range">${range}</div>
        </div>
        <div class="items">
          ${items.map((item, index) => renderItem(item, dayN, periodKey, index)).join('')}
        </div>
      </section>
    `;
  }

  function renderDay(){
    const day = data.days.find(entry => entry.n === activeDay);
    if (!day) return;

    const completion = completionForDay(day);
    if (topMeta) topMeta.textContent = `DAY ${String(day.n).padStart(2, '0')} · ${day.areaLabel || day.city || ''}`;
    if (topCn) topCn.textContent = day.title || data.title || 'Happy Trip';

    main.innerHTML = `
      ${renderLanding(day, completion)}
      ${renderDayFeature(day, completion)}
      ${renderMapOverview(day)}
      ${renderPeriod('morning', day.morning, day.n)}
      ${renderPeriod('afternoon', day.afternoon, day.n)}
      ${renderPeriod('evening', day.evening, day.n)}

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

    main.querySelectorAll('[data-landing-day]').forEach(button => {
      button.addEventListener('click', () => setActiveDay(Number(button.getAttribute('data-landing-day'))));
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
