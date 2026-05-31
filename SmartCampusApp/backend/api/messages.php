<?php
/**
 * SMARTCAMPUS API - messages.php
 * 
 * Description : API gérant la communication et les messages internes de la plateforme.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - messages.php
 * 
 * Description : API gérant la communication et les messages internes de la plateforme.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_user'])) {
        echo json_encode(['success' => false, 'message' => 'ID utilisateur manquant.']);
        exit;
    }

    $id_user = $_GET['id_user'];
    $type = isset($_GET['type']) ? $_GET['type'] : 'reception'; // reception ou envoi

    try {
        if ($type === 'reception') {
            $query = "SELECT m.id, m.id_expediteur, m.id_destinataire, m.sujet, m.contenu, m.date_envoi, m.lu, u.nom as expediteur_nom, u.prenom as expediteur_prenom, u.role as expediteur_role 
                      FROM messages m 
                      JOIN utilisateurs u ON m.id_expediteur = u.id 
                      WHERE m.id_destinataire = :id_user 
                      ORDER BY m.date_envoi DESC";
        } else {
            $query = "SELECT m.id, m.id_expediteur, m.id_destinataire, m.sujet, m.contenu, m.date_envoi, m.lu, u.nom as destinataire_nom, u.prenom as destinataire_prenom, u.role as destinataire_role 
                      FROM messages m 
                      JOIN utilisateurs u ON m.id_destinataire = u.id 
                      WHERE m.id_expediteur = :id_user 
                      ORDER BY m.date_envoi DESC";
        }

        $stmt = $conn->prepare($query);
        $stmt->execute([':id_user' => $id_user]);
        $messages = $stmt->fetchAll();

        echo json_encode(['success' => true, 'messages' => $messages]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id_expediteur) || !isset($data->id_destinataire) || !isset($data->sujet) || !isset($data->contenu)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $query = "INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu) VALUES (:exp, :dest, :sujet, :contenu)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':exp' => $data->id_expediteur,
            ':dest' => $data->id_destinataire,
            ':sujet' => $data->sujet,
            ':contenu' => $data->contenu
        ]);
        echo json_encode(['success' => true, 'message' => 'Message envoyé avec succès.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->id_message)) {
        echo json_encode(['success' => false, 'message' => 'ID message manquant.']);
        exit;
    }

    try {
        $query = "UPDATE messages SET lu = 1 WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id' => $data->id_message]);
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->id_message)) {
        echo json_encode(['success' => false, 'message' => 'ID message manquant.']);
        exit;
    }

    try {
        $query = "DELETE FROM messages WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id' => $data->id_message]);
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}
?>
