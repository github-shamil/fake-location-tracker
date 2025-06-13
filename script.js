// Initialize the map
const map = L.map('map').setView([25.276987, 55.296249], 13); // Fake location: Dubai

// Load MapTiler tiles (replace with your actual API key)
L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  maxZoom: 19,
  tileSize: 256,
}).addTo(map);

// Add fake marker
let fakeMarker = L.marker([25.276987, 55.296249], { draggable: false }).addTo(map);

// 🔍 Search with autocomplete
const searchInput = document.getElementById('search-input');
const searchBtn = document.querySelector('.search-btn');
const suggestionsBox = document.createElement('div');
suggestionsBox.classList.add('suggestions');
searchInput.parentNode.appendChild(suggestionsBox);

// 🧭 Direction logic
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const getDirectionBtn = document.getElementById('get-direction');

let control = null;

// Suggestion search (using MapTiler Geocoding)
async function fetchSuggestions(query) {
  const response = await fetch(`https://api.maptiler.com/geocoding/${query}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`);
  const data = await response.json();
  return data.features;
}

function createSuggestionItem(place, targetInput, callback) {
  const item = document.createElement('div');
  item.className = 'suggestion';
  item.textContent = place.place_name;
  item.onclick = () => {
    targetInput.value = place.place_name;
    suggestionsBox.innerHTML = '';
    if (callback) callback(place.center);
  };
  return item;
}

// Search autocomplete
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) return (suggestionsBox.innerHTML = '');

  const results = await fetchSuggestions(query);
  suggestionsBox.innerHTML = '';
  results.forEach((place) => {
    const item = createSuggestionItem(place, searchInput, (coords) => {
      if (fakeMarker) map.removeLayer(fakeMarker);
      fakeMarker = L.marker([coords[1], coords[0]]).addTo(map);
      map.setView([coords[1], coords[0]], 15);
    });
    suggestionsBox.appendChild(item);
  });
});

// Directions with autocomplete
[startInput, endInput].forEach((input) => {
  input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (!query) return;

    const results = await fetchSuggestions(query);
    const panel = input.closest('.panel');
    const suggestionsEl = document.createElement('div');
    suggestionsEl.classList.add('suggestions');
    panel.appendChild(suggestionsEl);
    suggestionsEl.innerHTML = '';

    results.forEach((place) => {
      const item = createSuggestionItem(place, input);
      suggestionsEl.appendChild(item);
    });

    // Remove existing on next focus
    input.addEventListener('blur', () => {
      setTimeout(() => suggestionsEl.remove(), 200);
    });
  });
});

// Get Direction button
getDirectionBtn.addEventListener('click', async () => {
  const startQuery = startInput.value;
  const endQuery = endInput.value;

  const [startRes, endRes] = await Promise.all([
    fetchSuggestions(startQuery),
    fetchSuggestions(endQuery),
  ]);

  if (!startRes.length || !endRes.length) return alert('Invalid start or end');

  const [startCoord, endCoord] = [startRes[0].center.reverse(), endRes[0].center.reverse()];

  if (control) map.removeControl(control);

  control = L.Routing.control({
    waypoints: [
      L.latLng(startCoord[0], startCoord[1]),
      L.latLng(endCoord[0], endCoord[1]),
    ],
    routeWhileDragging: false,
    draggableWaypoints: false,
    addWaypoints: false,
  }).addTo(map);
});

// 📍 Show real current location
document.getElementById('location-toggle').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    const realMarker = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [32, 32],
      }),
    }).addTo(map);

    map.setView([latitude, longitude], 15);
  });
});

// 🌧 Weather Info
document.querySelector('.weather-btn').addEventListener('click', async function () {
  const weatherBox = document.getElementById('weather-box');
  this.classList.toggle('active');

  if (weatherBox.style.display === 'block') {
    weatherBox.style.display = 'none';
    return;
  }

  weatherBox.style.display = 'block';

  // Use map center for weather
  const center = map.getCenter();
  const lat = center.lat;
  const lon = center.lng;

  const apiKey = '71aec132cf2764d6ea577d3616629a9b';
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();

  const weatherHTML = `
    <div class="title">${data.name}</div>
    <div class="temp">${data.main.temp}°C</div>
    <div class="condition">${data.weather[0].description}</div>
  `;

  weatherBox.innerHTML = weatherHTML;
});

// 🚦 Traffic toggle (dummy UI effect)
document.querySelector('.traffic-btn').addEventListener('click', function () {
  this.classList.toggle('active');
  alert('Traffic layer toggle (simulated)');
});

// 🌗 Dark Mode
document.querySelector('.theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ✅ NEW: Toggle logic between direction panel & search bar
const directionPanel = document.getElementById('direction-panel');
const searchBar = document.querySelector('.floating-search');
const directionToggle = document.getElementById('direction-toggle');
const directionClose = document.getElementById('direction-close');

directionToggle.addEventListener('click', () => {
  directionPanel.style.display = 'block';
  searchBar.style.display = 'none';
});

directionClose.addEventListener('click', () => {
  directionPanel.style.display = 'none';
  searchBar.style.display = 'flex';
});
