<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_etudiant'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre id_etudiant manquant.']);
        exit;
    }

    $id_etudiant = $_GET['id_etudiant'];

    try {
        // Obtenir tous les cours où l'étudiant est inscrit
        $query = "SELECT c.id as id_cours, c.titre 
                  FROM inscriptions i 
                  JOIN cours c ON i.id_cours = c.id 
                  WHERE i.id_etudiant = :id_etudiant";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id_etudiant' => $id_etudiant]);
        $cours = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $resultats = [];

        foreach ($cours as $c) {
            $id_cours = $c['id_cours'];

            // Obtenir la note de l'étudiant
            $q_note = $conn->prepare("SELECT valeur FROM notes WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
            $q_note->execute([':id_etudiant' => $id_etudiant, ':id_cours' => $id_cours]);
            $note_etudiant = $q_note->fetchColumn();

            // Obtenir les stats globales du cours
            $q_stats = $conn->prepare("SELECT AVG(valeur) as moyenne, MIN(valeur) as min_note, MAX(valeur) as max_note 
                                       FROM notes WHERE id_cours = :id_cours");
            $q_stats->execute([':id_cours' => $id_cours]);
            $stats = $q_stats->fetch(PDO::FETCH_ASSOC);

            $resultats[] = [
                'id_cours' => $id_cours,
                'titre' => $c['titre'],
                'note' => $note_etudiant !== false ? round($note_etudiant, 2) : null,
                'moyenne_classe' => $stats['moyenne'] !== null ? round($stats['moyenne'], 2) : null,
                'note_min' => $stats['min_note'] !== null ? round($stats['min_note'], 2) : null,
                'note_max' => $stats['max_note'] !== null ? round($stats['max_note'], 2) : null
            ];
        }

        echo json_encode(['success' => true, 'grades' => $resultats]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
