<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT type, COUNT(*) as nb FROM seances GROUP BY type");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
