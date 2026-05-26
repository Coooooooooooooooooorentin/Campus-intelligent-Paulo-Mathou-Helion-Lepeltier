<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupérer les étudiants inscrits aux cours d'un professeur donné avec leurs notes
    if (!isset($_GET['id_prof'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre id_prof manquant.']);
        exit;
    }

    $id_prof = $_GET['id_prof']; // Il s'agit de l'id_utilisateur du professeur

    try {
        // Obtenir l'id de l'enseignant
        $stmt_ens = $conn->prepare("SELECT id FROM enseignants WHERE id_utilisateur = :id_prof");
        $stmt_ens->execute([':id_prof' => $id_prof]);
        $enseignant = $stmt_ens->fetch();

        if (!$enseignant) {
            echo json_encode(['success' => false, 'message' => 'Enseignant non trouvé.']);
            exit;
        }

        $id_enseignant = $enseignant['id'];

        $query = "SELECT 
                    e.id as id_etudiant, 
                    e.matricule, 
                    u.nom, 
                    u.prenom, 
                    c.id as id_cours, 
                    c.titre as cours_titre,
                    c.notes_verrouillees,
                    n.valeur as note
                  FROM inscriptions i
                  JOIN etudiants e ON i.id_etudiant = e.id
                  JOIN utilisateurs u ON e.id_utilisateur = u.id
                  JOIN cours c ON i.id_cours = c.id
                  LEFT JOIN notes n ON n.id_etudiant = e.id AND n.id_cours = c.id
                  WHERE c.id_enseignant = :id_enseignant
                  ORDER BY c.titre, u.nom";

        $stmt = $conn->prepare($query);
        $stmt->execute([':id_enseignant' => $id_enseignant]);
        $etudiants = $stmt->fetchAll();

        echo json_encode(['success' => true, 'etudiants' => $etudiants]);

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ajouter ou mettre à jour une note
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_etudiant) || !isset($data->id_cours) || !isset($data->note)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        // Vérifier si le cours est verrouillé
        $checkLock = $conn->prepare("SELECT notes_verrouillees FROM cours WHERE id = :id_cours");
        $checkLock->execute([':id_cours' => $data->id_cours]);
        $isLocked = $checkLock->fetchColumn();
        
        if ($isLocked == 1) {
            echo json_encode(['success' => false, 'message' => 'Les notes de ce cours sont verrouillées et ne peuvent plus être modifiées.']);
            exit;
        }

        // Vérifier si une note existe déjà pour cet étudiant dans ce cours
        $check = $conn->prepare("SELECT id FROM notes WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
        $check->execute([':id_etudiant' => $data->id_etudiant, ':id_cours' => $data->id_cours]);
        
        if ($check->rowCount() > 0) {
            // Mise à jour de la note existante
            $update = $conn->prepare("UPDATE notes SET valeur = :note, type_evaluation = 'Examen', date_saisie = CURRENT_TIMESTAMP WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
            $update->execute([
                ':note' => $data->note,
                ':id_etudiant' => $data->id_etudiant,
                ':id_cours' => $data->id_cours
            ]);
        } else {
            // Nouvelle note
            $insert = $conn->prepare("INSERT INTO notes (id_etudiant, id_cours, valeur, type_evaluation) VALUES (:id_etudiant, :id_cours, :note, 'Examen')");
            $insert->execute([
                ':note' => $data->note,
                ':id_etudiant' => $data->id_etudiant,
                ':id_cours' => $data->id_cours
            ]);
        }
        
        // ======== NOTIFICATION AUTOMATIQUE (Grand 12) ========
        // Récupération de l'id_utilisateur de l'étudiant
        $getUsr = $conn->prepare("SELECT id_utilisateur FROM etudiants WHERE id = :id_etudiant");
        $getUsr->execute([':id_etudiant' => $data->id_etudiant]);
        $id_destinataire = $getUsr->fetchColumn();

        // Récupération du titre du cours
        $getCours = $conn->prepare("SELECT titre FROM cours WHERE id = :id_cours");
        $getCours->execute([':id_cours' => $data->id_cours]);
        $cours_titre = $getCours->fetchColumn();

        if ($id_destinataire && $cours_titre) {
            $sujet = "Nouvelle note publiée : $cours_titre";
            $contenu = "Bonjour,\n\nUne nouvelle note vient d'être publiée pour le cours de $cours_titre. Vous pouvez la consulter dans votre espace scolarité.\n\nCordialement,\nL'administration.";
            
            // On envoie le message de la part de l'admin (ID 3)
            $msg = $conn->prepare("INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu) VALUES (3, :dest, :sujet, :contenu)");
            $msg->execute([':dest' => $id_destinataire, ':sujet' => $sujet, ':contenu' => $contenu]);
        }
        // =====================================================

        echo json_encode(['success' => true, 'message' => 'Note enregistrée avec succès.']);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
