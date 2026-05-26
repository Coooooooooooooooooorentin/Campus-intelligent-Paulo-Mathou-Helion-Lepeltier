<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_etudiant'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre manquant.']);
        exit;
    }

    try {
        $id_etudiant = $_GET['id_etudiant'];

        // 1. Historique détaillé
        $query = "
            SELECT p.statut, s.date_heure_debut, s.date_heure_fin, s.type, c.titre as cours_titre
            FROM presences p
            JOIN seances s ON p.id_seance = s.id
            JOIN cours c ON s.id_cours = c.id
            WHERE p.id_etudiant = :id_etudiant
            ORDER BY s.date_heure_debut DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id_etudiant' => $id_etudiant]);
        $historique = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Résumé des absences/retards
        $q_stats = $conn->prepare("
            SELECT 
                SUM(CASE WHEN statut = 'Absent' THEN 1 ELSE 0 END) as total_absences,
                SUM(CASE WHEN statut = 'Retard' THEN 1 ELSE 0 END) as total_retards
            FROM presences
            WHERE id_etudiant = :id_etudiant
        ");
        $q_stats->execute([':id_etudiant' => $id_etudiant]);
        $stats = $q_stats->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true, 
            'historique' => $historique,
            'stats' => [
                'absences' => $stats['total_absences'] ?: 0,
                'retards' => $stats['total_retards'] ?: 0
            ]
        ]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validation du scan QR Code
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_etudiant) || !isset($data->id_seance)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $id_etudiant = $data->id_etudiant;
        $id_seance = $data->id_seance;
        $statut = 'Present';

        $check = $conn->prepare("SELECT id FROM presences WHERE id_etudiant = :id_etudiant AND id_seance = :id_seance");
        $check->execute([':id_etudiant' => $id_etudiant, ':id_seance' => $id_seance]);
        $exists = $check->fetchColumn();

        if ($exists) {
            $stmt = $conn->prepare("UPDATE presences SET statut = :statut WHERE id = :id");
            $stmt->execute([':statut' => $statut, ':id' => $exists]);
        } else {
            $stmt = $conn->prepare("INSERT INTO presences (id_etudiant, id_seance, statut) VALUES (:id_etudiant, :id_seance, :statut)");
            $stmt->execute([':id_etudiant' => $id_etudiant, ':id_seance' => $id_seance, ':statut' => $statut]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Présence validée avec succès !']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
