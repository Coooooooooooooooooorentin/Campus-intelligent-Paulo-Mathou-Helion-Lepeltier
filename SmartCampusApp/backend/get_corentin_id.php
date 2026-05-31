<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT e.id as id_etudiant FROM utilisateurs u JOIN etudiants e ON u.id = e.id_utilisateur WHERE u.nom LIKE '%Lepeltier%' LIMIT 1");
$id = $stmt->fetchColumn();
echo "ID: $id";
?>
