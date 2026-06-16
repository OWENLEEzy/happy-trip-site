(function(){
  const data = window.HAPPY_TRIP_DATA || {meta: {}, ui: {}, generalResources: {}, days: []};
  const ui = window.HappyTripUIComponents;
  const mapRuntime = window.HappyTripMap;
  const meta = data.meta || {};
  const days = Array.isArray(data.days) ? data.days : [];
  const tripSlug = meta.tripSlug || 'trip';

  function todayISO(){
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
  const TODAY_INDEX = window.TravelHelpers.matchTodayIndex(days, todayISO());

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

  const KEY_VIEW = `happyTrip.${tripSlug}.activeView`;
  const KEY_DONE = `happyTrip.${tripSlug}.done`;
  let activeView = localStorage.getItem(KEY_VIEW) || (hasResources() ? 'general' : `day:${days[0]?.n || 1}`);

  function option(){
    return data.ui?.confirmed_option || data.ui?.confirmedOption || {};
  }

  function hasResources(){
    const resources = data.generalResources;
    return !!resources && (
      Boolean(resources.title) ||
      (Array.isArray(resources.sections) && resources.sections.length) ||
      (Array.isArray(resources.links) && resources.links.length)
    );
  }

  function allItems(day){
    return ['morning', 'afternoon', 'evening'].flatMap(key =>
      (Array.isArray(day[key]) ? day[key] : []).map((item, index) => ({item, key, index}))
    );
  }

  function getDone(){
    try { return JSON.parse(localStorage.getItem(KEY_DONE) || '{}'); }
    catch(e){ return {}; }
  }

  function setDone(map){
    localStorage.setItem(KEY_DONE, JSON.stringify(map));
  }

  function activeDayNumber(){
    if (!activeView.startsWith('day:')) return days[0]?.n || 1;
    return Number(activeView.slice(4)) || days[0]?.n || 1;
  }

  function currentDay(){
    const n = activeDayNumber();
    return days.find(day => Number(day.n) === n) || days[0];
  }

  function completionForDay(day){
    const doneMap = getDone();
    let total = 0;
    let done = 0;
    allItems(day).forEach(({key, index}) => {
      total++;
      if (doneMap[`d${day.n}-${key}-${index}`]) done++;
    });
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function uniqueDayLinks(day){
    const seen = new Set();
    const links = [];
    allItems(day).forEach(({item}) => {
      (item.links || []).forEach(link => {
        if (!link?.url || seen.has(link.url)) return;
        seen.add(link.url);
        links.push({ ...link, itemTitle: item.title });
      });
    });
    return links;
  }

  function applyUiTokens(){
    const selected = option();
    const palette = selected.palette || {};
    const typography = selected.typography || {};
    const root = document.documentElement;
    const tokens = {
      '--color-bg': palette.background || '#f2f2ef',
      '--color-surface': palette.surface || '#ffffff',
      '--color-ink': palette.ink || '#202426',
      '--color-muted': palette.muted || '#6a7072',
      '--color-accent': palette.accent || '#66737a',
      '--color-accent-2': palette.accent2 || '#a27454',
      '--color-line': palette.line || 'rgba(32,36,38,.14)'
    };
    Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
    if (typography.sans) root.style.setProperty('--sans', typography.sans);
    if (typography.serif) root.style.setProperty('--serif', typography.serif);
    document.body.dataset.theme = selected.id || 'happy-trip';
    document.body.dataset.layoutProfile = selected.layout_profile || 'neutral-runtime';
    document.body.dataset.density = selected.density || 'standard';
    document.body.dataset.navigation = selected.navigation || 'topbar-drawer';
    document.body.dataset.heroTreatment = selected.hero_treatment || 'full-bleed-photo';
    document.body.dataset.cardTreatment = selected.card_treatment || 'timeline-cards';
    document.body.dataset.linkTreatment = selected.link_treatment || 'pill-cluster';
    document.body.dataset.mapTreatment = selected.map_treatment || 'marker-map';
    document.body.dataset.motionLevel = selected.motion_level || 'subtle';
  }

  function applyAesthetic(){
    const selected = option();
    const built = window.TravelHelpers.buildAesthetic(selected.aesthetic);
    const root = document.documentElement;
    Object.entries(built.vars).forEach(([key, value]) => root.style.setProperty(key, value));
    if (built.fontHref && !document.getElementById('destFont')) {
      const link = document.createElement('link');
      link.id = 'destFont';
      link.rel = 'stylesheet';
      link.href = built.fontHref;
      document.head.appendChild(link);
    }
    const glyphEl = document.getElementById('destGlyph');
    if (glyphEl) {
      if (built.glyph) {
        glyphEl.textContent = built.glyph.mark;
        glyphEl.style.setProperty('--glyph-rotate', `${built.glyph.rotate}deg`);
        glyphEl.dataset.on = '1';
      } else {
        glyphEl.dataset.on = '0';
      }
    }
  }

  function setStaticShell(){
    const selected = option();
    const title = meta.tripTitle || 'Happy Trip';
    document.title = title;
    if (topCn) topCn.textContent = title;
    if (sidebarTitle) {
      sidebarTitle.textContent = '';
      const name = document.createElement('span');
      name.textContent = title;
      const count = document.createElement('em');
      count.textContent = `${days.length} days`;
      sidebarTitle.append(name, count);
    }
    if (sidebarSub) sidebarSub.textContent = meta.dateRange || selected.name || 'Travel plan';
    if (sidebarPrimaryMeta) sidebarPrimaryMeta.textContent = selected.name || 'Trip UI';
    if (sidebarSecondaryMeta) sidebarSecondaryMeta.textContent = selected.density || 'mobile';
    if (themeBadgeText) themeBadgeText.textContent = (selected.id || 'TRIP').slice(0, 8).toUpperCase();
  }

  function setActiveView(view){
    activeView = view;
    localStorage.setItem(KEY_VIEW, view);
    render();
  }

  function renderSidebar(){
    dayList.querySelectorAll('.day-item, .general-item').forEach(node => node.remove());
    if (hasResources()) {
      const resource = document.createElement('button');
      resource.className = 'day-item general-item' + (activeView === 'general' ? ' active' : '');
      resource.innerHTML = `
        <div class="di-num"><div class="small">ALL</div><div class="big">INFO</div></div>
        <div class="di-text"><span class="di-date">General</span><span class="di-where">${ui.esc(data.generalResources.title || 'Shared resources')}</span></div>
      `;
      resource.addEventListener('click', () => {
        setActiveView('general');
        closeSidebar();
      });
      dayList.appendChild(resource);
    }
    days.forEach((day, idx) => {
      const view = `day:${day.n}`;
      const isToday = idx === TODAY_INDEX;
      const btn = document.createElement('button');
      btn.className = 'day-item' + (activeView === view ? ' active' : '') + (isToday ? ' today' : '');
      btn.innerHTML = `
        <div class="di-num"><div class="small">DAY</div><div class="big">${String(day.n).padStart(2, '0')}</div></div>
        <div class="di-text">
          <span class="di-date">${ui.esc(day.date)}${isToday ? '<em class="today-badge">今天</em>' : ''}</span>
          <span class="di-where">${ui.esc([day.city, day.areaLabel].filter(Boolean).join(' · '))}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        setActiveView(view);
        closeSidebar();
      });
      if (isToday) requestAnimationFrame(() => btn.scrollIntoView({ block: 'nearest' }));
      dayList.appendChild(btn);
    });
    renderBottomTabs();
  }

  function renderBottomTabs(){
    if (!bottomDayTabs) return;
    bottomDayTabs.innerHTML = days.map((day, idx) => {
      const view = `day:${day.n}`;
      const todayCls = idx === TODAY_INDEX ? ' today' : '';
      return `
        <button class="bottom-day-tab ${activeView === view ? 'active' : ''}${todayCls}" data-bottom-view="${view}">
          <span>Day ${day.n}</span>
          <strong>${ui.esc(day.themeLabel || day.title || '')}</strong>
        </button>
      `;
    }).join('');
    bottomDayTabs.querySelectorAll('[data-bottom-view]').forEach(button => {
      button.addEventListener('click', () => setActiveView(button.getAttribute('data-bottom-view')));
    });
  }

  function renderResourceLinks(links){
    if (!Array.isArray(links) || !links.length) return '';
    const ordered = window.TravelHelpers.sortLinksByPriority(links);
    return `<div class="links">${ordered.map(link => ui.renderLink(link)).join('')}</div>`;
  }

  function renderResourcePoints(points){
    if (!Array.isArray(points) || !points.length) return '';
    return `<ul class="resource-points">${points.map(point => `<li>${ui.esc(point)}</li>`).join('')}</ul>`;
  }

  function renderResourceSteps(steps){
    if (!Array.isArray(steps) || !steps.length) return '';
    return `
      <div class="resource-steps">
        ${steps.map((step, index) => `
          <div class="resource-step">
            <div class="resource-step-index">${String(index + 1).padStart(2, '0')}</div>
            <div>
              <h4>${ui.esc(step.title || '')}</h4>
              ${step.body ? `<p>${ui.esc(step.body)}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderGeneralResources(){
    const resources = data.generalResources || {};
    if (topMeta) topMeta.textContent = 'GENERAL';
    if (topCn) topCn.textContent = resources.title || meta.tripTitle || 'Trip resources';
    const sections = Array.isArray(resources.sections) ? resources.sections : [];
    main.innerHTML = `
      <section class="landing landing-metro">
        <div class="landing-copy">
          <div class="eyebrow">Shared Trip Resources</div>
          <h1>${ui.esc(resources.title || meta.tripTitle || 'Trip resources')}</h1>
          ${resources.summary ? `<p>${ui.esc(resources.summary)}</p>` : ''}
        </div>
        <div class="metro-board">
          <div class="metro-board-title">Quick References</div>
          ${renderResourceLinks(resources.links || [])}
        </div>
      </section>
      <section class="resource-sections">
        ${sections.map(section => `
          <article class="resource-card">
            ${section.kicker || section.category ? `<div class="resource-card-meta">${ui.esc(section.kicker || section.category)}</div>` : ''}
            <h2>${ui.esc(section.title || 'Resource')}</h2>
            ${section.note ? `<p>${ui.esc(section.note)}</p>` : ''}
            ${ui.renderImage(section.image, 'resource-card-image', section.title || '')}
            ${renderResourcePoints(section.points || section.items)}
            ${renderResourceSteps(section.steps)}
            ${renderResourceLinks(section.links || [])}
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderRoutePins(route, routeUrl){
    return (route?.stops || []).map((stop, index) => {
      const order = String(index + 1).padStart(2, '0');
      const name = stop.label || stop.query || ('Stop ' + order);
      const href = stop.query ? ui.mapSearchUrl(stop.query) : routeUrl;
      return `
        <a class="route-pin route-pin-link" href="${ui.attr(href)}" target="_blank" rel="noopener noreferrer">
          <span class="route-pin-index">${order}</span>
          <span class="route-pin-label"><span class="route-pin-name">${ui.esc(name)}</span></span>
        </a>
      `;
    }).join('');
  }

  function renderMapOverview(day){
    const route = day.routeOverview;
    const sections = Array.isArray(route?.sections) ? route.sections : [];
    const firstRoute = route?.stops?.length ? route : sections.find(section => section.stops?.length);
    if (!firstRoute) return '';
    const routeUrl = ui.directionsUrl(firstRoute);
    const hasCoords = (firstRoute.stops || []).some(stop =>
      Number.isFinite(Number(stop?.lat)) && Number.isFinite(Number(stop?.lng)));
    const mapId = `route-map-${day.n}`;
    if (hasCoords) {
      setTimeout(() => {
        const node = document.getElementById(mapId);
        if (node && mapRuntime) mapRuntime.renderMarkerMap(node, firstRoute, routeUrl);
      }, 0);
    }
    const stage = hasCoords
      ? `<div class="map-overview-stage marker-map-stage" id="${mapId}" data-map-state="leaflet"></div>`
      : '';
    return `
      <section class="map-overview-card">
        ${stage}
        <div class="map-overview-body">
          <div class="map-overview-meta">
            <div>
              <div class="map-overview-title">${ui.esc(firstRoute.title || route.title || 'Route overview')}</div>
              <div class="map-overview-sub">${(firstRoute.stops || []).length} stops · ${ui.esc(firstRoute.mode || route.mode || 'route')}</div>
            </div>
            ${routeUrl ? `<a class="map-route-link" href="${ui.attr(routeUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Maps ${ui.ICONS.arr}</a>` : ''}
          </div>
          <div class="route-pins" aria-label="Route stops">${renderRoutePins(firstRoute, routeUrl)}</div>
        </div>
      </section>
    `;
  }

  function renderLanding(day, completion){
    const selected = option();
    const hero = day.hero || meta.hero;
    const heroSrc = hero?.url || hero?.src || hero?.local_path || hero?.localPath || '';
    const resolvedHeroSrc = /^https?:\/\//.test(heroSrc) || heroSrc.startsWith('./') ? heroSrc : `./${heroSrc}`;
    const motifs = (selected.motifs || []).map(text => `<span>${ui.esc(text)}</span>`).join('');
    return `
      <section class="landing landing-bay">
        ${heroSrc ? `<img class="landing-bg" src="${ui.attr(resolvedHeroSrc)}" alt="${ui.attr(hero.alt || hero.query || day.title || meta.tripTitle)}">` : ''}
        <div class="landing-shade"></div>
        <div class="landing-copy">
          <div class="eyebrow"><span>${ui.esc([day.date, day.city, day.areaLabel].filter(Boolean).join(' · '))}</span></div>
          <h1>${ui.esc(day.title || meta.tripTitle)}</h1>
          <p>${ui.esc(day.themeLabel || selected.reason || '')}</p>
          <div class="motif-row">${motifs}</div>
        </div>
        <div class="landing-summary">
          <div><span>Days</span><strong>${days.length}</strong></div>
          <div><span>Current</span><strong>Day ${day.n}</strong></div>
          <div><span>Done</span><strong>${completion.done}/${completion.total}</strong></div>
        </div>
      </section>
      ${renderQuickLinks(day)}
    `;
  }

  function renderQuickLinks(day){
    // Relabel generic map links with the place name so the panel reads as a
    // named stop list, not a column of identical "Google Maps" pills.
    const links = window.TravelHelpers.sortLinksByPriority(uniqueDayLinks(day)).slice(0, 8)
      .map(link => {
        const generic = !link.label || /^(google maps|maps|open)$/i.test(link.label.trim());
        return (generic && link.itemTitle) ? { ...link, label: link.itemTitle } : link;
      });
    if (!links.length) return '';
    return `
      <section class="quick-links-panel">
        <div class="quick-head"><span>Quick Links</span><em>${links.length}</em></div>
        <div class="quick-links">${links.map(link => ui.renderLink(link, 'quick-link')).join('')}</div>
      </section>
    `;
  }

  function renderDayFeature(day, completion){
    return `
      <section class="day-feature">
        ${ui.renderImage(day.hero, 'day-feature-photo', `${day.city || day.title} travel visual`)}
        <div class="day-feature-copy">
          <div class="feature-meta">${ui.esc([day.date, day.city, day.areaLabel].filter(Boolean).join(' · '))}</div>
          <h2>${ui.esc(day.title)}</h2>
          <p>${ui.esc(day.themeLabel || '')}</p>
          <div class="progress">
            <div>${completion.done}/${completion.total} complete</div>
            <div class="bar"><div class="fill" style="width:${completion.pct}%"></div></div>
          </div>
        </div>
      </section>
    `;
  }

  function dayRouteStops(day){
    const route = day && day.routeOverview;
    if (!route) return [];
    if (Array.isArray(route.stops) && route.stops.length) return route.stops;
    const subs = Array.isArray(route.sections) ? route.sections : [];
    const sec = subs.find(s => Array.isArray(s.stops) && s.stops.length);
    return sec ? sec.stops : [];
  }

  function mapStopNumberMap(day){
    const map = new Map();
    dayRouteStops(day).forEach((stop, i) => {
      const order = String(i + 1).padStart(2, '0');
      if (stop.label) map.set(stop.label, order);
      if (stop.query) map.set(stop.query, order);
    });
    return map;
  }

  function renderMapSeqBadge(item, numberMap){
    const nums = (item.mapStopLabels || []).map(label => numberMap.get(label)).filter(Boolean);
    if (!nums.length) return '';
    return `<span class="it-map-seq" aria-label="Route stop">${nums.join(' · ')}</span>`;
  }

  function renderItem(item, dayN, periodKey, idx){
    const id = `d${dayN}-${periodKey}-${idx}`;
    const done = !!getDone()[id];
    const links = window.TravelHelpers.sortLinksByPriority(item.links || []).map(link => ui.renderLink(link)).join('');
    const tagClass = item.tag ? ` tag-${item.tag}` : '';
    const mapSeq = renderMapSeqBadge(item, mapStopNumberMap(currentDay()));
    return `
      <article class="item ${done ? 'done' : ''}" data-id="${ui.attr(id)}">
        <button class="it-check" aria-label="Toggle completed">${ui.ICONS.check}</button>
        <div class="it-body">
          <div class="it-time">${ui.esc(item.time || '')}</div>
          <div class="it-title">
            ${mapSeq}
            ${ui.esc(item.title)}
            ${item.tagText ? `<span class="it-tag${tagClass}">${ui.esc(item.tagText)}</span>` : ''}
          </div>
          ${item.subtitle ? `<div class="it-subtitle">${ui.esc(item.subtitle)}</div>` : ''}
          ${!mapSeq ? ui.renderStopLabels(item.mapStopLabels) : ''}
          ${ui.renderImage(item.image, 'it-media', item.title || '')}
          ${item.note ? `<div class="it-note">${ui.esc(item.note)}</div>` : ''}
          ${ui.renderItemSections(item.sections)}
          ${links ? `<div class="links">${links}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderPeriod(periodKey, items, dayN){
    if (!Array.isArray(items) || !items.length) return '';
    const [label, descriptor, range, iconKey] = ui.PERIODS[periodKey];
    return `
      <section class="period period-${periodKey}">
        <div class="period-head">
          <div class="icon">${ui.ICONS[iconKey]}</div>
          <div class="label-wrap"><div class="label-main">${label}</div><div class="label-sub">${descriptor}</div></div>
          <div class="time-range">${range}</div>
        </div>
        <div class="items">${items.map((item, index) => renderItem(item, dayN, periodKey, index)).join('')}</div>
      </section>
    `;
  }

  function renderDayFoot(day){
    return `
      <div class="day-foot">
        <button class="nav-btn prev" ${day.n <= 1 ? 'disabled' : ''} data-nav-day="${day.n - 1}">
          <span class="nb-label">Previous</span>
          <span class="nb-title">${day.n > 1 ? ui.esc(days[day.n - 2].title) : '-'}</span>
        </button>
        <button class="nav-btn next" ${day.n >= days.length ? 'disabled' : ''} data-nav-day="${day.n + 1}">
          <span class="nb-label">Next</span>
          <span class="nb-title">${day.n < days.length ? ui.esc(days[day.n].title) : '-'}</span>
        </button>
      </div>
    `;
  }

  function buildParts(day, completion){
    return {
      landing: renderLanding(day, completion),
      mapOverview: renderMapOverview(day),
      periods: {
        morning: renderPeriod('morning', day.morning, day.n),
        afternoon: renderPeriod('afternoon', day.afternoon, day.n),
        evening: renderPeriod('evening', day.evening, day.n),
      },
      items: allItems(day).map(({item, key, index}) => renderItem(item, day.n, key, index)),
      foot: renderDayFoot(day),
    };
  }

  function renderDay(){
    const day = currentDay();
    if (!day) return;
    const completion = completionForDay(day);
    if (topMeta) topMeta.textContent = `DAY ${String(day.n).padStart(2, '0')} · ${day.areaLabel || day.city || ''}`;
    if (topCn) topCn.textContent = day.title || meta.tripTitle || 'Happy Trip';
    const selected = option();
    const layoutApi = window.HappyTripLayouts;
    const parts = buildParts(day, completion);
    if (layoutApi && layoutApi.registry) {
      // ?layout=<name> previews any theme on the live site without editing data;
      // otherwise resolve the composer from the option (explicit layout, else its
      // archetype). Unknown values fall back to classic.
      var previewLayout = new URLSearchParams(window.location.search).get('layout');
      const layoutKey = previewLayout
        ? layoutApi.pick(previewLayout)
        : (layoutApi.resolve ? layoutApi.resolve(selected) : layoutApi.pick(selected.layout));
      document.body.dataset.layout = layoutKey;
      main.innerHTML = (layoutApi.registry[layoutKey] || layoutApi.registry.classic)(parts);
    } else {
      // travel-layouts.js missing — fall back to the classic order inline so the page still renders.
      document.body.dataset.layout = 'classic';
      main.innerHTML = [
        parts.landing, parts.mapOverview,
        parts.periods.morning, parts.periods.afternoon, parts.periods.evening,
        parts.foot,
      ].join('');
    }
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
    main.querySelectorAll('[data-nav-day]').forEach(button => {
      button.addEventListener('click', () => {
        const next = Number(button.getAttribute('data-nav-day'));
        if (next >= 1 && next <= days.length) {
          setActiveView(`day:${next}`);
          window.scrollTo({top: 0, behavior: 'smooth'});
        }
      });
    });
  }

  function render(){
    renderSidebar();
    if (activeView === 'general' && hasResources()) renderGeneralResources();
    else renderDay();
  }

  function openSidebar(){
    sidebar.classList.add('open');
    scrim.classList.add('open');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar(){
    sidebar.classList.remove('open');
    scrim.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (scrim) scrim.addEventListener('click', closeSidebar);

  applyUiTokens();
  applyAesthetic();
  setStaticShell();
  render();
})();
