// Initial Setup: Fake Marker in Qatar
const map = L.map("map").setView([25.276987, 51.5200], 13); // Fake: Qatar
const maptilerKey = "VcSgtSTkXfCbU3n3RqBO";
let control;

// Load Map Layer
let baseLayer = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
  attribution: '© MapTiler © OpenStreetMap contributors'
});
baseLayer.addTo(map);

// Fake marker
let fakeMarker = L.marker([25.276987, 51.5200]).addTo(map);

// Toggle Search Box
document.getElementById("search-icon").onclick = () => {
  const box = document.getElementById("search-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
  document.getElementById("direction-box").style.display = "none";
};

// Search Button Click
document.getElementById("search-button").onclick = async () => {
  const query = document.getElementById("search-input").value;
  if (!query) return;

  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${maptilerKey}&language=en`);
  const data = await res.json();

  if (data.features.length) {
    const [lon, lat] = data.features[0].center;
    map.setView([lat, lon], 15);
    fakeMarker.setLatLng([lat, lon]).bindPopup(query).openPopup();
    document.getElementById("search-box").style.display = "none";
  }
};

// Close Search Box
document.getElementById("close-search").onclick = () => {
  document.getElementById("search-box").style.display = "none";
};

// Toggle Direction Box
document.getElementById("direction-icon").onclick = () => {
  const box = document.getElementById("direction-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
  document.getElementById("search-box").style.display = "none";
};

// Get Direction
document.getElementById("get-direction").onclick = async () => {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  if (!from || !to) return;

  const [resFrom, resTo] = await Promise.all([
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(from)}.json?key=${maptilerKey}&language=en`),
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(to)}.json?key=${maptilerKey}&language=en`)
  ]);

  const dataFrom = await resFrom.json();
  const dataTo = await resTo.json();

  if (dataFrom.features.length && dataTo.features.length) {
    const [lon1, lat1] = dataFrom.features[0].center;
    const [lon2, lat2] = dataTo.features[0].center;

    if (control) map.removeControl(control);
    control = L.Routing.control({
      waypoints: [L.latLng(lat1, lon1), L.latLng(lat2, lon2)],
      routeWhileDragging: false,
      show: false,
      draggableWaypoints: false,
      addWaypoints: false,
      createMarker: () => null
    }).addTo(map);

    fakeMarker.setLatLng([lat2, lon2]);
    map.setView([lat2, lon2], 13);
    document.getElementById("direction-box").style.display = "none";
  }
};

// Close Direction Box
document.getElementById("close-direction").onclick = () => {
  document.getElementById("direction-box").style.display = "none";
};

// Live Location
document.getElementById("locate-btn").onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    L.marker([latitude, longitude], { title: "Your Location" }).addTo(map)
      .bindPopup("You").openPopup();
    map.setView([latitude, longitude], 15);
  });
};

// Layer Popup Toggle
document.getElementById("layer-btn").onclick = () => {
  const popup = document.getElementById("layer-popup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
};

// Layer Change
document.querySelectorAll(".layer-option").forEach(layer => {
  layer.onclick = () => {
    const style = layer.getAttribute("data-style");

    map.eachLayer(l => map.removeLayer(l));
    baseLayer = L.tileLayer(`https://api.maptiler.com/maps/${style}/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
      attribution: '© MapTiler © OpenStreetMap contributors'
    });
    baseLayer.addTo(map);
    fakeMarker.addTo(map);
    if (control) control.addTo(map);
    document.getElementById("layer-popup").style.display = "none";
  };
});

// Double click to remove marker
map.on("dblclick", () => {
  map.removeLayer(fakeMarker);
});
