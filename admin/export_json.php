<?php
// Export visitor logs as clean JSON

$db = new SQLite3('log.db');

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="visitor_logs.json"');

$results = $db->query('SELECT * FROM logs ORDER BY id DESC');

$data = [];

while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $row['google_maps_link'] = "https://www.google.com/maps?q={$row['latitude']},{$row['longitude']}";
    $data[] = $row;
}

echo json_encode($data, JSON_PRETTY_PRINT);
exit;
?>
