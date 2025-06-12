const map = L.map('map').setView([25.276987, 51.520008], 14);
L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO', {
  attribution: '&copy; MapTiler & OpenStreetMap contributors'
}).addTo(map);

let fakeMarker = L.marker([25.276987, 51.520008], { draggable: false }).addTo(map);
fakeMarker.on('dblclick', () => map.removeLayer(fakeMarker));

const toggle = (id, show) => {
  document.getElementById(id).style.display = show ? 'block' : 'none';
};

document.getElementById('search-toggle').onclick = () => {
  toggle('search-panel', true);
  toggle('direction-panel', false);
};
document.getElementById('direction-toggle').onclick = () => {
  toggle('direction-panel', true);
  toggle('search-panel', false);
};
document.getElementById('location-toggle').onclick = () => {
  map.locate({ setView: true, maxZoom: 16 });
};
map.on('locationfound', (e) => {
  L.circle(e.latlng, {
    radius: 10,
    color: 'blue',
    fillColor: '#30f',
    fillOpacity: 0.7
  }).addTo(map);
});

function hidePanel(id) {
  toggle(id, false);
}

function setSuggestionListeners(inputId, ulId) {
  const input = document.getElementById(inputId);
  const ul = document.getElementById(ulId);
  input.addEventListener('input', () => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${input.value}`)
      .then(res => res.json())
      .then(data => {
        ul.innerHTML = '';
        data.slice(0, 5).forEach(place => {
          const li = document.createElement('li');
          li.textContent = place.display_name;
          li.onclick = () => {
            input.value = place.display_name;
            ul.innerHTML = '';
          };
          ul.appendChild(li);
        });
      });
  });
}

setSuggestionListeners('searchBox', 'searchSuggestions');
setSuggestionListeners('start', 'startSuggestions');
setSuggestionListeners('end', 'endSuggestions');

function executeSearch() {
  const query = document.getElementById('searchBox').value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {
      if (data[0]) {
        const latlng = [data[0].lat, data[0].lon];
        if (fakeMarker) map.removeLayer(fakeMarker);
        fakeMarker = L.marker(latlng).addTo(map);
        map.setView(latlng, 14);
      }
    });
}

let routingControl;
document.getElementById('getDirection').onclick = () => {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!start || !end) return;

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`).then(res => res.json())
  ]).then(([startData, endData]) => {
    if (!startData[0] || !endData[0]) return;

    const startLatLng = L.latLng(startData[0].lat, startData[0].lon);
    const endLatLng = L.latLng(endData[0].lat, endData[0].lon);

    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
      waypoints: [startLatLng, endLatLng],
      router: L.Routing.osrmv1(),
      createMarker: () => null
    }).addTo(map);

    if (fakeMarker) map.removeLayer(fakeMarker);
    fakeMarker = L.marker(endLatLng).addTo(map);
  });
};
