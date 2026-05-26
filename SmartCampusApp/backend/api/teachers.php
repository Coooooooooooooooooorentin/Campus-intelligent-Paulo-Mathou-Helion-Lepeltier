<?php
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        // Obtenir un professeur spécifique avec son profil et ses cours
        $id_enseignant = $_GET['id'];
        
        $stmt = $conn->prepare("SELECT e.id, e.departement, u.nom, u.prenom, u.email 
                                FROM enseignants e 
                                JOIN utilisateurs u ON e.id_utilisateur = u.id 
                                WHERE e.id = :id");
        $stmt->execute([':id' => $id_enseignant]);
        $enseignant = $stmt->fetch();

        if (!$enseignant) {
            echo json_encode(['success' => false, 'message' => 'Enseignant non trouvé']);
            exit;
        }

        // Cours dont il est responsable
        $stmt_cours = $conn->prepare("SELECT id, titre, description, credits_ects, capacite_max 
                                      FROM cours 
                                      WHERE id_enseignant = :id");
        $stmt_cours->execute([':id' => $id_enseignant]);
        $cours = $stmt_cours->fetchAll();

        $enseignant['cours'] = $cours;
        
        echo json_encode(['success' => true, 'enseignant' => $enseignant]);

    } else {
        // Lister tous les professeurs
        $stmt = $conn->prepare("SELECT e.id, e.departement, u.nom, u.prenom, u.email 
                                FROM enseignants e 
                                JOIN utilisateurs u ON e.id_utilisateur = u.id 
                                ORDER BY u.nom ASC");
        $stmt->execute();
        $enseignants = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'enseignants' => $enseignants]);
    }

} else if ($method === 'POST') {
    // Ajouter un nouveau professeur
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->email) || !isset($data->nom) || !isset($data->prenom) || !isset($data->departement)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1. Créer Utilisateur
        $mot_de_passe = password_hash('password', PASSWORD_BCRYPT);
        $stmt1 = $conn->prepare("INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role) VALUES (:email, :mdp, :nom, :prenom, 'Professeur')");
        $stmt1->execute([
            ':email' => $data->email,
            ':mdp' => $mot_de_passe,
            ':nom' => $data->nom,
            ':prenom' => $data->prenom
        ]);
        $id_utilisateur = $conn->lastInsertId();

        // 2. Créer Enseignant
        $stmt2 = $conn->prepare("INSERT INTO enseignants (id_utilisateur, departement) VALUES (:id_u, :dep)");
        $stmt2->execute([
            ':id_u' => $id_utilisateur,
            ':dep' => $data->departement
        ]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Enseignant créé avec succès.']);

    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la création : ' . $e->getMessage()]);
    }

} else if ($method === 'PUT') {
    // Mettre à jour un enseignant
    $data = json_decode(file_get_contents("php://input"));
    if(!isset($data->id)) {
        echo json_encode(['success' => false, 'message' => 'ID manquant.']);
        exit;
    }

    try {
        $stmt_u = $conn->prepare("SELECT id_utilisateur FROM enseignants WHERE id = :id");
        $stmt_u->execute([':id' => $data->id]);
        $id_u = $stmt_u->fetchColumn();

        $conn->beginTransaction();

        $stmt1 = $conn->prepare("UPDATE utilisateurs SET nom = :nom, prenom = :prenom, email = :email WHERE id = :id_u");
        $stmt1->execute([':nom' => $data->nom, ':prenom' => $data->prenom, ':email' => $data->email, ':id_u' => $id_u]);

        $stmt2 = $conn->prepare("UPDATE enseignants SET departement = :dep WHERE id = :id");
        $stmt2->execute([':dep' => $data->departement, ':id' => $data->id]);

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
        $stmt_u = $conn->prepare("SELECT id_utilisateur FROM enseignants WHERE id = :id");
        $stmt_u->execute([':id' => $_GET['id']]);
        $id_u = $stmt_u->fetchColumn();

        if ($id_u) {
            $conn->beginTransaction();
            
            // Trouver tous les cours de ce prof
            $stmt_c = $conn->prepare("SELECT id FROM cours WHERE id_enseignant = :id");
            $stmt_c->execute([':id' => $_GET['id']]);
            $cours = $stmt_c->fetchAll(PDO::FETCH_COLUMN);
            
            foreach($cours as $cid) {
                $conn->prepare("DELETE FROM notes WHERE id_cours = :cid")->execute([':cid' => $cid]);
                $conn->prepare("DELETE FROM inscriptions WHERE id_cours = :cid")->execute([':cid' => $cid]);
                $conn->prepare("DELETE FROM cours WHERE id = :cid")->execute([':cid' => $cid]);
            }
            
            $conn->prepare("DELETE FROM enseignants WHERE id = :id")->execute([':id' => $_GET['id']]);
            $stmt = $conn->prepare("DELETE FROM utilisateurs WHERE id = :id_u");
            $stmt->execute([':id_u' => $id_u]);
            
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Enseignant supprimé avec succès. (Ses cours ont également été supprimés)']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Enseignant non trouvé.']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression.']);
    }
}
?>
