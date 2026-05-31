<?php
/**
 * SMARTCAMPUS API - dashboard.php
 * 
 * Description : Fichier dashboard.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - dashboard.php
 * 
 * Description : Fichier dashboard.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id']) || !isset($_GET['role'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
        exit;
    }

    $id = $_GET['id']; // id utilisateur
    $role = $_GET['role'];

    try {
        // --- COMMUN : Messages non lus ---
        $msgQuery = $conn->prepare("SELECT COUNT(*) as nb FROM messages WHERE id_destinataire = :id AND lu = 0");
        $msgQuery->execute([':id' => $id]);
        $messages_non_lus = $msgQuery->fetch()['nb'];

        if ($role === 'Etudiant') {
            // ID Etudiant
            $etuQuery = $conn->prepare("SELECT id FROM etudiants WHERE id_utilisateur = :id");
            $etuQuery->execute([':id' => $id]);
            $id_etudiant = $etuQuery->fetchColumn();

            if (!$id_etudiant) {
                echo json_encode(['success' => false, 'message' => 'Étudiant introuvable.']);
                exit;
            }

            // Cours inscrits
            $coursQuery = $conn->prepare("SELECT COUNT(*) as nb FROM inscriptions WHERE id_etudiant = :id_etudiant AND statut = 'Actif'");
            $coursQuery->execute([':id_etudiant' => $id_etudiant]);
            $nb_cours = $coursQuery->fetchColumn();

            // Moyenne (GPA)
            $gpaQuery = $conn->prepare("SELECT AVG(valeur) as gpa FROM notes WHERE id_etudiant = :id_etudiant");
            $gpaQuery->execute([':id_etudiant' => $id_etudiant]);
            $gpa = $gpaQuery->fetchColumn();

            // Absences
            $absQuery = $conn->prepare("SELECT COUNT(*) as nb FROM presences WHERE id_etudiant = :id_etudiant AND statut = 'Absent'");
            $absQuery->execute([':id_etudiant' => $id_etudiant]);
            $absences = $absQuery->fetchColumn();

            // Prochaines Séances
            $seancesQuery = $conn->prepare("
                SELECT s.date_heure_debut, s.date_heure_fin, s.salle, s.type, c.titre 
                FROM seances s 
                JOIN cours c ON s.id_cours = c.id
                JOIN inscriptions i ON c.id = i.id_cours
                WHERE i.id_etudiant = :id_etudiant AND s.date_heure_debut >= NOW()
                ORDER BY s.date_heure_debut ASC LIMIT 3
            ");
            $seancesQuery->execute([':id_etudiant' => $id_etudiant]);
            $prochaines_seances = $seancesQuery->fetchAll();

            // Dernières notes
            $notesQuery = $conn->prepare("
                SELECT n.valeur, n.type_evaluation, c.titre, n.date_saisie 
                FROM notes n 
                JOIN cours c ON n.id_cours = c.id
                WHERE n.id_etudiant = :id_etudiant 
                ORDER BY n.date_saisie DESC LIMIT 3
            ");
            $notesQuery->execute([':id_etudiant' => $id_etudiant]);
            $dernieres_notes = $notesQuery->fetchAll();

            echo json_encode([
                'success' => true,
                'stats' => [
                    'nb_cours' => $nb_cours,
                    'gpa' => $gpa ? round($gpa, 2) : null,
                    'absences' => $absences,
                    'messages_non_lus' => $messages_non_lus,
                    'prochaines_seances' => $prochaines_seances,
                    'dernieres_notes' => $dernieres_notes
                ]
            ]);

        } else if ($role === 'Professeur') {
            // ID Prof
            $profQuery = $conn->prepare("SELECT id FROM enseignants WHERE id_utilisateur = :id");
            $profQuery->execute([':id' => $id]);
            $id_prof = $profQuery->fetchColumn();

            if (!$id_prof) {
                echo json_encode(['success' => false, 'message' => 'Professeur introuvable.']);
                exit;
            }

            // Cours enseignés
            $coursQuery = $conn->prepare("SELECT COUNT(*) FROM cours WHERE id_enseignant = :id_prof");
            $coursQuery->execute([':id_prof' => $id_prof]);
            $cours_enseignes = $coursQuery->fetchColumn();

            // Etudiants inscrits
            $etuQuery = $conn->prepare("
                SELECT COUNT(DISTINCT i.id_etudiant) 
                FROM inscriptions i 
                JOIN cours c ON i.id_cours = c.id 
                WHERE c.id_enseignant = :id_prof AND i.statut = 'Actif'
            ");
            $etuQuery->execute([':id_prof' => $id_prof]);
            $total_etudiants = $etuQuery->fetchColumn();

            // Prochaines Séances
            $seancesQuery = $conn->prepare("
                SELECT s.id as id_seance, s.date_heure_debut, s.date_heure_fin, s.salle, s.type, c.titre 
                FROM seances s 
                JOIN cours c ON s.id_cours = c.id
                WHERE c.id_enseignant = :id_prof AND s.date_heure_debut >= NOW()
                ORDER BY s.date_heure_debut ASC LIMIT 3
            ");
            $seancesQuery->execute([':id_prof' => $id_prof]);
            $prochaines_seances = $seancesQuery->fetchAll();

            echo json_encode([
                'success' => true,
                'stats' => [
                    'cours_enseignes' => $cours_enseignes,
                    'total_etudiants' => $total_etudiants,
                    'messages_non_lus' => $messages_non_lus,
                    'prochaines_seances' => $prochaines_seances
                ]
            ]);

        } else {
            // Admin
            $totalEtudiants = $conn->query("SELECT COUNT(*) FROM etudiants")->fetchColumn();
            $totalProfesseurs = $conn->query("SELECT COUNT(*) FROM enseignants")->fetchColumn();
            $coursActifs = $conn->query("SELECT COUNT(*) FROM cours")->fetchColumn();
            $totalSeances = $conn->query("SELECT COUNT(*) FROM seances")->fetchColumn();
            $totalAbsences = $conn->query("SELECT COUNT(*) FROM presences WHERE statut = 'Absent'")->fetchColumn();

            // Détection prédictive des étudiants à risque
            // (Étudiants avec 5 absences ou plus ou moyenne générale < 10)
            $risqueQuery = $conn->query("
                SELECT e.id, u.nom, u.prenom, e.matricule,
                  (SELECT COUNT(*) FROM presences WHERE id_etudiant = e.id AND statut = 'Absent') as nb_absences,
                  (SELECT AVG(valeur) FROM notes WHERE id_etudiant = e.id) as gpa
                FROM etudiants e
                JOIN utilisateurs u ON e.id_utilisateur = u.id
                HAVING nb_absences >= 5 OR (gpa IS NOT NULL AND gpa < 10)
                ORDER BY nb_absences DESC, gpa ASC
                LIMIT 5
            ");
            $etudiants_a_risque = $risqueQuery->fetchAll(PDO::FETCH_ASSOC);

            // Statistiques Académiques Globales
            $gpaGlobal = $conn->query("SELECT AVG(valeur) FROM notes")->fetchColumn();
            
            $totalNotes = $conn->query("SELECT COUNT(*) FROM notes")->fetchColumn();
            $notesValidees = $conn->query("SELECT COUNT(*) FROM notes WHERE valeur >= 10")->fetchColumn();
            $tauxReussite = $totalNotes > 0 ? round(($notesValidees / $totalNotes) * 100) : 0;

            // Matières Top et Flop
            $moyennesCours = $conn->query("
                SELECT c.titre, AVG(n.valeur) as moyenne
                FROM notes n
                JOIN cours c ON n.id_cours = c.id
                GROUP BY c.id
                HAVING COUNT(n.id) > 0
                ORDER BY moyenne DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            $topCours = count($moyennesCours) > 0 ? $moyennesCours[0] : null;
            $flopCours = count($moyennesCours) > 0 ? end($moyennesCours) : null;

            $academique = [
                'gpa_global' => $gpaGlobal ? round($gpaGlobal, 2) : null,
                'taux_reussite' => $tauxReussite,
                'top_cours' => $topCours,
                'flop_cours' => $flopCours
            ];

            echo json_encode([
                'success' => true,
                'stats' => [
                    'total_etudiants' => $totalEtudiants,
                    'total_professeurs' => $totalProfesseurs,
                    'cours_actifs' => $coursActifs,
                    'total_seances' => $totalSeances,
                    'total_absences' => $totalAbsences,
                    'messages_non_lus' => $messages_non_lus,
                    'etudiants_a_risque' => $etudiants_a_risque,
                    'academique' => $academique
                ]
            ]);
        }

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
?>
