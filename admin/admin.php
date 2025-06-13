<?php
session_start();
$PASSWORD = "8590";

if (!isset($_SESSION['logged_in'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['password'] === $PASSWORD) {
        $_SESSION['logged_in'] = true;
    } else {
        echo '<form method="post" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <h2>Admin Access</h2>
                <input type="password" name="password" placeholder="Enter Password" style="padding:10px;width:200px;" />
                <button style="margin-top:10px;padding:10px 20px;">Login</button>
              </form>';
        exit();
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Panel - Visitor Tracker</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Google Sans', sans-serif;
      background: #121212;
      color: #fff;
      margin: 0;
      padding: 20px;
    }
    h1, h2 {
      margin-bottom: 10px;
      color: #00ff99;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 20px;
    }
    .actions a, button {
      padding: 10px 16px;
      border-radius: 8px;
      text-decoration: none;
      background: #1e1e2e;
      color: #00ff99;
      border: none;
      margin: 5px;
      font-weight: 600;
      transition: 0.2s;
    }
    .actions a:hover, button:hover {
      background: #00ff99;
      color: #000;
    }
    pre {
      background: #1e1e2e;
      padding: 12px;
      border-radius: 6px;
      white-space: pre-wrap;
      max-height: 400px;
      overflow-y: auto;
    }
    canvas {
      background: #fff;
      border-radius: 10px;
      padding: 10px;
      max-width: 100%;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .stat-card {
      background: #222;
      padding: 16px;
      border-radius: 8px;
      flex: 1;
      min-width: 150px;
      box-shadow: 0 0 5px rgba(0,255,170,0.2);
    }
    .stat-card h3 {
      margin: 0;
      font-size: 18px;
      color: #00ffc8;
    }
    .stat-card span {
      font-size: 24px;
      font-weight: bold;
      display: block;
      margin-top: 5px;
    }
    .admin-buttons {
      display: flex;
      gap: 10px;
      margin: 10px 0 20px;
      flex-wrap: wrap;
    }
    .admin-buttons a {
      background: #1e1e2e;
      padding: 10px 14px;
      border-radius: 8px;
      color: #00ff99;
      font-weight: 600;
      text-decoration: none;
      transition: 0.2s;
    }
    .admin-buttons a:hover {
      background: #00ff99;
      color: #000;
    }
  </style>
</head>
<body>

  <div class="topbar">
    <h1>📊 Tracker Admin Dashboard</h1>
    <div class="actions">
      <a href="?logout=1">🚪 Logout</a>
      <a href="export_csv.php">📥 CSV</a>
      <a href="export_json.php">📦 JSON</a>
      <a href="download_db.php">💾 DB</a>
      <button onclick="toggleDarkMode()">🌓 Toggle Mode</button>
    </div>
  </div>

  <div class="stats" id="statsPanel">
    <div class="stat-card"><h3>Total Logs</h3><span id="totalLogs">0</span></div>
    <div class="stat-card"><h3>Unique Countries</h3><span id="uniqueCountries">0</span></div>
    <div class="stat-card"><h3>Live Visitors</h3><span>👁️ Updating</span></div>
  </div>

  <canvas id="countryChart" height="140"></canvas>

  <h2>📄 Recent Logs</h2>

  <div class="admin-buttons">
    <a href="export_json.php" target="_blank" class="btn-json">📦 Download JSON</a>
    <a href="export_csv.php" target="_blank" class="btn-csv">🧾 Download CSV</a>
    <a href="download_db.php" target="_blank" class="btn-db">💾 Download DB</a>
  </div>

  <pre id="logContent">Loading logs...</pre>

  <script>
    function fetchLog() {
      fetch('log.txt')
        .then(res => res.text())
        .then(data => {
          document.getElementById('logContent').innerText = data || "No logs found.";
          updateStats(data);
          renderChart(data);
        });
    }

    function updateStats(log) {
      const lines = log.trim().split('\n').filter(line => line.trim() !== "");
      document.getElementById("totalLogs").textContent = lines.length;

      const countrySet = new Set();
      lines.forEach(line => {
        const match = line.match(/Country:\s(\w+)/);
        if (match) countrySet.add(match[1]);
      });
      document.getElementById("uniqueCountries").textContent = countrySet.size;
    }

    function renderChart(log) {
      const countries = {};
      log.split('\n').forEach(line => {
        const match = line.match(/Country:\s(\w+)/);
        if (match) {
          const country = match[1];
          countries[country] = (countries[country] || 0) + 1;
        }
      });

      const ctx = document.getElementById('countryChart').getContext('2d');
      if (window.chart) window.chart.destroy();
      window.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(countries),
          datasets: [{
            label: 'Country Logs',
            data: Object.values(countries),
            backgroundColor: '#00ff99'
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    function toggleDarkMode() {
      const bg = document.body.style.background;
      document.body.style.background = (bg === "white") ? "#121212" : "white";
      document.body.style.color = (bg === "white") ? "#000" : "#fff";
    }

    fetchLog();
    setInterval(fetchLog, 30000); // auto-refresh every 30s
  </script>

</body>
</html>
