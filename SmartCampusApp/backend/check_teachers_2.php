<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT id, nom, prenom FROM utilisateurs WHERE nom LIKE 'Intervenant%' LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
