const map = L.map("map").setView([25.276987, 55.296249], 13);
const maptilerKey = "VcSgtSTkXfCbU3n3RqBO";

// Initial Tiles
let currentTile = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
  attribution: '© MapTiler © OpenStreetMap',
});
currentTile.addTo(map);

// Marker
const fakeMarker = L.marker([25.276987, 55.296249]).addTo(map);

// Search Toggle
document.getElementById("search-icon").onclick = () => {
  const box = document.getElementById("search-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

// Search Action
document.getElementById("search-button").onclick = async () => {
  const place = document.getElementById("search-input").value;
  if (!place) return;
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${maptilerKey}&language=en`);
  const data = await res.json();
  if (data.features.length > 0) {
    const coords = data.features[0].center.reverse();
    fakeMarker.setLatLng(coords);
    map.setView(coords, 15);
    fakeMarker.bindPopup(place).openPopup();
    document.getElementById("search-box").style.display = "none";
  }
};

// Close Search
document.getElementById("close-search").onclick = () => {
  document.getElementById("search-box").style.display = "none";
};

// Direction Toggle
document.getElementById("direction-icon").onclick = () => {
  const box = document.getElementById("direction-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

// Close Direction
document.getElementById("close-direction").onclick = () => {
  document.getElementById("direction-box").style.display = "none";
};

// Directions
let control;
document.getElementById("get-direction").onclick = async () => {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  if (!from || !to) return;

  const [resFrom, resTo] = await Promise.all([
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(from)}.json?key=${maptilerKey}&language=en`),
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(to)}.json?key=${maptilerKey}&language=en`)
  ]);
  const [dataFrom, dataTo] = await Promise.all([resFrom.json(), resTo.json()]);
  if (!dataFrom.features.length || !dataTo.features.length) return;

  const fromCoord = dataFrom.features[0].center.reverse();
  const toCoord = dataTo.features[0].center.reverse();

  if (control) map.removeControl(control);
  control = L.Routing.control({
    waypoints: [L.latLng(fromCoord), L.latLng(toCoord)],
    routeWhileDragging: false,
    draggableWaypoints: false,
    addWaypoints: false
  }).addTo(map);

  map.setView(fromCoord, 13);
  document.getElementById("direction-box").style.display = "none";
};

// Live Location
document.getElementById("locate-btn").onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();
    map.setView([lat, lng], 15);
  });
};

// Layer switcher
document.getElementById("layer-btn").onclick = () => {
  const popup = document.getElementById("layer-popup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".layer-option").forEach(opt => {
  opt.onclick = () => {
    const style = opt.getAttribute("data-style");
    map.eachLayer(layer => map.removeLayer(layer));
    currentTile = L.tileLayer(`https://api.maptiler.com/maps/${style}/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
      attribution: '© MapTiler © OpenStreetMap',
    }).addTo(map);
    map.addLayer(fakeMarker);
    if (control) control.addTo(map);
    document.getElementById("layer-popup").style.display = "none";
  };
});

// Double click to remove fake marker
map.on("dblclick", () => {
  map.removeLayer(fakeMarker);
});
