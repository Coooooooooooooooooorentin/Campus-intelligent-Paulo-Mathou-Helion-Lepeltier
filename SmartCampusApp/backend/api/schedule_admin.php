<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id_cours) || !isset($data->date_heure_debut) || !isset($data->date_heure_fin) || !isset($data->salle) || !isset($data->type)) {
        echo json_encode(['success' => false, 'message' => 'Veuillez remplir tous les champs.']);
        exit;
    }

    $id_cours = $data->id_cours;
    $debut = $data->date_heure_debut;
    $fin = $data->date_heure_fin;
    $salle = $data->salle;
    $type = $data->type;

    if (strtotime($debut) >= strtotime($fin)) {
        echo json_encode(['success' => false, 'message' => "L'heure de fin doit être après l'heure de début."]);
        exit;
    }

    try {
        // 1. DÉTECTION CONFLIT DE SALLE
        $stmt = $conn->prepare("SELECT c.titre FROM seances s JOIN cours c ON s.id_cours = c.id 
                                WHERE s.salle = :salle AND (s.date_heure_debut < :fin AND s.date_heure_fin > :debut) LIMIT 1");
        $stmt->execute([':salle' => $salle, ':fin' => $fin, ':debut' => $debut]);
        $conflitSalle = $stmt->fetch();
        if ($conflitSalle) {
            echo json_encode(['success' => false, 'message' => "CONFLIT DE SALLE : La salle $salle est déjà occupée par le cours '" . $conflitSalle['titre'] . "' sur cette plage horaire."]);
            exit;
        }

        // 2. DÉTECTION CONFLIT PROFESSEUR
        $stmt = $conn->prepare("
            SELECT c.titre 
            FROM seances s
            JOIN cours c ON s.id_cours = c.id
            WHERE c.id_enseignant = (SELECT id_enseignant FROM cours WHERE id = :id_cours)
            AND (s.date_heure_debut < :fin AND s.date_heure_fin > :debut)
            LIMIT 1
        ");
        $stmt->execute([':id_cours' => $id_cours, ':fin' => $fin, ':debut' => $debut]);
        $conflitProf = $stmt->fetch();
        if ($conflitProf) {
            echo json_encode(['success' => false, 'message' => "CONFLIT PROFESSEUR : Le professeur de ce cours donne déjà le cours '" . $conflitProf['titre'] . "' sur cette plage horaire."]);
            exit;
        }

        // 3. DÉTECTION CONFLIT ÉTUDIANTS
        $stmt = $conn->prepare("
            SELECT DISTINCT c_conflit.titre 
            FROM seances s
            JOIN cours c_conflit ON s.id_cours = c_conflit.id
            JOIN inscriptions i1 ON s.id_cours = i1.id_cours
            JOIN inscriptions i2 ON i2.id_etudiant = i1.id_etudiant
            WHERE i2.id_cours = :id_cours
            AND s.id_cours != :id_cours
            AND (s.date_heure_debut < :fin AND s.date_heure_fin > :debut)
            LIMIT 1
        ");
        $stmt->execute([':id_cours' => $id_cours, ':fin' => $fin, ':debut' => $debut]);
        $conflitEtudiant = $stmt->fetch();
        if ($conflitEtudiant) {
            echo json_encode(['success' => false, 'message' => "CONFLIT ÉTUDIANT : Au moins un étudiant inscrit à ce cours a déjà le cours '" . $conflitEtudiant['titre'] . "' sur cette plage horaire."]);
            exit;
        }

        // SI AUCUN CONFLIT, ON INSÈRE
        $insertQuery = "INSERT INTO seances (id_cours, date_heure_debut, date_heure_fin, salle, type) 
                        VALUES (:id_cours, :debut, :fin, :salle, :type)";
        $stmt = $conn->prepare($insertQuery);
        $stmt->execute([
            ':id_cours' => $id_cours,
            ':debut' => $debut,
            ':fin' => $fin,
            ':salle' => $salle,
            ':type' => $type
        ]);

        // ======== NOTIFICATION AUTOMATIQUE (Grand 12) ========
        $id_nouvelle_seance = $conn->lastInsertId();
        
        $getCoursInfo = $conn->prepare("SELECT c.titre, e.id_utilisateur as id_prof FROM cours c JOIN enseignants e ON c.id_enseignant = e.id WHERE c.id = :id_cours");
        $getCoursInfo->execute([':id_cours' => $id_cours]);
        $coursInfo = $getCoursInfo->fetch();

        if ($coursInfo) {
            $sujet = "Nouveau cours programmé : " . $coursInfo['titre'];
            $date_formatee = date('d/m/Y', strtotime($debut));
            $heure_debut = date('H:i', strtotime($debut));
            $heure_fin = date('H:i', strtotime($fin));
            $contenu = "Bonjour,\n\nUne nouvelle séance de " . $coursInfo['titre'] . " ($type) a été programmée le $date_formatee de $heure_debut à $heure_fin en salle $salle.\n\nCordialement,\nL'administration.";
            
            // Notifier le professeur
            if ($coursInfo['id_prof']) {
                $msgProf = $conn->prepare("INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu) VALUES (3, :dest, :sujet, :contenu)");
                $msgProf->execute([':dest' => $coursInfo['id_prof'], ':sujet' => $sujet, ':contenu' => $contenu]);
            }

            // Notifier les étudiants inscrits
            $getEtudiants = $conn->prepare("SELECT e.id_utilisateur FROM inscriptions i JOIN etudiants e ON i.id_etudiant = e.id WHERE i.id_cours = :id_cours");
            $getEtudiants->execute([':id_cours' => $id_cours]);
            $etudiants = $getEtudiants->fetchAll(PDO::FETCH_COLUMN);

            $msgEtu = $conn->prepare("INSERT INTO messages (id_expediteur, id_destinataire, sujet, contenu) VALUES (3, :dest, :sujet, :contenu)");
            foreach ($etudiants as $id_etu) {
                if ($id_etu) {
                    $msgEtu->execute([':dest' => $id_etu, ':sujet' => $sujet, ':contenu' => $contenu]);
                }
            }
        }
        // =====================================================

        echo json_encode(['success' => true, 'message' => 'Séance planifiée avec succès.']);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }
}
?>
