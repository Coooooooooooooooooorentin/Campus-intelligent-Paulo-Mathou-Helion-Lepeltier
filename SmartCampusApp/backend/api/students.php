<?php
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        // Obtenir un étudiant spécifique avec son profil, cours et notes
        $id_etudiant = $_GET['id'];
        
        // 1. Infos basiques
        $stmt = $conn->prepare("SELECT e.id, e.matricule, e.annee_etude, u.nom, u.prenom, u.email 
                                FROM etudiants e 
                                JOIN utilisateurs u ON e.id_utilisateur = u.id 
                                WHERE e.id = :id");
        $stmt->execute([':id' => $id_etudiant]);
        $etudiant = $stmt->fetch();

        if (!$etudiant) {
            echo json_encode(['success' => false, 'message' => 'Étudiant non trouvé']);
            exit;
        }

        // 2. Cours inscrits et notes
        $stmt_cours = $conn->prepare("SELECT c.id, c.titre, c.credits_ects, n.valeur as note
                                      FROM inscriptions i
                                      JOIN cours c ON i.id_cours = c.id
                                      LEFT JOIN notes n ON n.id_etudiant = i.id_etudiant AND n.id_cours = c.id
                                      WHERE i.id_etudiant = :id");
        $stmt_cours->execute([':id' => $id_etudiant]);
        $cours = $stmt_cours->fetchAll();

        $etudiant['cours'] = $cours;
        
        echo json_encode(['success' => true, 'etudiant' => $etudiant]);

    } else {
        // Lister tous les étudiants
        $stmt = $conn->prepare("SELECT e.id, e.matricule, e.annee_etude, u.nom, u.prenom, u.email 
                                FROM etudiants e 
                                JOIN utilisateurs u ON e.id_utilisateur = u.id 
                                ORDER BY u.nom ASC");
        $stmt->execute();
        $etudiants = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'etudiants' => $etudiants]);
    }

} else if ($method === 'POST') {
    // Ajouter un nouvel étudiant
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->email) || !isset($data->nom) || !isset($data->prenom) || !isset($data->matricule) || !isset($data->annee_etude)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1. Créer Utilisateur
        $mot_de_passe = password_hash('password', PASSWORD_BCRYPT); // Mot de passe par défaut
        $stmt1 = $conn->prepare("INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role) VALUES (:email, :mdp, :nom, :prenom, 'Etudiant')");
        $stmt1->execute([
            ':email' => $data->email,
            ':mdp' => $mot_de_passe,
            ':nom' => $data->nom,
            ':prenom' => $data->prenom
        ]);
        $id_utilisateur = $conn->lastInsertId();

        // 2. Créer Étudiant
        $stmt2 = $conn->prepare("INSERT INTO etudiants (id_utilisateur, matricule, annee_etude) VALUES (:id_u, :mat, :annee)");
        $stmt2->execute([
            ':id_u' => $id_utilisateur,
            ':mat' => $data->matricule,
            ':annee' => $data->annee_etude
        ]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Étudiant créé avec succès.']);

    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la création : ' . $e->getMessage()]);
    }

} else if ($method === 'PUT') {
    // Mettre à jour un étudiant (Infos)
    $data = json_decode(file_get_contents("php://input"));
    if(!isset($data->id)) {
        echo json_encode(['success' => false, 'message' => 'ID manquant.']);
        exit;
    }

    try {
        // Récupérer l'id_utilisateur correspondant
        $stmt_u = $conn->prepare("SELECT id_utilisateur FROM etudiants WHERE id = :id");
        $stmt_u->execute([':id' => $data->id]);
        $id_u = $stmt_u->fetchColumn();

        $conn->beginTransaction();

        $stmt1 = $conn->prepare("UPDATE utilisateurs SET nom = :nom, prenom = :prenom, email = :email WHERE id = :id_u");
        $stmt1->execute([':nom' => $data->nom, ':prenom' => $data->prenom, ':email' => $data->email, ':id_u' => $id_u]);

        $stmt2 = $conn->prepare("UPDATE etudiants SET matricule = :mat, annee_etude = :annee WHERE id = :id");
        $stmt2->execute([':mat' => $data->matricule, ':annee' => $data->annee_etude, ':id' => $data->id]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Profil mis à jour.']);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour.']);
    }
} else if ($method === 'DELETE') {
    if(!isset($_GET['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID manquant.']);
        exit;
    }
    try {
        $stmt_u = $conn->prepare("SELECT id_utilisateur FROM etudiants WHERE id = :id");
        $stmt_u->execute([':id' => $_GET['id']]);
        $id_u = $stmt_u->fetchColumn();

        if ($id_u) {
            $conn->beginTransaction();
            // Supprimer d'abord les notes
            $conn->prepare("DELETE FROM notes WHERE id_etudiant = :id")->execute([':id' => $_GET['id']]);
            // Supprimer les inscriptions
            $conn->prepare("DELETE FROM inscriptions WHERE id_etudiant = :id")->execute([':id' => $_GET['id']]);
            // Supprimer l'étudiant
            $conn->prepare("DELETE FROM etudiants WHERE id = :id")->execute([':id' => $_GET['id']]);
            // Supprimer l'utilisateur
            $stmt = $conn->prepare("DELETE FROM utilisateurs WHERE id = :id_u");
            $stmt->execute([':id_u' => $id_u]);
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Étudiant supprimé avec succès.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Étudiant non trouvé.']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression.']);
    }
}
?>
