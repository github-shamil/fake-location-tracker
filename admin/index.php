<?php
// Optional: Redirect to your GitHub Pages frontend
// Uncomment the line below and replace with your actual GitHub Pages URL:
// header("Location: https://yourusername.github.io/fake-location-tracker/");
// exit;

// Default response: block access silently
http_response_code(403);
echo "Unauthorized access. This backend is restricted.";
exit;
?>
