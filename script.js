let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker, liveMarker, routingControl;

// Use MapTiler tiles with English labels only
L.tileLayer("https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO", {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  maxZoom: 20
}).addTo(map);

// Add initial fake marker (Qatar)
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on("dblclick", () => map.removeLayer(fakeMarker));

// UI toggle
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () =>
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location access denied"));

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// 🔍 AUTOCOMPLETE with Photon API (free & accurate)
function enableAutocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (!query) return (suggestionBox.innerHTML = "");

    const res = await fetch(`https://photon.komoot.io/api/?q=${query}&lang=en`);
    const data = await res.json();
    suggestionBox.innerHTML = "";
    data.features.slice(0, 5).forEach((feature) => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = feature.properties.name + ", " + feature.properties.country;
      div.onclick = () => {
        input.value = feature.properties.name;
        input.dataset.lat = feature.geometry.coordinates[1];
        input.dataset.lon = feature.geometry.coordinates[0];
        suggestionBox.innerHTML = "";
      };
      suggestionBox.appendChild(div);
    });
  });
}
enableAutocomplete("searchBox", "searchSuggestions");
enableAutocomplete("start", "startSuggestions");
enableAutocomplete("end", "endSuggestions");

// 📍 Search & Mark
function searchPlace() {
  const input = document.getElementById("searchBox");
  const lat = input.dataset.lat;
  const lon = input.dataset.lon;

  if (!lat || !lon) return alert("Please select a place from suggestions.");
  if (fakeMarker) map.removeLayer(fakeMarker);

  const coords = [parseFloat(lat), parseFloat(lon)];
  fakeMarker = L.marker(coords, {
    icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
  }).addTo(map);
  map.setView(coords, 15);
}

// 🛣️ Get Directions
function getDirections() {
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");

  if (!startInput.dataset.lat || !endInput.dataset.lat) return alert("Select both places from suggestions.");

  const startCoords = [parseFloat(startInput.dataset.lat), parseFloat(startInput.dataset.lon)];
  const endCoords = [parseFloat(endInput.dataset.lat), parseFloat(endInput.dataset.lon)];

  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [L.latLng(...startCoords), L.latLng(...endCoords)],
    lineOptions: { styles: [{ color: "#1976d2", weight: 5 }] },
    createMarker: (i, wp) => {
      return L.marker(wp.latLng, {
        icon: L.icon({
          iconUrl: i === 0 ? "assets/live-location.svg" : "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
          iconSize: [32, 32]
        })
      });
    }
  }).addTo(map);
}

// 📡 Show Live GPS Location
function showLiveLocation(position) {
  const coords = [position.coords.latitude, position.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  liveMarker = L.marker(coords, {
    icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] })
  }).addTo(map);
  map.setView(coords, 15);
}
