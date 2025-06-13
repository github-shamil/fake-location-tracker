// --- MAP INITIALIZATION ---
const map = L.map('map').setView([25.276987, 55.296249], 13); // Qatar as fake location

const apiKey = "VcSgtSTkXfCbU3n3RqBO"; // Your MapTiler API Key

L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${apiKey}`, {
  attribution: '&copy; MapTiler & OpenStreetMap',
}).addTo(map);

// --- FAKE MARKER ---
let fakeMarker = L.marker([25.276987, 55.296249], { draggable: false }).addTo(map);
fakeMarker.bindPopup("You are here (fake)").openPopup();

map.on('dblclick', () => {
  map.removeLayer(fakeMarker);
});

// --- TOGGLES ---
const searchBox = document.getElementById('search-box');
const directionPanel = document.getElementById('direction-panel');

document.getElementById('search-toggle').addEventListener('click', () => {
  searchBox.style.display = searchBox.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('close-search').addEventListener('click', () => {
  searchBox.style.display = 'none';
});

document.getElementById('direction-toggle').addEventListener('click', () => {
  directionPanel.style.display = directionPanel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('close-direction').addEventListener('click', () => {
  directionPanel.style.display = 'none';
});

// --- SEARCH FUNCTION ---
document.getElementById('search-btn').addEventListener('click', () => {
  const place = document.getElementById('search-input').value;
  if (!place) return;

  fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        map.setView([lat, lon], 14);
        if (fakeMarker) map.removeLayer(fakeMarker);
        fakeMarker = L.marker([lat, lon]).addTo(map).bindPopup(place).openPopup();
      } else {
        alert("Place not found");
      }
    });
});

// --- ROUTING FUNCTION ---
document.getElementById('route-btn').addEventListener('click', () => {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!start || !end) return alert("Enter both locations");

  Promise.all([
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(start)}.json?key=${apiKey}`).then(res => res.json()),
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(end)}.json?key=${apiKey}`).then(res => res.json())
  ]).then(([startData, endData]) => {
    if (!startData.features.length || !endData.features.length) return alert("Location not found");

    const [startLon, startLat] = startData.features[0].geometry.coordinates;
    const [endLon, endLat] = endData.features[0].geometry.coordinates;

    if (window.routingControl) map.removeControl(window.routingControl);

    window.routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startLat, startLon),
        L.latLng(endLat, endLon)
      ],
      routeWhileDragging: false
    }).addTo(map);

    map.setView([startLat, startLon], 13);
  });
});

// --- LIVE LOCATION ---
document.getElementById('live-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    L.marker([lat, lon], { icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [25, 25] }) })
      .addTo(map)
      .bindPopup("Your Live Location")
      .openPopup();
    map.setView([lat, lon], 15);
  }, err => {
    alert("Permission denied or location unavailable.");
  });
});
