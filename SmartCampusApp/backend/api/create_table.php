<?php
/**
 * SMARTCAMPUS API - create_table.php
 * 
 * Description : Fichier create_table.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - create_table.php
 * 
 * Description : Fichier create_table.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';
try {
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_expediteur INT NOT NULL,
        id_destinataire INT NOT NULL,
        sujet VARCHAR(255) NOT NULL,
        contenu TEXT NOT NULL,
        date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
        lu TINYINT(1) DEFAULT 0,
        FOREIGN KEY (id_expediteur) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        FOREIGN KEY (id_destinataire) REFERENCES utilisateurs(id) ON DELETE CASCADE
    );";
    $conn->exec($sql);
    echo "Table messages créée.";
} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>
