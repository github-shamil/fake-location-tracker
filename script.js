let map, fakeMarker, currentTile, routingControl;
const maptilerKey = "VcSgtSTkXfCbU3n3RqBO";
const trafficAPI = "a3vv3A6LAvqLAIKmknfwzSBXEjJOpXwu"; // Preloaded
const weatherAPI = "71aec132cf2764d6ea577d3616629a9b"; // Preloaded

// Fake visible location (Qatar)
const fakeLat = 25.276987;
const fakeLng = 51.520008;

function initMap() {
  map = L.map("map").setView([fakeLat, fakeLng], 13);

  currentTile = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${maptilerKey}`, {
    attribution: '&copy; MapTiler, OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map);

  fakeMarker = L.marker([fakeLat, fakeLng], { draggable: false }).addTo(map);

  L.Control.geocoder().addTo(map);

  map.on("dblclick", () => {
    if (map.hasLayer(fakeMarker)) map.removeLayer(fakeMarker);
  });
}

document.getElementById("search-toggle").onclick = () => {
  document.getElementById("search-box").style.display = "flex";
};

document.getElementById("close-search").onclick = () => {
  document.getElementById("search-box").style.display = "none";
};

document.getElementById("search-button").onclick = () => {
  const query = document.getElementById("search-input").value;
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(locations => {
      if (locations.length) {
        const place = locations[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        map.setView([lat, lon], 15);
        if (fakeMarker) map.removeLayer(fakeMarker);
        fakeMarker = L.marker([lat, lon]).addTo(map);
      } else {
        alert("Place not found");
      }
    });
};

document.getElementById("direction-toggle").onclick = () => {
  const panel = document.getElementById("direction-panel");
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
};

document.getElementById("close-direction").onclick = () => {
  document.getElementById("direction-panel").style.display = "none";
};

document.getElementById("get-route").onclick = () => {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  if (!start || !end) return alert("Enter both start and end locations");

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`)
    .then(res => res.json())
    .then(startLocs => {
      if (!startLocs.length) throw new Error("Start not found");

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`)
        .then(res => res.json())
        .then(endLocs => {
          if (!endLocs.length) throw new Error("End not found");

          const startCoords = [parseFloat(startLocs[0].lat), parseFloat(startLocs[0].lon)];
          const endCoords = [parseFloat(endLocs[0].lat), parseFloat(endLocs[0].lon)];

          if (routingControl) map.removeControl(routingControl);

          routingControl = L.Routing.control({
            waypoints: [L.latLng(startCoords), L.latLng(endCoords)],
            routeWhileDragging: false
          }).addTo(map);
        });
    })
    .catch(err => alert(err.message));
};

document.getElementById("live-location").onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    L.marker([latitude, longitude], {
      icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] })
    }).addTo(map).bindPopup("Your Live Location").openPopup();
    map.setView([latitude, longitude], 14);
  }, () => {
    alert("Location permission denied");
  });
};

document.getElementById("satellite-toggle").onclick = () => {
  map.removeLayer(currentTile);
  const isSatellite = currentTile._url.includes("satellite");
  const newStyle = isSatellite ? "streets" : "satellite";
  currentTile = L.tileLayer(`https://api.maptiler.com/maps/${newStyle}/{z}/{x}/{y}.png?key=${maptilerKey}`, {
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map);
};

// Init
initMap();
