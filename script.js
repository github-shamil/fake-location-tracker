const map = L.map("map").setView([25.276987, 55.296249], 13); // Fake: Dubai
const maptilerKey = "VcSgtSTkXfCbU3n3RqBO";
const tileLayer = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
  attribution: '© MapTiler © OpenStreetMap contributors',
});
tileLayer.addTo(map);

const fakeMarker = L.marker([25.276987, 55.296249]).addTo(map);

document.getElementById("search-icon").onclick = () => {
  const box = document.getElementById("search-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

document.getElementById("search-button").onclick = async () => {
  const place = document.getElementById("search-input").value;
  if (!place) return;
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${maptilerKey}&language=en`);
  const data = await res.json();
  if (data.features.length > 0) {
    const coords = data.features[0].center.reverse();
    map.setView(coords, 15);
    fakeMarker.setLatLng(coords);
    fakeMarker.bindPopup(place).openPopup();
    document.getElementById("search-box").style.display = "none";
  }
};

document.getElementById("close-search").onclick = () => {
  document.getElementById("search-box").style.display = "none";
};

document.getElementById("direction-icon").onclick = () => {
  const dirBox = document.getElementById("direction-box");
  const searchBox = document.getElementById("search-box");
  const isVisible = dirBox.style.display === "block";
  dirBox.style.display = isVisible ? "none" : "block";
  searchBox.style.display = isVisible ? "block" : "none";
};

let control;
document.getElementById("get-direction").onclick = async () => {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  if (!from || !to) return;

  const [resFrom, resTo] = await Promise.all([
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(from)}.json?key=${maptilerKey}&language=en`),
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(to)}.json?key=${maptilerKey}&language=en`),
  ]);

  const [dataFrom, dataTo] = await Promise.all([resFrom.json(), resTo.json()]);
  if (!dataFrom.features.length || !dataTo.features.length) return;

  const coordFrom = dataFrom.features[0].center.reverse();
  const coordTo = dataTo.features[0].center.reverse();

  if (control) map.removeControl(control);
  control = L.Routing.control({
    waypoints: [L.latLng(coordFrom), L.latLng(coordTo)],
    routeWhileDragging: false,
    show: false,
    draggableWaypoints: false,
  }).addTo(map);

  map.setView(coordFrom, 13);
  document.getElementById("direction-box").style.display = "none";
};

document.getElementById("close-direction").onclick = () => {
  document.getElementById("direction-box").style.display = "none";
  document.getElementById("search-box").style.display = "block";
};

document.getElementById("locate-btn").onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    L.marker([lat, lng], { title: "You" }).addTo(map).bindPopup("Your Location").openPopup();
    map.setView([lat, lng], 15);
  });
};

document.getElementById("layer-btn").onclick = () => {
  const popup = document.getElementById("layer-popup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".layer-option").forEach(layer => {
  layer.onclick = () => {
    const style = layer.getAttribute("data-style");
    map.eachLayer(l => map.removeLayer(l));
    L.tileLayer(`https://api.maptiler.com/maps/${style}/256/{z}/{x}/{y}.png?key=${maptilerKey}`, {
      attribution: '© MapTiler © OpenStreetMap contributors',
    }).addTo(map);
    map.addLayer(fakeMarker);
    if (control) control.addTo(map);
    document.getElementById("layer-popup").style.display = "none";
  };
});

map.on("dblclick", () => {
  map.removeLayer(fakeMarker);
});
