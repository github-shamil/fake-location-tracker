// 🌍 Map Initialization
let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker, liveMarker, routingControl;

// 🗺️ Tile Layers
const streetLayer = L.tileLayer("https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO", {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>', maxZoom: 20
});
const satelliteLayer = L.tileLayer("https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=VcSgtSTkXfCbU3n3RqBO", {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>', maxZoom: 20
});
streetLayer.addTo(map);

// 🧭 Initial Fake Marker
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);
fakeMarker.on("click", (e) => {
  const { lat, lng } = e.latlng;
  fakeMarker.setLatLng([lat, lng]);
});

// ☀️/🌙 Dark Mode Toggle
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
};

// 🗺️ Layer Toggle
let isStreet = true;
document.getElementById("layer-toggle").onclick = () => {
  if (isStreet) {
    map.removeLayer(streetLayer);
    map.addLayer(satelliteLayer);
  } else {
    map.removeLayer(satelliteLayer);
    map.addLayer(streetLayer);
  }
  isStreet = !isStreet;
};

// 📡 My Location Tracking
document.getElementById("location-toggle").onclick = () =>
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location access denied"));

function showLiveLocation(position) {
  const coords = [position.coords.latitude, position.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  liveMarker = L.marker(coords, {
    icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] })
  }).addTo(map);
  map.setView(coords, 15);
}

// 🔍 Autocomplete Function
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
        saveSearch(input.value);
      };
      suggestionBox.appendChild(div);
    });
  });
}

enableAutocomplete("searchBox", "searchSuggestions");
enableAutocomplete("start", "startSuggestions");
enableAutocomplete("end", "endSuggestions");

// 🔍 Search Place
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
  saveSearch(input.value);
}

// 🛣️ Get Directions
function getDirections() {
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");

  let startCoords, endCoords;

  if (startInput.value.toLowerCase() === "my location") {
    navigator.geolocation.getCurrentPosition((pos) => {
      startCoords = [pos.coords.latitude, pos.coords.longitude];
      buildRoute(startCoords, getCoords(endInput));
    });
  } else {
    if (!startInput.dataset.lat || !endInput.dataset.lat) return alert("Select both places from suggestions.");
    startCoords = getCoords(startInput);
    endCoords = getCoords(endInput);
    buildRoute(startCoords, endCoords);
  }
}

function buildRoute(startCoords, endCoords) {
  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [L.latLng(...startCoords), L.latLng(...endCoords)],
    lineOptions: { styles: [{ color: "#1976d2", weight: 5 }] },
    show: false,
    createMarker: (i, wp) => {
      return L.marker(wp.latLng, {
        icon: L.icon({
          iconUrl: i === 0 ? "assets/live-location.svg" : "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
          iconSize: [32, 32]
        })
      });
    }
  })
    .addTo(map)
    .on("routesfound", function (e) {
      const route = e.routes[0];
      const summary = route.summary;
      document.getElementById("routeSummary").innerHTML =
        `<p><strong>Distance:</strong> ${(summary.totalDistance / 1000).toFixed(2)} km<br><strong>Time:</strong> ${(summary.totalTime / 60).toFixed(1)} min</p>`;
    });
}

function getCoords(input) {
  return [parseFloat(input.dataset.lat), parseFloat(input.dataset.lon)];
}

// 🔘 Panel Toggles
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("history-toggle").onclick = () => togglePanel("history-panel");

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// 📜 History
function saveSearch(query) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 10) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById("historyList");
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  list.innerHTML = "";
  history.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q;
    li.onclick = () => {
      document.getElementById("searchBox").value = q;
      document.getElementById("searchBox").dispatchEvent(new Event("input"));
    };
    list.appendChild(li);
  });
}
renderHistory();
