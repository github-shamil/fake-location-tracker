<?php
session_start();
$PASSWORD = "8590";

// --- Basic 2FA Setup ---
$TWO_FA_ENABLED = false;
$TWO_FA_CODE = "4321"; // Change this for real 2FA

// First login screen
if (!isset($_SESSION['logged_in'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['password'] === $PASSWORD) {
        if ($TWO_FA_ENABLED) {
            $_SESSION['step1_passed'] = true;
            echo '<form method="post">
                    <h2>Enter 2FA Code</h2>
                    <input type="text" name="code" placeholder="One-Time Code" required />
                    <button type="submit">Verify</button>
                  </form>';
            exit();
        } else {
            $_SESSION['logged_in'] = true;
        }
    } elseif (isset($_POST['code']) && $_SESSION['step1_passed'] && $_POST['code'] === $TWO_FA_CODE) {
        $_SESSION['logged_in'] = true;
    } else {
        echo '<form method="post" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <h2>Admin Access</h2>
                <input type="password" name="password" placeholder="Enter Password" />
                <button>Login</button>
              </form>';
        exit();
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit();
}

$db = new SQLite3('log.db');

// Delete logic
if (isset($_POST['delete_all'])) {
    $db->exec("DELETE FROM logs");
    file_put_contents('log.txt', '');
}

if (isset($_POST['delete_selected']) && isset($_POST['delete_ids'])) {
    $ids = array_map('intval', $_POST['delete_ids']);
    $idStr = implode(',', $ids);
    $db->exec("DELETE FROM logs WHERE id IN ($idStr)");
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admin Panel</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
    h1, h2 { color: #0f0; }
    button, a { background: #222; color: #0f0; padding: 8px 16px; margin: 4px; border: none; border-radius: 6px; cursor: pointer; }
    button:hover, a:hover { background: #0f0; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #444; }
    th { background-color: #222; }
    tr:hover { background-color: #333; }
  </style>
</head>
<body>
  <h1>📊 Admin Dashboard</h1>
  <div>
    <a href="?logout=1">Logout</a>
    <a href="export_csv.php">📥 Export CSV</a>
    <a href="export_json.php">📥 Export JSON</a>
    <a href="download_db.php">📥 Download DB</a>
  </div>

  <form method="POST">
    <button type="submit" name="delete_all" onclick="return confirm('Delete ALL logs?')">🗑️ Delete All</button>
    <button type="submit" name="delete_selected" onclick="return confirm('Delete selected logs?')">🗑️ Delete Selected</button>
    <table>
      <thead>
        <tr>
          <th>Select</th>
          <th>ID</th>
          <th>IP</th>
          <th>City</th>
          <th>Country</th>
          <th>Lat/Lon</th>
          <th>Time</th>
          <th>Map</th>
        </tr>
      </thead>
      <tbody>
        <?php
        $results = $db->query("SELECT * FROM logs ORDER BY id DESC");
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            echo "<tr>
              <td><input type='checkbox' name='delete_ids[]' value='{$row['id']}'></td>
              <td>{$row['id']}</td>
              <td>{$row['ip']}</td>
              <td>{$row['city']}</td>
              <td>{$row['country']}</td>
              <td>{$row['latitude']}, {$row['longitude']}</td>
              <td>{$row['timestamp']}</td>
              <td><a href='https://www.google.com/maps?q={$row['latitude']},{$row['longitude']}' target='_blank'>📍</a></td>
            </tr>";
        }
        ?>
      </tbody>
    </table>
  </form>

  <canvas id="chart" height="120"></canvas>

  <script>
    fetch('log.txt')
      .then(res => res.text())
      .then(log => {
        const countries = {};
        log.split('\n').forEach(line => {
          const match = line.match(/Country:\s(\w+)/);
          if (match) {
            const country = match[1];
            countries[country] = (countries[country] || 0) + 1;
          }
        });

        const ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(countries),
            datasets: [{
              label: 'Visits',
              data: Object.values(countries),
              backgroundColor: '#0f0'
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }
        });
      });
  </script>
</body>
</html>
