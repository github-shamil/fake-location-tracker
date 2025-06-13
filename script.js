// ================== MAP SETUP =====================
const map = L.map('map').setView([25.276987, 51.520008], 13); // Fake location: Qatar

L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY`, {
  tileSize: 512,
  zoomOffset: -1,
  attribution: '© MapTiler © OpenStreetMap',
  crossOrigin: true,
  lang: 'en' // Show names in English
}).addTo(map);

// ================== MARKERS =====================
let marker = L.marker([25.276987, 51.520008]).addTo(map); // Fake marker

// Double-click to remove fake marker
map.on('dblclick', () => {
  if (marker) map.removeLayer(marker);
});

// ================== LOADING SCREEN =====================
window.addEventListener('load', () => {
  document.getElementById('preloader').style.display = 'none';
});

// ================== ICON BUTTONS TOGGLES =====================
document.getElementById('search-toggle').addEventListener('click', () => {
  const searchBox = document.querySelector('.floating-search');
  searchBox.style.display = searchBox.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('direction-toggle').addEventListener('click', () => {
  const directionPanel = document.getElementById('direction-panel');
  directionPanel.style.display = directionPanel.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('weather-toggle').addEventListener('click', () => {
  const box = document.getElementById('weather-box');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('history-toggle').addEventListener('click', () => {
  const panel = document.getElementById('history-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// ================== SEARCH + AUTOCOMPLETE =====================
const searchInput = document.getElementById('place-input');
const suggestionsBox = document.getElementById('search-suggestions');
const searchBtn = document.getElementById('search-btn');

searchInput.addEventListener('input', async () => {
  const value = searchInput.value.trim();
  if (!value) return (suggestionsBox.style.display = 'none');
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&accept-language=en`);
  const data = await res.json();

  suggestionsBox.innerHTML = '';
  data.slice(0, 5).forEach((item) => {
    const div = document.createElement('div');
    div.textContent = item.display_name;
    div.addEventListener('click', () => {
      searchInput.value = item.display_name;
      suggestionsBox.style.display = 'none';
    });
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.style.display = 'block';
});

searchBtn.addEventListener('click', async () => {
  const place = searchInput.value.trim();
  if (!place) return;
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}&accept-language=en`);
  const data = await res.json();
  if (data.length) {
    const { lat, lon } = data[0];
    map.setView([lat, lon], 13);
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map);
  }
});

// ================== DIRECTION AUTOCOMPLETE & ROUTE =====================
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const dirBtn = document.getElementById('get-direction');
let control;

function attachAuto(input) {
  const sugBox = document.getElementById(`${input.id}-sugg`);
  input.addEventListener('input', async () => {
    const val = input.value.trim();
    if (!val) return (sugBox.style.display = 'none');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}&accept-language=en`);
    const data = await res.json();
    sugBox.innerHTML = '';
    data.slice(0, 5).forEach((item) => {
      const div = document.createElement('div');
      div.textContent = item.display_name;
      div.addEventListener('click', () => {
        input.value = item.display_name;
        sugBox.style.display = 'none';
      });
      sugBox.appendChild(div);
    });
    sugBox.style.display = 'block';
  });
}

attachAuto(startInput);
attachAuto(endInput);

dirBtn.addEventListener('click', async () => {
  const start = startInput.value.trim();
  const end = endInput.value.trim();
  if (!start || !end) return;

  const res1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}&accept-language=en`);
  const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}&accept-language=en`);
  const data1 = await res1.json();
  const data2 = await res2.json();

  if (!data1.length || !data2.length) return;
  const startCoord = L.latLng(data1[0].lat, data1[0].lon);
  const endCoord = L.latLng(data2[0].lat, data2[0].lon);

  if (control) map.removeControl(control);
  control = L.Routing.control({
    waypoints: [startCoord, endCoord],
    routeWhileDragging: false
  }).addTo(map);
});

// ================== LIVE LOCATION =====================
document.getElementById('live-location').addEventListener('click', () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (marker) map.removeLayer(marker);
    marker = L.marker([latitude, longitude]).addTo(map);
    map.setView([latitude, longitude], 15);
  }, () => alert("Permission denied."));
});

// ================== WEATHER BOX (STATIC MOCK) =====================
document.getElementById('weather-box').innerHTML = `
  <h4>Weather: Sunny ☀️</h4>
  <p>Temp: 33°C</p>
  <p>Wind: 13 km/h</p>
`;

// ================== HISTORY BOX (STATIC MOCK) =====================
document.getElementById('historyList').innerHTML = `
  <li>Qatar ➝ Dubai</li>
  <li>Kannur ➝ Delhi</li>
  <li>London ➝ Paris</li>
`;
