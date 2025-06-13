<?php
// Secure download of log data from SQLite to CSV

$db = new SQLite3('log.db');

// Set headers
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="visitor_logs.csv"');

// Open output stream
$output = fopen('php://output', 'w');

// CSV headers
fputcsv($output, ['IP Address', 'Latitude', 'Longitude', 'City', 'Country', 'Timestamp', 'Google Maps Link']);

// Query DB
$results = $db->query('SELECT * FROM logs ORDER BY id DESC');

while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $mapLink = "https://www.google.com/maps?q={$row['latitude']},{$row['longitude']}";
    fputcsv($output, [
        $row['ip'],
        $row['latitude'],
        $row['longitude'],
        $row['city'],
        $row['country'],
        $row['timestamp'],
        $mapLink
    ]);
}

fclose($output);
exit;
?>
