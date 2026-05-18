(function(){
  const data = window.HAPPY_TRIP_DATA || {meta: {}, ui: {}, generalResources: {}, days: []};
  const ui = window.HappyTripUIComponents;
  const mapRuntime = window.HappyTripMap;
  const meta = data.meta || {};
  const days = Array.isArray(data.days) ? data.days : [];
  const tripSlug = meta.tripSlug || 'trip';

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
    days.forEach(day => {
      const view = `day:${day.n}`;
      const btn = document.createElement('button');
      btn.className = 'day-item' + (activeView === view ? ' active' : '');
      btn.innerHTML = `
        <div class="di-num"><div class="small">DAY</div><div class="big">${String(day.n).padStart(2, '0')}</div></div>
        <div class="di-text">
          <span class="di-date">${ui.esc(day.date)}</span>
          <span class="di-where">${ui.esc([day.city, day.areaLabel].filter(Boolean).join(' · '))}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        setActiveView(view);
        closeSidebar();
      });
      dayList.appendChild(btn);
    });
    renderBottomTabs();
  }

  function renderBottomTabs(){
    if (!bottomDayTabs) return;
    bottomDayTabs.innerHTML = days.map(day => {
      const view = `day:${day.n}`;
      return `
        <button class="bottom-day-tab ${activeView === view ? 'active' : ''}" data-bottom-view="${view}">
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
    return `<div class="links">${links.map(link => ui.renderLink(link)).join('')}</div>`;
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
            <h2>${ui.esc(section.title || 'Resource')}</h2>
            ${section.note ? `<p>${ui.esc(section.note)}</p>` : ''}
            ${Array.isArray(section.items) ? `<ul>${section.items.map(item => `<li>${ui.esc(item)}</li>`).join('')}</ul>` : ''}
            ${renderResourceLinks(section.links || [])}
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderRoutePins(route, routeUrl){
    return (route?.stops || []).map((stop, index) => {
      const label = stop.label || String(index + 1).padStart(2, '0');
      const href = stop.query ? ui.mapSearchUrl(stop.query) : routeUrl;
      return `
        <a class="route-pin route-pin-link" href="${ui.attr(href)}" target="_blank" rel="noopener noreferrer">
          <span class="route-pin-index">${ui.esc(label)}</span>
          <span class="route-pin-label">${ui.esc(stop.query || stop.title || label)}</span>
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
    const mapId = `route-map-${day.n}`;
    setTimeout(() => {
      const node = document.getElementById(mapId);
      if (node && mapRuntime) mapRuntime.renderMarkerMap(node, firstRoute, routeUrl);
    }, 0);
    return `
      <section class="map-overview-card">
        <div class="map-overview-stage marker-map-stage" id="${mapId}" data-map-state="leaflet"></div>
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
          <div class="eyebrow">${ui.esc([day.date, day.city, day.areaLabel].filter(Boolean).join(' · '))}</div>
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
    const links = uniqueDayLinks(day).slice(0, 8);
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

  function renderItem(item, dayN, periodKey, idx){
    const id = `d${dayN}-${periodKey}-${idx}`;
    const done = !!getDone()[id];
    const links = (item.links || []).map(link => ui.renderLink(link)).join('');
    const sections = Array.isArray(item.sections) ? item.sections : [];
    return `
      <article class="item ${done ? 'done' : ''}" data-id="${ui.attr(id)}">
        <button class="it-check" aria-label="Toggle completed">${ui.ICONS.check}</button>
        <div class="it-body">
          <div class="it-time">${ui.esc(item.time || '')}</div>
          <div class="it-title">
            ${ui.esc(item.title)}
            ${item.tagText ? `<span class="it-tag">${ui.esc(item.tagText)}</span>` : ''}
          </div>
          ${item.subtitle ? `<div class="it-subtitle">${ui.esc(item.subtitle)}</div>` : ''}
          ${ui.renderStopLabels(item.mapStopLabels)}
          ${item.note ? `<div class="it-note">${ui.esc(item.note)}</div>` : ''}
          ${sections.map(section => `<div class="it-note"><strong>${ui.esc(section.title || '')}</strong> ${ui.esc(section.note || '')}</div>`).join('')}
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

  function renderDay(){
    const day = currentDay();
    if (!day) return;
    const completion = completionForDay(day);
    if (topMeta) topMeta.textContent = `DAY ${String(day.n).padStart(2, '0')} · ${day.areaLabel || day.city || ''}`;
    if (topCn) topCn.textContent = day.title || meta.tripTitle || 'Happy Trip';
    main.innerHTML = `
      ${renderLanding(day, completion)}
      ${renderDayFeature(day, completion)}
      ${renderMapOverview(day)}
      ${renderPeriod('morning', day.morning, day.n)}
      ${renderPeriod('afternoon', day.afternoon, day.n)}
      ${renderPeriod('evening', day.evening, day.n)}
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
  setStaticShell();
  render();
})();
