<?php
// Force download of raw SQLite database file

$filename = 'log.db';

if (file_exists($filename)) {
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
    header('Content-Length: ' . filesize($filename));
    readfile($filename);
    exit;
} else {
    echo "Database file not found.";
}
?>
