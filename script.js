let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker, liveMarker, routingControl;

// Use MapTiler tiles with English labels (not Arabic)
L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO`, {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  maxZoom: 20
}).addTo(map);

// Fake marker on Qatar
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on("dblclick", () => map.removeLayer(fakeMarker));

// Toggle buttons
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () =>
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location permission denied"));

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// Autocomplete setup
function setupAutocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionId);

  input.addEventListener("input", () => {
    const query = input.value;
    if (!query) return box.innerHTML = "";

    L.esri.Geocoding.geocode().text(query).language("en").run((err, results) => {
      if (err || !results.results.length) return;
      box.innerHTML = "";
      results.results.forEach(r => {
        const div = document.createElement("div");
        div.textContent = r.text;
        div.className = "suggestion";
        div.onclick = () => {
          input.value = r.text;
          box.innerHTML = "";
        };
        box.appendChild(div);
      });
    });
  });
}
setupAutocomplete("searchBox", "searchSuggestions");
setupAutocomplete("start", "startSuggestions");
setupAutocomplete("end", "endSuggestions");

// Search functionality
function searchPlace() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;
  L.esri.Geocoding.geocode().text(query).language("en").run((err, res) => {
    if (res.results.length) {
      const latlng = res.results[0].latlng;
      map.setView(latlng, 15);
      if (fakeMarker) map.removeLayer(fakeMarker);
      fakeMarker = L.marker(latlng, {
        icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
      }).addTo(map);
    }
  });
}

// Get directions
function getDirections() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  if (!start || !end) return;
  if (routingControl) map.removeControl(routingControl);

  L.esri.Geocoding.geocode().text(start).language("en").run((err1, sRes) => {
    if (!sRes.results.length) return;
    L.esri.Geocoding.geocode().text(end).language("en").run((err2, eRes) => {
      if (!eRes.results.length) return;

      const sLatLng = sRes.results[0].latlng;
      const eLatLng = eRes.results[0].latlng;

      routingControl = L.Routing.control({
        waypoints: [sLatLng, eLatLng],
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, {
            icon: L.icon({
              iconUrl: i === 0 ? "assets/live-location.svg" : "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
              iconSize: [32, 32]
            })
          });
        }
      }).addTo(map);
    });
  });
}

// Show user live location
function showLiveLocation(position) {
  const latlng = [position.coords.latitude, position.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  const icon = L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] });
  liveMarker = L.marker(latlng, { icon }).addTo(map);
  map.setView(latlng, 15);
}
