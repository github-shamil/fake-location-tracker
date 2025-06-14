// ========== MAP SETUP ==========
const map = L.map('map').setView([25.276987, 51.520008], 13); // Fake marker in Qatar

const maptilerApiKey = 'VcSgtSTkXfCbU3n3RqBO';

L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}@2x.png?key=${maptilerApiKey}`, {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

// ========== FAKE MARKER ==========
let fakeMarker = L.marker([25.276987, 51.520008]).addTo(map);

// Remove on double-click
fakeMarker.on('dblclick', () => {
  map.removeLayer(fakeMarker);
});

// ========== BUTTON TOGGLES ==========
const searchIcon = document.getElementById("search-icon");
const searchBox = document.getElementById("search-box");
const searchClose = document.getElementById("search-close");

const directionIcon = document.getElementById("direction-icon");
const directionBox = document.getElementById("direction-box");
const directionClose = document.getElementById("direction-close");

searchIcon.addEventListener("click", () => {
  searchBox.style.display = "flex";
  directionBox.style.display = "none";
});
searchClose.addEventListener("click", () => {
  searchBox.style.display = "none";
});

directionIcon.addEventListener("click", () => {
  directionBox.style.display = "flex";
  searchBox.style.display = "none";
});
directionClose.addEventListener("click", () => {
  directionBox.style.display = "none";
});

// ========== AUTOCOMPLETE (Nominatim) ==========
async function autocomplete(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=en&limit=5`;
  const res = await fetch(url);
  return await res.json();
}

// ========== SEARCH MARKER ==========
document.getElementById("search-button").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  const results = await autocomplete(query);
  if (results.length > 0) {
    const { lat, lon, display_name } = results[0];
    map.setView([lat, lon], 14);
    if (fakeMarker) map.removeLayer(fakeMarker);
    fakeMarker = L.marker([lat, lon]).addTo(map).bindPopup(display_name).openPopup();
  }
});

// ========== DIRECTION ROUTING ==========
const control = L.Routing.control({
  waypoints: [],
  routeWhileDragging: false,
  showAlternatives: true,
  geocoder: L.Control.Geocoder.nominatim(),
  router: L.Routing.osrmv1({ language: 'en', profile: 'car' }),
  createMarker: function(i, waypoint, n) {
    return L.marker(waypoint.latLng, { draggable: true });
  }
}).addTo(map);

document.getElementById("direction-button").addEventListener("click", async () => {
  const start = document.getElementById("start-input").value.trim();
  const end = document.getElementById("end-input").value.trim();
  if (!start || !end) return;

  const [res1, res2] = await Promise.all([autocomplete(start), autocomplete(end)]);

  if (res1.length > 0 && res2.length > 0) {
    const startCoords = L.latLng(res1[0].lat, res1[0].lon);
    const endCoords = L.latLng(res2[0].lat, res2[0].lon);
    control.setWaypoints([startCoords, endCoords]);

    if (fakeMarker) map.removeLayer(fakeMarker);
  }
});

// ========== LIVE LOCATION BUTTON ==========
document.getElementById("live-location-icon").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const liveMarker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup("You are here").openPopup();
    map.setView([latitude, longitude], 15);
  }, () => {
    alert("Location permission denied.");
  });
});
