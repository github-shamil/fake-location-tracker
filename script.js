// === script.js ===

let map;
let marker;
let routingControl;
const fakeLocation = [25.276987, 51.520008]; // Qatar

// Map Initialization
map = L.map('map').setView(fakeLocation, 13);
L.tileLayer(`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  attribution: 'Map data © OpenStreetMap contributors',
}).addTo(map);

marker = L.marker(fakeLocation).addTo(map);

// ========================== SEARCH ===========================

document.getElementById('search-toggle').addEventListener('click', () => {
  document.querySelector('.floating-search').style.display = 'block';
});

document.getElementById('searchBox').addEventListener('input', async function () {
  const query = this.value;
  if (!query) return;
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`);
  const data = await res.json();
  showSuggestions(data.features, 'searchSuggestions', 'searchBox');
});

function showSuggestions(results, suggestionBoxId, inputId) {
  const container = document.getElementById(suggestionBoxId);
  container.innerHTML = '';
  results.slice(0, 5).forEach(place => {
    const div = document.createElement('div');
    div.className = 'suggestion';
    div.innerText = place.place_name;
    div.addEventListener('click', () => {
      document.getElementById(inputId).value = place.place_name;
      container.innerHTML = '';
    });
    container.appendChild(div);
  });
}

function searchPlace() {
  const input = document.getElementById('searchBox').value;
  fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(input)}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`)
    .then(res => res.json())
    .then(data => {
      if (data.features.length) {
        const coords = data.features[0].center;
        map.setView([coords[1], coords[0]], 14);
        if (marker) map.removeLayer(marker);
        marker = L.marker([coords[1], coords[0]]).addTo(map);
      }
    });
}

// ========================== DIRECTION =========================

document.getElementById('direction-toggle').addEventListener('click', () => {
  const panel = document.getElementById('direction-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('start').addEventListener('input', handleAuto('startSuggestions', 'start'));
document.getElementById('end').addEventListener('input', handleAuto('endSuggestions', 'end'));

function handleAuto(boxId, inputId) {
  return async function (e) {
    const value = e.target.value;
    const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`);
    const data = await res.json();
    showSuggestions(data.features, boxId, inputId);
  };
}

function getDirections() {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(start)}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`)
    .then(res => res.json())
    .then(data1 => {
      if (!data1.features.length) return;
      const startCoord = data1.features[0].center;
      fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(end)}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`)
        .then(res => res.json())
        .then(data2 => {
          if (!data2.features.length) return;
          const endCoord = data2.features[0].center;

          if (routingControl) map.removeControl(routingControl);

          routingControl = L.Routing.control({
            waypoints: [
              L.latLng(startCoord[1], startCoord[0]),
              L.latLng(endCoord[1], endCoord[0])
            ],
            routeWhileDragging: false
          }).addTo(map);
        });
    });
}

// ========================== LOCATION ==========================

document.getElementById('location-toggle').addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported.');
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    map.setView([lat, lon], 14);
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map);
  });
});

// ======================= WEATHER ==============================

document.getElementById('weather-toggle').addEventListener('click', () => {
  const box = document.getElementById('weather-box');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';

  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=a3vv3A6LAvqLAIKmknfwzSBXEjJOpXwu&q=${lat},${lon}`);
    const data = await res.json();

    document.getElementById('weatherTemp').textContent = `${data.current.temp_c}°C`;
    document.getElementById('weatherCondition').textContent = data.current.condition.text;
    document.getElementById('weatherDetails').innerHTML = `
      <p>Wind: ${data.current.wind_kph} kph</p>
      <p>Humidity: ${data.current.humidity}%</p>
    `;
  });
});

// ====================== THEME TOGGLE ==========================

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
});

// ======================= TRAFFIC ==============================

document.getElementById('traffic-toggle').addEventListener('click', () => {
  // Premium Feature - Sample only
  alert('Traffic layer is a premium TomTom layer. Integration pending.');
});

// ======================= HISTORY ==============================
let history = [];
document.getElementById('history-toggle').addEventListener('click', () => {
  const panel = document.getElementById('history-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
});

// Record Search History
function recordSearch(value) {
  if (value && !history.includes(value)) {
    history.push(value);
  }
}
