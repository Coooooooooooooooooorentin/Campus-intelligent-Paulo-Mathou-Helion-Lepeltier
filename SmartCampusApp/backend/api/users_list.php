<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Retourne la liste de tous les utilisateurs (pour le menu déroulant d'envoi de message)
        $query = "SELECT id, nom, prenom, role, email FROM utilisateurs ORDER BY role, nom";
        $stmt = $conn->query($query);
        $users = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'users' => $users]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}
?>
