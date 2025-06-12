let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker;
let liveMarker;
let routingControl;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// Initial fake marker
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on('dblclick', () => map.removeLayer(fakeMarker));

// Toggle UI
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () => {
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Permission denied or unavailable."));
};

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// Autocomplete for inputs
function setupAutocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);
  input.addEventListener("input", () => {
    const query = input.value;
    if (!query) return (suggestionBox.innerHTML = "");

    L.esri.Geocoding.geocode()
      .text(query)
      .language("en")
      .run((err, results) => {
        if (err || !results?.results?.length) return;
        suggestionBox.innerHTML = "";
        results.results.forEach(res => {
          const item = document.createElement("div");
          item.className = "suggestion";
          item.textContent = res.text;
          item.onclick = () => {
            input.value = res.text;
            suggestionBox.innerHTML = "";
          };
          suggestionBox.appendChild(item);
        });
      });
  });
}
setupAutocomplete("searchBox", "searchSuggestions");
setupAutocomplete("start", "startSuggestions");
setupAutocomplete("end", "endSuggestions");

// Search
function searchPlace() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;
  L.esri.Geocoding.geocode()
    .text(query)
    .language("en")
    .run((err, results) => {
      if (results?.results?.length) {
        const latlng = results.results[0].latlng;
        if (fakeMarker) map.removeLayer(fakeMarker);
        fakeMarker = L.marker(latlng, {
          icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
        }).addTo(map);
        map.setView(latlng, 15);
      }
    });
}

// Directions
function getDirections() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  if (!start || !end) return;
  if (routingControl) map.removeControl(routingControl);

  L.esri.Geocoding.geocode().text(start).language("en").run((err, sRes) => {
    if (!sRes?.results?.length) return;
    const sLatLng = sRes.results[0].latlng;
    L.esri.Geocoding.geocode().text(end).language("en").run((err2, eRes) => {
      if (!eRes?.results?.length) return;
      const eLatLng = eRes.results[0].latlng;

      const startIcon = L.icon({ iconUrl: 'assets/live-location.svg', iconSize: [32, 32] });
      const endIcon = L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' });

      routingControl = L.Routing.control({
        waypoints: [sLatLng, eLatLng],
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, { icon: i === 0 ? startIcon : endIcon });
        }
      }).addTo(map);
    });
  });
}

// Show Live Location
function showLiveLocation(pos) {
  const latlng = [pos.coords.latitude, pos.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  const icon = L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] });
  liveMarker = L.marker(latlng, { icon }).addTo(map);
  map.setView(latlng, 15);
}
