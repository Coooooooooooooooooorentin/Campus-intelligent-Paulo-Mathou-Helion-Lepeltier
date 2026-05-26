<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_utilisateur'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre manquant.']);
        exit;
    }

    $id_utilisateur = $_GET['id_utilisateur'];

    try {
        // 1. Identité de l'étudiant
        $etuQuery = $conn->prepare("
            SELECT e.id, u.prenom, u.nom, e.matricule, e.annee_etude, u.email
            FROM etudiants e 
            JOIN utilisateurs u ON e.id_utilisateur = u.id 
            WHERE u.id = :id_utilisateur
        ");
        $etuQuery->execute([':id_utilisateur' => $id_utilisateur]);
        $etudiant = $etuQuery->fetch(PDO::FETCH_ASSOC);

        if (!$etudiant) {
            echo json_encode(['success' => false, 'message' => 'Étudiant introuvable.']);
            exit;
        }
        $id_etudiant = $etudiant['id'];

        // 2. Liste des cours suivis et notes
        $notesQuery = $conn->prepare("
            SELECT c.titre, c.credits_ects, n.valeur, n.type_evaluation, 
                   (SELECT AVG(valeur) FROM notes WHERE id_cours = c.id) as moyenne_classe
            FROM inscriptions i
            JOIN cours c ON i.id_cours = c.id
            LEFT JOIN notes n ON n.id_cours = c.id AND n.id_etudiant = :id_etudiant
            WHERE i.id_etudiant = :id_etudiant AND i.statut = 'Actif'
        ");
        $notesQuery->execute([':id_etudiant' => $id_etudiant]);
        $cours = $notesQuery->fetchAll(PDO::FETCH_ASSOC);

        // 3. Calculs
        $total_ects = 0;
        $somme_notes = 0;
        $cours_notes = 0;

        foreach ($cours as &$c) {
            if ($c['valeur'] !== null) {
                $somme_notes += $c['valeur'];
                $cours_notes++;
                if ($c['valeur'] >= 10) {
                    $total_ects += $c['credits_ects'];
                    $c['appreciation'] = 'Validé';
                } else {
                    $c['appreciation'] = 'Non Validé';
                }
            } else {
                $c['appreciation'] = 'En attente';
                $c['valeur'] = '-';
            }
            if ($c['moyenne_classe']) $c['moyenne_classe'] = round($c['moyenne_classe'], 2);
        }

        $gpa = $cours_notes > 0 ? round($somme_notes / $cours_notes, 2) : null;

        // Date de génération
        $date_generation = date('d/m/Y');
        $annee_universitaire = '2025/2026'; // Mock

        echo json_encode([
            'success' => true,
            'etudiant' => $etudiant,
            'cours' => $cours,
            'statistiques' => [
                'gpa' => $gpa,
                'total_ects' => $total_ects
            ],
            'etablissement' => [
                'nom' => 'SmartCampus - ECE Paris',
                'annee' => $annee_universitaire,
                'date_generation' => $date_generation
            ]
        ]);

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
?>
