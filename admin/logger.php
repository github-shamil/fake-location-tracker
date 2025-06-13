<?php
// Set timezone
date_default_timezone_set('Asia/Kolkata');

// Capture visitor's IP
$ip = $_SERVER['REMOTE_ADDR'];
$timestamp = date("Y-m-d H:i:s");

// Get geolocation info from IP
$geoData = @file_get_contents("http://ip-api.com/json/$ip");
$geo = json_decode($geoData, true);

// Fallbacks in case of API failure
$country = $geo['country'] ?? 'Unknown';
$city = $geo['city'] ?? 'Unknown';
$lat = $geo['lat'] ?? '0';
$lon = $geo['lon'] ?? '0';
$google_maps_link = "https://www.google.com/maps?q=$lat,$lon";

// Format log entry
$logEntry = "$timestamp | IP: $ip | Country: $country | City: $city | Lat,Lon: $lat,$lon | Map: $google_maps_link\n";

// Save to log.txt
file_put_contents("log.txt", $logEntry, FILE_APPEND);

// Store in SQLite (log.db)
try {
    $db = new SQLite3('log.db');
    $db->exec("CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        ip TEXT,
        country TEXT,
        city TEXT,
        latitude TEXT,
        longitude TEXT,
        maps_link TEXT
    )");

    $stmt = $db->prepare("INSERT INTO visitors (timestamp, ip, country, city, latitude, longitude, maps_link)
        VALUES (:timestamp, :ip, :country, :city, :latitude, :longitude, :maps_link)");
    $stmt->bindValue(':timestamp', $timestamp);
    $stmt->bindValue(':ip', $ip);
    $stmt->bindValue(':country', $country);
    $stmt->bindValue(':city', $city);
    $stmt->bindValue(':latitude', $lat);
    $stmt->bindValue(':longitude', $lon);
    $stmt->bindValue(':maps_link', $google_maps_link);
    $stmt->execute();
} catch (Exception $e) {
    file_put_contents("error.log", "DB Error: " . $e->getMessage() . "\n", FILE_APPEND);
}

// Send Telegram Notification
$botToken = "7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8"; // Your bot token
$chatId = "6602027873"; // Your Telegram user ID

$telegramMessage = "
🚨 New Visitor Logged 🚨

🕓 Time: $timestamp
🌐 IP: $ip
📍 Location: $city, $country
🌍 GPS: $lat, $lon
🔗 [View on Map]($google_maps_link)
";

$telegramUrl = "https://api.telegram.org/bot$botToken/sendMessage?" .
    http_build_query([
        'chat_id' => $chatId,
        'text' => $telegramMessage,
        'parse_mode' => 'Markdown'
    ]);

@file_get_contents($telegramUrl);

// Return a simple success message (if needed)
echo json_encode(["status" => "success", "message" => "Logged"]);
?>
