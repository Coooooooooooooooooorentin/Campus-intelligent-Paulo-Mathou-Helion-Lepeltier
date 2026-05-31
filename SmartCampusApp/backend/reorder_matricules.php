<?php
include_once 'config/database.php';

try {
    $conn->beginTransaction();

    // Nettoyer les enregistrements orphelins
    $conn->exec("DELETE FROM etudiants WHERE id_utilisateur NOT IN (SELECT id FROM utilisateurs)");

    // Sélectionner tous les étudiants restants triés par nom puis prénom
    $stmt_all = $conn->prepare("
        SELECT e.id 
        FROM etudiants e
        JOIN utilisateurs u ON e.id_utilisateur = u.id
        ORDER BY u.nom ASC, u.prenom ASC
    ");
    $stmt_all->execute();
    $all_etudiants = $stmt_all->fetchAll(PDO::FETCH_COLUMN);

    // Mettre tout le monde avec un matricule temporaire
    foreach ($all_etudiants as $id_e) {
        $temp_mat = uniqid('tmp_');
        $conn->prepare("UPDATE etudiants SET matricule = ? WHERE id = ?")->execute([$temp_mat, $id_e]);
    }

    $counter = 1;
    foreach ($all_etudiants as $id_e) {
        $matricule = 'ECE-2026-' . str_pad($counter, 3, '0', STR_PAD_LEFT);
        
        $stmt_update = $conn->prepare("UPDATE etudiants SET matricule = ? WHERE id = ?");
        $stmt_update->execute([$matricule, $id_e]);
        
        $counter++;
    }

    $conn->commit();
    echo "Les matricules ont été réassignés avec succès par ordre alphabétique.";

} catch(PDOException $e) {
    $conn->rollBack();
    echo "Erreur : " . $e->getMessage();
}
?>
