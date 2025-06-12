let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker;
let liveMarker;
let routingControl;

// Map Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// Fake Marker on load
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on('dblclick', () => map.removeLayer(fakeMarker));

// Toggle panels
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () =>
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location access denied."));

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

const geocoder = L.esri.Geocoding.geocodeService();

// =================== 🔍 Autocomplete Functions =====================
function autocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);
  input.addEventListener("input", () => {
    const query = input.value;
    if (!query) {
      suggestionBox.innerHTML = "";
      return;
    }
    L.esri.Geocoding.geocode().text(query).language("en").run((err, results) => {
      if (err || !results.results.length) return;
      suggestionBox.innerHTML = "";
      results.results.forEach(r => {
        const div = document.createElement("div");
        div.textContent = r.text;
        div.className = "suggestion";
        div.onclick = () => {
          input.value = r.text;
          suggestionBox.innerHTML = "";
        };
        suggestionBox.appendChild(div);
      });
    });
  });
}
autocomplete("searchBox", "searchSuggestions");
autocomplete("start", "startSuggestions");
autocomplete("end", "endSuggestions");

// ================== 📍 Search Location ==================
function searchPlace() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;

  L.esri.Geocoding.geocode().text(query).language("en").run((err, results) => {
    if (results?.results?.length > 0) {
      const latlng = results.results[0].latlng;
      map.setView(latlng, 14);
      if (fakeMarker) map.removeLayer(fakeMarker);
      fakeMarker = L.marker(latlng, {
        icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
      }).addTo(map);
    }
  });
}

// ================== 🚘 Get Directions ==================
function getDirections() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  if (routingControl) map.removeControl(routingControl);

  L.esri.Geocoding.geocode().text(start).language("en").run((err, startRes) => {
    if (!startRes.results.length) return;
    L.esri.Geocoding.geocode().text(end).language("en").run((err, endRes) => {
      if (!endRes.results.length) return;
      const startLatLng = startRes.results[0].latlng;
      const endLatLng = endRes.results[0].latlng;

      const blueDot = L.icon({ iconUrl: 'assets/live-location.svg', iconSize: [32, 32] });
      const redMark = L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' });

      routingControl = L.Routing.control({
        waypoints: [startLatLng, endLatLng],
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, { icon: i === 0 ? blueDot : redMark });
        }
      }).addTo(map);
    });
  });
}

// ================== 📡 Show Live Location ==================
function showLiveLocation(pos) {
  const latlng = [pos.coords.latitude, pos.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  const icon = L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] });
  liveMarker = L.marker(latlng, { icon }).addTo(map);
  map.setView(latlng, 15);
}
