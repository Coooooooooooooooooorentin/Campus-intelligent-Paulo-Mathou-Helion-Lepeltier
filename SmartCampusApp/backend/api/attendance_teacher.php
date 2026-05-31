<?php
/**
 * SMARTCAMPUS API - attendance_teacher.php
 * 
 * Description : Fichier attendance_teacher.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - attendance_teacher.php
 * 
 * Description : Fichier attendance_teacher.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Deux modes :
    // 1. ?id_prof=X : Obtenir les séances (cours passés ou futurs) associées au prof
    // 2. ?id_seance=Y : Obtenir la liste des étudiants avec leur statut de présence pour l'appel

    if (isset($_GET['id_prof'])) {
        try {
            $id_prof = $_GET['id_prof'];
            
            // Trouver l'id de l'enseignant
            $stmt_ens = $conn->prepare("SELECT id FROM enseignants WHERE id_utilisateur = :id_prof");
            $stmt_ens->execute([':id_prof' => $id_prof]);
            $enseignant = $stmt_ens->fetch();
            if (!$enseignant) {
                echo json_encode(['success' => false, 'message' => 'Enseignant non trouvé.']);
                exit;
            }

            // Récupérer les séances de ses cours
            $query = "
                SELECT s.id as id_seance, s.date_heure_debut, s.date_heure_fin, s.salle, s.type, c.titre as cours_titre, c.id as id_cours
                FROM seances s
                JOIN cours c ON s.id_cours = c.id
                WHERE c.id_enseignant = :id_enseignant
                ORDER BY s.date_heure_debut DESC
            ";
            $stmt = $conn->prepare($query);
            $stmt->execute([':id_enseignant' => $enseignant['id']]);
            $seances = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'seances' => $seances]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
        }
    } else if (isset($_GET['id_seance'])) {
        try {
            $id_seance = $_GET['id_seance'];

            // Trouver le cours lié à la séance
            $q = $conn->prepare("SELECT id_cours FROM seances WHERE id = :id_seance");
            $q->execute([':id_seance' => $id_seance]);
            $id_cours = $q->fetchColumn();

            // Récupérer tous les étudiants inscrits à ce cours
            $query = "
                SELECT e.id as id_etudiant, e.matricule, u.nom, u.prenom
                FROM inscriptions i
                JOIN etudiants e ON i.id_etudiant = e.id
                JOIN utilisateurs u ON e.id_utilisateur = u.id
                WHERE i.id_cours = :id_cours
                ORDER BY u.nom ASC
            ";
            $stmt = $conn->prepare($query);
            $stmt->execute([':id_cours' => $id_cours]);
            $etudiants = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Pour chaque étudiant, vérifier s'il a déjà un statut dans `presences` pour cette séance
            $result = [];
            foreach ($etudiants as $etudiant) {
                $q2 = $conn->prepare("SELECT statut FROM presences WHERE id_etudiant = :id_etudiant AND id_seance = :id_seance");
                $q2->execute([':id_etudiant' => $etudiant['id_etudiant'], ':id_seance' => $id_seance]);
                $statut = $q2->fetchColumn();

                $result[] = [
                    'id_etudiant' => $etudiant['id_etudiant'],
                    'matricule' => $etudiant['matricule'],
                    'nom' => $etudiant['nom'],
                    'prenom' => $etudiant['prenom'],
                    'statut' => $statut ?: 'Non renseigné' // Par défaut
                ];
            }

            echo json_encode(['success' => true, 'etudiants' => $result]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Paramètre manquant.']);
    }

} else if ($method === 'POST') {
    // Mettre à jour le statut d'un étudiant pour une séance
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_seance) || !isset($data->id_etudiant) || !isset($data->statut)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        // Vérifier si un enregistrement existe
        $check = $conn->prepare("SELECT id FROM presences WHERE id_etudiant = :id_etudiant AND id_seance = :id_seance");
        $check->execute([':id_etudiant' => $data->id_etudiant, ':id_seance' => $data->id_seance]);
        $exists = $check->fetchColumn();

        if ($exists) {
            // Update
            $stmt = $conn->prepare("UPDATE presences SET statut = :statut WHERE id = :id");
            $stmt->execute([':statut' => $data->statut, ':id' => $exists]);
        } else {
            // Insert
            $stmt = $conn->prepare("INSERT INTO presences (id_etudiant, id_seance, statut) VALUES (:id_etudiant, :id_seance, :statut)");
            $stmt->execute([':id_etudiant' => $data->id_etudiant, ':id_seance' => $data->id_seance, ':statut' => $data->statut]);
        }
        
        // ======== NOTIFICATION AUTOMATIQUE (Grand 12) ========
        if ($data->statut === 'Absent') {
            $getUsr = $conn->prepare("SELECT id_utilisateur FROM etudiants WHERE id = :id_etudiant");
            $getUsr->execute([':id_etudiant' => $data->id_etudiant]);
            $id_destinataire = $getUsr->fetchColumn();

            $getSeance = $conn->prepare("SELECT c.titre, s.date_heure_debut FROM seances s JOIN cours c ON s.id_cours = c.id WHERE s.id = :id_seance");
            $getSeance->execute([':id_seance' => $data->id_seance]);
            $seanceInfo = $getSeance->fetch();

            if ($id_destinataire && $seanceInfo) {
                $sujet = "Alerte Absence : " . $seanceInfo['titre'];
                $date_formatee = date('d/m/Y à H:i', strtotime($seanceInfo['date_heure_debut']));
                $contenu = "Bonjour,\n\nVous avez été noté(e) ABSENT(E) au cours de " . $seanceInfo['titre'] . " du $date_formatee.\n\nVeuillez justifier cette absence auprès de la scolarité dans les plus brefs délais.\n\nCordialement,\nL'administration.";
                
                $msg = $conn->prepare("INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu) VALUES (3, :dest, :sujet, :contenu)");
                $msg->execute([':dest' => $id_destinataire, ':sujet' => $sujet, ':contenu' => $contenu]);
            }
        }
        // =====================================================
        
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
