
let map = L.map('map').setView([25.2882, 51.5485], 15);
let marker = L.marker([25.2882, 51.5485], { draggable: false }).addTo(map);

L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO', {
  attribution: '&copy; MapTiler & OpenStreetMap contributors',
}).addTo(map);

map.on('dblclick', function() {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
});

function hidePanel(id) {
  document.getElementById(id).classList.add('hidden');
}

document.getElementById('search-toggle').onclick = () => {
  document.getElementById('search-panel').classList.toggle('hidden');
  document.getElementById('direction-panel').classList.add('hidden');
};

document.getElementById('direction-toggle').onclick = () => {
  document.getElementById('direction-panel').classList.toggle('hidden');
  document.getElementById('search-panel').classList.add('hidden');
};

document.getElementById('search-button').onclick = () => {
  const input = document.getElementById('search-input').value;
  if (!input) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert("Place not found.");
      const lat = data[0].lat;
      const lon = data[0].lon;
      map.setView([lat, lon], 15);
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);
    });
};

document.getElementById('getDirection').onclick = () => {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!start || !end) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`)
    .then(res => res.json())
    .then(startData => {
      if (!startData.length) return alert("Start place not found.");
      const startCoord = [startData[0].lat, startData[0].lon];

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`)
        .then(res => res.json())
        .then(endData => {
          if (!endData.length) return alert("End place not found.");
          const endCoord = [endData[0].lat, endData[0].lon];

          L.Routing.control({
            waypoints: [
              L.latLng(...startCoord),
              L.latLng(...endCoord)
            ],
            router: L.Routing.osrmv1({ language: 'en', profile: 'car' }),
            createMarker: () => null,
            show: false
          }).addTo(map);

          if (marker) map.removeLayer(marker);
          marker = L.marker(endCoord).addTo(map);
        });
    });
};
