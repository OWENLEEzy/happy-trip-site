(function(){
  const LEAFLET_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  let leafletPromise = null;
  const activeMaps = new Map();

  function loadLeaflet(){
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = LEAFLET_URL;
      script.async = true;
      script.crossOrigin = '';
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Leaflet loader failed'));
      document.head.appendChild(script);
    });
    return leafletPromise;
  }

  function stopHasCoords(stop){
    return Number.isFinite(Number(stop?.lat)) && Number.isFinite(Number(stop?.lng));
  }

  function markerHtml(label){
    return `<span class="leaflet-stop-marker">${String(label || '').replace(/[&<>"']/g, '')}</span>`;
  }

  function renderFallback(container, route, directionsUrl){
    // The stop list is rendered once by the card body (renderRoutePins).
    // This fallback only fires when the map cannot load, so keep it to a
    // short note + directions link and never duplicate the stop list.
    container.innerHTML = `
      <div class="map-fallback">
        <div class="map-fallback-title">Map could not load · stops are listed below.</div>
        <a class="map-route-link" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Open route in Google Maps</a>
      </div>
    `;
  }

  function renderMarkerMap(container, route, directionsUrl){
    const stops = (route?.stops || []).filter(stopHasCoords);
    if (!stops.length) {
      renderFallback(container, route, directionsUrl);
      return;
    }
    const id = container.id || `happy-trip-map-${Math.random().toString(36).slice(2)}`;
    container.id = id;
    container.innerHTML = '<div class="leaflet-map-canvas"></div><button class="map-fullscreen" type="button">Fullscreen</button>';
    const canvas = container.querySelector('.leaflet-map-canvas');
    loadLeaflet().then(L => {
      if (activeMaps.has(id)) activeMaps.get(id).remove();
      const map = L.map(canvas, {scrollWheelZoom: false, tap: true});
      activeMaps.set(id, map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      const latLngs = stops.map(stop => [Number(stop.lat), Number(stop.lng)]);
      stops.forEach((stop, index) => {
        const label = stop.label || String(index + 1).padStart(2, '0');
        const icon = L.divIcon({
          className: 'leaflet-stop-icon',
          html: markerHtml(label),
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        L.marker([Number(stop.lat), Number(stop.lng)], {icon})
          .addTo(map)
          .bindPopup(`<strong>${label}</strong><br>${stop.query || ''}`);
      });
      if (latLngs.length > 1) L.polyline(latLngs, {color: '#1f6f68', weight: 4, opacity: .8}).addTo(map);
      map.fitBounds(latLngs, {padding: [28, 28], maxZoom: route.zoom || 14});
      setTimeout(() => map.invalidateSize(), 80);
    }).catch(() => renderFallback(container, route, directionsUrl));

    container.querySelector('.map-fullscreen').addEventListener('click', () => {
      container.classList.toggle('fullscreen');
      const map = activeMaps.get(id);
      if (map) setTimeout(() => map.invalidateSize(), 120);
    });
  }

  window.HappyTripMap = {
    loadLeaflet,
    renderMarkerMap,
    renderFallback
  };
})();
