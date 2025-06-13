// Initialize Map
const map = L.map('map').setView([25.276987, 55.296249], 13); // Default fake: Dubai

// Load styled MapTiler tiles
L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  attribution: '&copy; MapTiler, OpenStreetMap',
  tileSize: 256,
}).addTo(map);

// Marker placeholder
let fakeMarker = L.marker([25.276987, 55.296249]).addTo(map).bindPopup("You're here").openPopup();

// Toggle panels
const searchPanel = document.querySelector('.floating-search');
const directionPanel = document.getElementById('direction-panel');

document.getElementById('search-toggle').addEventListener('click', () => {
  searchPanel.style.display = searchPanel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('direction-toggle').addEventListener('click', () => {
  directionPanel.style.display = directionPanel.style.display === 'block' ? 'none' : 'block';
});

// Search
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=VcSgtSTkXfCbU3n3RqBO`)
    .then(res => res.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        if (fakeMarker) map.removeLayer(fakeMarker);
        fakeMarker = L.marker([lat, lon]).addTo(map).bindPopup("You're here").openPopup();
        map.setView([lat, lon], 14);
      } else {
        alert("Location not found");
      }
    });
});

// Directions
let control;
document.getElementById('get-direction-btn').addEventListener('click', () => {
  const start = document.getElementById('start').value.trim();
  const end = document.getElementById('end').value.trim();
  if (!start || !end) return;

  Promise.all([
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(start)}.json?key=VcSgtSTkXfCbU3n3RqBO`).then(res => res.json()),
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(end)}.json?key=VcSgtSTkXfCbU3n3RqBO`).then(res => res.json())
  ]).then(([startData, endData]) => {
    const startCoords = startData.features[0].center.reverse();
    const endCoords = endData.features[0].center.reverse();

    if (control) map.removeControl(control);
    control = L.Routing.control({
      waypoints: [L.latLng(...startCoords), L.latLng(...endCoords)],
      routeWhileDragging: false,
      createMarker: () => null,
      show: false
    }).addTo(map);
  });
});

// Live location
document.getElementById('live-location-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    if (fakeMarker) map.removeLayer(fakeMarker);
    fakeMarker = L.marker([lat, lon]).addTo(map).bindPopup("Your current location").openPopup();
    map.setView([lat, lon], 15);

    // Send to backend for logging
    fetch('geo-capture.js').catch(() => {}); // passive
  }, () => {
    alert("Location access denied.");
  });
});

// Allow double click to remove marker
map.on('dblclick', () => {
  if (fakeMarker) map.removeLayer(fakeMarker);
});
