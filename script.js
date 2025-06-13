// ========== MAP SETUP ==========
const map = L.map('map').setView([25.276987, 51.520008], 13); // Qatar fake location

L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  tileSize: 512,
  zoomOffset: -1,
  attribution: '© MapTiler © OpenStreetMap',
  crossOrigin: true,
  lang: 'en'
}).addTo(map);

// ========== FAKE MARKER ==========
let marker = L.marker([25.276987, 51.520008]).addTo(map);
map.on('dblclick', () => { if (marker) map.removeLayer(marker); });

// ========== LOADING SCREEN ==========
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').style.opacity = 0;
    setTimeout(() => document.getElementById('preloader').style.display = 'none', 500);
  }, 1000);
});

// ========== PANEL TOGGLES ==========
document.getElementById('search-toggle').addEventListener('click', () => {
  const box = document.querySelector('.floating-search');
  box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('direction-toggle').addEventListener('click', () => {
  const panel = document.getElementById('direction-panel');
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('weather-toggle').addEventListener('click', () => {
  const box = document.getElementById('weather-box');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('history-toggle').addEventListener('click', () => {
  const panel = document.getElementById('history-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// ========== SEARCH AUTOCOMPLETE ==========
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
    div.onclick = () => {
      searchInput.value = item.display_name;
      suggestionsBox.style.display = 'none';
    };
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

// ========== DIRECTION AUTOCOMPLETE & ROUTE ==========
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
      div.onclick = () => {
        input.value = item.display_name;
        sugBox.style.display = 'none';
      };
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

// ========== LIVE LOCATION ==========
document.getElementById('live-location').addEventListener('click', () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (marker) map.removeLayer(marker);
    marker = L.marker([latitude, longitude]).addTo(map);
    map.setView([latitude, longitude], 15);
  }, () => alert("Permission denied."));
});

// ========== LIVE WEATHER API ==========
async function updateWeather(lat = 25.276987, lon = 51.520008) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  const data = await res.json();
  const w = data.current_weather;
  document.getElementById('weather-box').innerHTML = `
    <h4>Live Weather</h4>
    <p>Temp: ${w.temperature}°C</p>
    <p>Wind: ${w.windspeed} km/h</p>
    <p>Condition: ${w.weathercode == 0 ? 'Clear ☀️' : 'Cloudy ☁️'}</p>
  `;
}

updateWeather();

// ========== STATIC HISTORY ==========
document.getElementById('historyList').innerHTML = `
  <li>Qatar ➝ Dubai</li>
  <li>London ➝ Paris</li>
  <li>New York ➝ Tokyo</li>
`;
