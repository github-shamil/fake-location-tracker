let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker, liveMarker, routingControl;

// Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Add fake default marker
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on("dblclick", () => map.removeLayer(fakeMarker));

// UI toggle
function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () => {
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location access denied."));
};

// Autocomplete setup
function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionsId);

  input.addEventListener("input", () => {
    const text = input.value;
    if (!text) return (box.innerHTML = "");

    L.esri.Geocoding.geocode()
      .text(text)
      .language("en") // Always in English
      .run((err, result) => {
        if (err || !result.results.length) return;
        box.innerHTML = "";
        result.results.forEach(r => {
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

// Search location
function searchPlace() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;
  L.esri.Geocoding.geocode().text(query).language("en").run((err, res) => {
    if (res?.results?.length) {
      const latlng = res.results[0].latlng;
      map.setView(latlng, 15);
      if (fakeMarker) map.removeLayer(fakeMarker);
      fakeMarker = L.marker(latlng, {
        icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
      }).addTo(map);
    }
  });
}

// Directions
function getDirections() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  if (!start || !end) return;
  if (routingControl) map.removeControl(routingControl);

  L.esri.Geocoding.geocode().text(start).language("en").run((err1, sRes) => {
    if (!sRes?.results?.length) return;
    L.esri.Geocoding.geocode().text(end).language("en").run((err2, eRes) => {
      if (!eRes?.results?.length) return;

      const sLatLng = sRes.results[0].latlng;
      const eLatLng = eRes.results[0].latlng;

      routingControl = L.Routing.control({
        waypoints: [sLatLng, eLatLng],
        createMarker: (i, wp) => {
          return L.marker(wp.latLng, {
            icon: L.icon({
              iconUrl: i === 0 ? 'assets/live-location.svg' : 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png',
              iconSize: [32, 32]
            })
          });
        }
      }).addTo(map);
    });
  });
}

// Live location
function showLiveLocation(pos) {
  const latlng = [pos.coords.latitude, pos.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  const icon = L.icon({
    iconUrl: "assets/live-location.svg",
    iconSize: [32, 32]
  });
  liveMarker = L.marker(latlng, { icon }).addTo(map);
  map.setView(latlng, 15);
}
