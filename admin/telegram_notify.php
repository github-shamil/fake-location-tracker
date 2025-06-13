<?php
// Telegram Notification System
$TOKEN = "7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8";
$CHAT_ID = "6602027873"; // Yours

function sendTelegram($message) {
    global $TOKEN, $CHAT_ID;
    $url = "https://api.telegram.org/bot$TOKEN/sendMessage";
    $data = [
        'chat_id' => $CHAT_ID,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    file_get_contents($url . '?' . http_build_query($data));
}
?>
