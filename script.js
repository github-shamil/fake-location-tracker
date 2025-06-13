// 🌐 script.js — Logically Advanced, Premium, Rare, Epic-Level

let map;
let fakeMarker;
let routeControl;
let darkMode = false;
let searchHistory = [];

const maptilerKey = 'VcSgtSTkXfCbU3n3RqBO';
const weatherKey = '71aec132cf2764d6ea577d3616629a9b';

window.onload = () => {
  initMap();
  setupEventListeners();
  setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 1000);
};

function initMap() {
  map = L.map('map').setView([25.276987, 55.296249], 13); // Fake: Dubai/Qatar

  L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
    attribution: '© MapTiler © OpenStreetMap contributors'
  }).addTo(map);

  fakeMarker = L.marker([25.276987, 55.296249], { draggable: true }).addTo(map);
  fakeMarker.bindPopup('📍 You are here (fake)').openPopup();
}

function setupEventListeners() {
  document.getElementById('search-toggle').onclick = () => {
    toggleVisibility('.floating-search');
  };

  document.getElementById('direction-toggle').onclick = () => {
    toggleVisibility('#direction-panel');
  };

  document.getElementById('location-toggle').onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      const realMarker = L.marker([latitude, longitude], { icon: blueIcon() }).addTo(map);
      realMarker.bindPopup('📍 Your real location').openPopup();
      map.setView([latitude, longitude], 14);
    });
  };

  document.getElementById('traffic-toggle').onclick = () => {
    alert('🚧 Real-time traffic coming soon using TomTom API');
  };

  document.getElementById('weather-toggle').onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
          const box = document.getElementById('weather-box');
          box.innerHTML = `🌡️ ${data.main.temp}°C<br>🌧️ ${data.weather[0].description}`;
          box.style.display = 'block';
        });
    });
  };

  document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
    darkMode = !darkMode;
  };

  document.getElementById('history-toggle').onclick = () => {
    const panel = document.getElementById('history-panel');
    const list = document.getElementById('historyList');
    list.innerHTML = searchHistory.map(item => `<li>${item}</li>`).join('');
    toggleVisibility('#history-panel');
  };

  document.getElementById('search-btn').onclick = () => {
    const query = document.getElementById('search-input').value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {
        if (!data[0]) return alert('Place not found');
        const { lat, lon } = data[0];
        map.setView([lat, lon], 15);
        fakeMarker.setLatLng([lat, lon]);
        searchHistory.push(query);
      });
  };

  document.getElementById('direction-btn').onclick = () => {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    if (!start || !end) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`)
      .then(res => res.json())
      .then(startData => {
        if (!startData[0]) return alert('Start not found');
        const startCoords = [startData[0].lat, startData[0].lon];

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`)
          .then(res => res.json())
          .then(endData => {
            if (!endData[0]) return alert('End not found');
            const endCoords = [endData[0].lat, endData[0].lon];

            if (routeControl) map.removeControl(routeControl);
            routeControl = L.Routing.control({
              waypoints: [L.latLng(...startCoords), L.latLng(...endCoords)],
              routeWhileDragging: false,
              show: false
            }).addTo(map);

            searchHistory.push(`${start} → ${end}`);
          });
      });
  };
}

function toggleVisibility(selector) {
  const el = document.querySelector(selector);
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function blueIcon() {
  return new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
}
