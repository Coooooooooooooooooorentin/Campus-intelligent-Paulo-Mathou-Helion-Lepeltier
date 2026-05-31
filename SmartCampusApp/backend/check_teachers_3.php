<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT id, nom, prenom, email FROM utilisateurs WHERE role = 'Professeur' OR role = 'Enseignant' LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
