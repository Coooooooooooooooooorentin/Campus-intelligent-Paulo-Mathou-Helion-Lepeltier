<?php
include_once 'config/database.php';
$stmt = $conn->query("SELECT u.nom, u.prenom, COUNT(i.id_cours) as nb_cours FROM utilisateurs u JOIN etudiants e ON u.id = e.id_utilisateur LEFT JOIN inscriptions i ON e.id = i.id_etudiant WHERE u.nom LIKE '%Lepeltier%' GROUP BY e.id");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
