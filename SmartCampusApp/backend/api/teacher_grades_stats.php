<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_prof'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre id_prof manquant.']);
        exit;
    }

    $id_prof = $_GET['id_prof']; // id_utilisateur du prof

    try {
        $stmt_ens = $conn->prepare("SELECT id FROM enseignants WHERE id_utilisateur = :id_prof");
        $stmt_ens->execute([':id_prof' => $id_prof]);
        $enseignant = $stmt_ens->fetch();

        if (!$enseignant) {
            echo json_encode(['success' => false, 'message' => 'Enseignant non trouvé.']);
            exit;
        }

        $id_enseignant = $enseignant['id'];

        // Obtenir tous les cours du prof
        $query = "SELECT id as id_cours, titre FROM cours WHERE id_enseignant = :id_enseignant";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id_enseignant' => $id_enseignant]);
        $cours = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $resultats = [];

        foreach ($cours as $c) {
            $id_cours = $c['id_cours'];

            // Stats du cours
            $q_stats = $conn->prepare("
                SELECT 
                    AVG(valeur) as moyenne, 
                    MIN(valeur) as min_note, 
                    MAX(valeur) as max_note,
                    COUNT(valeur) as nb_notes,
                    SUM(CASE WHEN valeur >= 10 THEN 1 ELSE 0 END) as nb_reussites
                FROM notes WHERE id_cours = :id_cours
            ");
            $q_stats->execute([':id_cours' => $id_cours]);
            $stats = $q_stats->fetch(PDO::FETCH_ASSOC);

            $taux_reussite = null;
            if ($stats['nb_notes'] > 0) {
                $taux_reussite = ($stats['nb_reussites'] / $stats['nb_notes']) * 100;
            }

            $resultats[] = [
                'id_cours' => $id_cours,
                'titre' => $c['titre'],
                'moyenne' => $stats['moyenne'] !== null ? round($stats['moyenne'], 2) : null,
                'min' => $stats['min_note'] !== null ? round($stats['min_note'], 2) : null,
                'max' => $stats['max_note'] !== null ? round($stats['max_note'], 2) : null,
                'taux_reussite' => $taux_reussite !== null ? round($taux_reussite, 1) : null,
                'nb_notes' => $stats['nb_notes']
            ];
        }

        echo json_encode(['success' => true, 'stats' => $resultats]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
