// === MAP INITIALIZATION ===
const map = L.map('map').setView([25.276987, 55.296249], 13); // Fake location: Qatar (visible marker)

L.tileLayer(`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  attribution: '© MapTiler',
  tileSize: 512,
  zoomOffset: -1,
  language: 'en'
}).addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map).bindPopup('Current Location (Fake)').openPopup();

// === LIVE LOCATION BUTTON ===
document.getElementById('live-btn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const liveMarker = L.marker([latitude, longitude], { icon: blueIcon }).addTo(map).bindPopup("🎯 Your Real Location");
    map.setView([latitude, longitude], 15);
  }, () => alert("Permission denied."));
});

const blueIcon = L.icon({
  iconUrl: 'assets/live-location.svg',
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30]
});

// === SEARCH TOGGLE ===
const searchToggle = document.getElementById('search-toggle');
const searchBox = document.querySelector('.floating-search');
searchToggle.addEventListener('click', () => {
  searchBox.style.display = searchBox.style.display === 'block' ? 'none' : 'block';
});

// === DIRECTION TOGGLE ===
const directionToggle = document.getElementById('direction-toggle');
const directionPanel = document.getElementById('direction-panel');
directionToggle.addEventListener('click', () => {
  directionPanel.style.display = directionPanel.style.display === 'block' ? 'none' : 'block';
});

// === SEARCH FUNCTION ===
document.getElementById('search-btn').addEventListener('click', () => {
  const place = document.getElementById('search-input').value.trim();
  if (!place) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
    .then(res => res.json())
    .then(data => {
      if (!data[0]) return alert("Place not found");
      const { lat, lon, display_name } = data[0];
      map.setView([lat, lon], 15);
      marker.setLatLng([lat, lon]).bindPopup(display_name).openPopup();
    });
});

// === DIRECTIONS FUNCTION ===
document.getElementById('direction-btn').addEventListener('click', () => {
  const start = document.getElementById('start').value.trim();
  const end = document.getElementById('end').value.trim();
  if (!start || !end) return alert("Enter both locations.");

  if (window.routingControl) map.removeControl(window.routingControl);

  window.routingControl = L.Routing.control({
    waypoints: [],
    routeWhileDragging: false
  }).addTo(map);

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`).then(r => r.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`).then(r => r.json())
  ]).then(([startData, endData]) => {
    if (!startData[0] || !endData[0]) return alert("Locations not found");
    const startCoord = L.latLng(startData[0].lat, startData[0].lon);
    const endCoord = L.latLng(endData[0].lat, endData[0].lon);
    window.routingControl.setWaypoints([startCoord, endCoord]);
  });
});

// === WEATHER & TRAFFIC TOGGLE ===
document.getElementById('weather-toggle').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=71aec132cf2764d6ea577d3616629a9b&units=metric`)
      .then(res => res.json())
      .then(data => {
        alert(`🌦️ Weather: ${data.weather[0].main}, Temp: ${data.main.temp}°C`);
      });
  }, () => alert("Location required for weather"));
});

document.getElementById('traffic-toggle').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    window.open(`https://api.tomtom.com/traffic/map/4/tile/basic/relative0/10/${Math.floor(longitude)}/${Math.floor(latitude)}.png?key=a3vv3A6LAvqLAIKmknfwzSBXEjJOpXwu`, '_blank');
  }, () => alert("Location required for traffic info"));
});
