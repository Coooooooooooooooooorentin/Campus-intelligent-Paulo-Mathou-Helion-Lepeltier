<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT id, nom, prenom, email FROM utilisateurs WHERE role = 'Professeur'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
