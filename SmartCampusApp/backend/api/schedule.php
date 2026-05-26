<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id']) || !isset($_GET['role'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
        exit;
    }

    $id = $_GET['id'];
    $role = $_GET['role'];

    try {
        if ($role === 'Etudiant') {
            $query = "SELECT s.id, c.titre, s.date_heure_debut, s.date_heure_fin, s.salle, s.type, u.nom as prof_nom 
                      FROM seances s
                      JOIN cours c ON s.id_cours = c.id
                      JOIN inscriptions i ON c.id = i.id_cours
                      JOIN enseignants e ON c.id_enseignant = e.id
                      JOIN utilisateurs u ON e.id_utilisateur = u.id
                      JOIN etudiants et ON i.id_etudiant = et.id
                      WHERE et.id_utilisateur = :id
                      ORDER BY s.date_heure_debut ASC";
        } else if ($role === 'Professeur') {
            $query = "SELECT s.id, c.titre, s.date_heure_debut, s.date_heure_fin, s.salle, s.type 
                      FROM seances s
                      JOIN cours c ON s.id_cours = c.id
                      JOIN enseignants e ON c.id_enseignant = e.id
                      WHERE e.id_utilisateur = :id
                      ORDER BY s.date_heure_debut ASC";
        } else {
            // Admin voit tout
            $query = "SELECT s.id, c.titre, s.date_heure_debut, s.date_heure_fin, s.salle, s.type, u.nom as prof_nom 
                      FROM seances s
                      JOIN cours c ON s.id_cours = c.id
                      JOIN enseignants e ON c.id_enseignant = e.id
                      JOIN utilisateurs u ON e.id_utilisateur = u.id
                      ORDER BY s.date_heure_debut ASC";
        }

        $stmt = $conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $seances = $stmt->fetchAll();

        // Format dates for the frontend
        foreach ($seances as &$seance) {
            $seance['date'] = date('Y-m-d', strtotime($seance['date_heure_debut']));
            $seance['heure_debut'] = date('H:i', strtotime($seance['date_heure_debut']));
            $seance['heure_fin'] = date('H:i', strtotime($seance['date_heure_fin']));
        }

        echo json_encode(['success' => true, 'seances' => $seances]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
