<?php
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Lister les étudiants inscrits à un cours spécifique
    if(!isset($_GET['id_cours'])) {
        echo json_encode(['success' => false, 'message' => 'ID du cours manquant.']);
        exit;
    }

    try {
        $query = "SELECT e.id as id_etudiant, e.matricule, u.nom, u.prenom, u.email
                  FROM inscriptions i
                  JOIN etudiants e ON i.id_etudiant = e.id
                  JOIN utilisateurs u ON e.id_utilisateur = u.id
                  WHERE i.id_cours = :id_cours
                  ORDER BY u.nom";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id_cours' => $_GET['id_cours']]);
        $etudiants = $stmt->fetchAll();
        echo json_encode(['success' => true, 'etudiants' => $etudiants]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
} else if ($method === 'POST') {
    // Inscription manuelle par l'admin
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_etudiant) || !isset($data->id_cours)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $conn->beginTransaction();

        $check_cap = $conn->prepare("SELECT c.capacite_max, (SELECT COUNT(*) FROM inscriptions i WHERE i.id_cours = c.id) as inscrits FROM cours c WHERE c.id = :id_cours");
        $check_cap->execute([':id_cours' => $data->id_cours]);
        $cours = $check_cap->fetch();

        if ($cours['inscrits'] >= $cours['capacite_max']) {
            echo json_encode(['success' => false, 'message' => 'Le cours est plein. L\'inscription a échoué.']);
            $conn->rollBack();
            exit;
        }

        $check_insc = $conn->prepare("SELECT id FROM inscriptions WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
        $check_insc->execute([':id_etudiant' => $data->id_etudiant, ':id_cours' => $data->id_cours]);
        if ($check_insc->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'L\'étudiant est déjà inscrit.']);
            $conn->rollBack();
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO inscriptions (id_etudiant, id_cours) VALUES (:id_etudiant, :id_cours)");
        $stmt->execute([':id_etudiant' => $data->id_etudiant, ':id_cours' => $data->id_cours]);
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Étudiant ajouté au cours avec succès.']);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
} else if ($method === 'DELETE') {
    // Désinscription forcée par l'admin
    if(!isset($_GET['id_etudiant']) || !isset($_GET['id_cours'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
        exit;
    }

    try {
        // L'admin a le droit de désinscrire même si verrouillé, ou on peut l'interdire. 
        // Par sécurité et respect de la règle, on l'interdit si verrouillé, sauf cas exceptionnels. 
        // Le cahier des charges dit "verrouillage", donc on bloque.
        $checkLock = $conn->prepare("SELECT notes_verrouillees FROM cours WHERE id = :id_cours");
        $checkLock->execute([':id_cours' => $_GET['id_cours']]);
        if ($checkLock->fetchColumn() == 1) {
            echo json_encode(['success' => false, 'message' => 'Impossible de désinscrire l\'étudiant : les notes de ce cours ont été verrouillées définitivement par le professeur.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM inscriptions WHERE id_etudiant = :id_etudiant AND id_cours = :id_cours");
        $stmt->execute([':id_etudiant' => $_GET['id_etudiant'], ':id_cours' => $_GET['id_cours']]);
        echo json_encode(['success' => true, 'message' => 'L\'étudiant a été retiré du cours.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
