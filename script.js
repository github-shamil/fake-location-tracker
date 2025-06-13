let map = L.map("map").setView([25.276987, 55.296249], 12); // Fake: Dubai

L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY', {
  attribution: '',
  tileSize: 256,
  zoomOffset: 0,
  lang: 'en'
}).addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map);

// Toggle panels
function toggleSearch() {
  document.querySelector(".floating-search").classList.toggle("hidden");
}
function toggleDirection() {
  document.getElementById("direction-panel").classList.toggle("hidden");
}

document.querySelector(".search-toggle").onclick = toggleSearch;
document.querySelector(".direction-toggle").onclick = toggleDirection;

// Search function
function searchLocation() {
  const query = document.getElementById("search-input").value;
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
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

  L.Routing.control({
    waypoints: [],
    router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
    createMarker: () => null,
    lineOptions: { styles: [{ color: "blue", opacity: 0.7, weight: 5 }] }
  }).on("routesfound", function (e) {
    console.log("Route found", e.routes[0]);
  }).addTo(map);

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${from}`)
    .then(res => res.json())
    .then(data1 => {
      if (!data1[0]) return;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${to}`)
        .then(res => res.json())
        .then(data2 => {
          if (!data2[0]) return;
          const fromLatLng = L.latLng(data1[0].lat, data1[0].lon);
          const toLatLng = L.latLng(data2[0].lat, data2[0].lon);
          L.Routing.control({
            waypoints: [fromLatLng, toLatLng],
            router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
            lineOptions: { styles: [{ color: 'green', weight: 4 }] },
            createMarker: () => null
          }).addTo(map);
        });
    });
}
