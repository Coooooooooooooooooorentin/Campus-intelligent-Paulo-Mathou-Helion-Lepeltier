<?php
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_etudiant) || !isset($data->id_cours)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    $id_etudiant = $data->id_etudiant;
    $id_cours = $data->id_cours;

    try {
        $conn->beginTransaction();

        $check_cap = $conn->prepare("
            SELECT c.capacite_max, (SELECT COUNT(*) FROM inscriptions i WHERE i.id_cours = c.id) as inscrits 
            FROM cours c 
            WHERE c.id = :id_cours
        ");
        $check_cap->execute([':id_cours' => $id_cours]);
        $cours = $check_cap->fetch();

        if ($cours['inscrits'] >= $cours['capacite_max']) {
            echo json_encode(['success' => false, 'message' => 'Le cours est complet.']);
            $conn->rollBack();
            exit;
        }

        // 1. Vérification du niveau
        $check_niveau = $conn->prepare("
            SELECT e.annee_etude, c.niveau 
            FROM etudiants e, cours c 
            WHERE e.id = :id_etudiant AND c.id = :id_cours
        ");
        $check_niveau->execute([':id_etudiant' => $id_etudiant, ':id_cours' => $id_cours]);
        $niveau_info = $check_niveau->fetch();
        
        if ($niveau_info && $niveau_info['annee_etude'] !== $niveau_info['niveau'] && $niveau_info['niveau'] !== 'Tous niveaux') {
            echo json_encode(['success' => false, 'message' => "Vous êtes en " . $niveau_info['annee_etude'] . " et ce cours est pour le niveau " . $niveau_info['niveau'] . "."]);
            $conn->rollBack();
            exit;
        }

        // 2. Vérification des conflits d'horaires
        $check_conflit = $conn->prepare("
            SELECT s1.id
            FROM seances s1
            JOIN inscriptions i ON i.id_cours = s1.id_cours
            JOIN seances s2 ON s2.id_cours = :id_cours
            WHERE i.id_etudiant = :id_etudiant
            AND (s1.date_heure_debut < s2.date_heure_fin AND s1.date_heure_fin > s2.date_heure_debut)
        ");
        $check_conflit->execute([':id_cours' => $id_cours, ':id_etudiant' => $id_etudiant]);
        if ($check_conflit->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => "Vous avez déjà un autre cours à ces horaires."]);
            $conn->rollBack();
            exit;
        }

        $check_insc = $conn->prepare("SELECT id FROM inscriptions WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
        $check_insc->execute([':id_etudiant' => $id_etudiant, ':id_cours' => $id_cours]);
        if ($check_insc->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Vous êtes déjà inscrit à ce cours.']);
            $conn->rollBack();
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO inscriptions (id_etudiant, id_cours) VALUES (:id_etudiant, :id_cours)");
        $stmt->execute([':id_etudiant' => $id_etudiant, ':id_cours' => $id_cours]);
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Inscription réussie.']);

    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
} else if ($method === 'GET') {
    // Lister les cours auxquels l'étudiant est inscrit
    if(!isset($_GET['id_etudiant'])) {
        echo json_encode(['success' => false, 'message' => 'ID étudiant manquant.']);
        exit;
    }

    try {
        $query = "SELECT c.id, c.titre, c.description, c.credits_ects, c.categorie, c.niveau, c.notes_verrouillees,
                         u.nom as prof_nom, u.prenom as prof_prenom
                  FROM inscriptions i
                  JOIN cours c ON i.id_cours = c.id
                  JOIN enseignants e ON c.id_enseignant = e.id
                  JOIN utilisateurs u ON e.id_utilisateur = u.id
                  WHERE i.id_etudiant = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id' => $_GET['id_etudiant']]);
        $cours = $stmt->fetchAll();
        echo json_encode(['success' => true, 'cours' => $cours]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
} else if ($method === 'DELETE') {
    // Désinscription d'un étudiant (par lui-même)
    if(!isset($_GET['id_etudiant']) || !isset($_GET['id_cours'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
        exit;
    }

    try {
        // Règle métier : On ne peut pas se désinscrire si le cours est verrouillé !
        $checkLock = $conn->prepare("SELECT notes_verrouillees FROM cours WHERE id = :id_cours");
        $checkLock->execute([':id_cours' => $_GET['id_cours']]);
        if ($checkLock->fetchColumn() == 1) {
            echo json_encode(['success' => false, 'message' => 'Impossible de se désinscrire : les notes de ce cours ont été verrouillées définitivement.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM inscriptions WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
        $stmt->execute([':id_etudiant' => $_GET['id_etudiant'], ':id_cours' => $_GET['id_cours']]);
        echo json_encode(['success' => true, 'message' => 'Vous avez été désinscrit du cours.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
