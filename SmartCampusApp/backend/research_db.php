<?php
include_once 'config/database.php';
$tables = ['cours', 'etudiants', 'inscriptions', 'seances', 'salles'];
foreach ($tables as $table) {
    try {
        echo "=== $table ===\n";
        $stmt = $conn->query("DESCRIBE $table");
        print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
    } catch(PDOException $e) {
        echo "Table introuvable ou erreur : " . $e->getMessage() . "\n";
    }
}
?>
