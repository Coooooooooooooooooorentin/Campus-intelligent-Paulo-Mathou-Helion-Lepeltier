<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lister tous les cours
    $query = "SELECT c.id, c.titre, c.description, c.credits_ects, c.capacite_max, c.categorie, c.niveau,
                     u.nom as prof_nom, u.prenom as prof_prenom,
                     (SELECT COUNT(*) FROM inscriptions i WHERE i.id_cours = c.id) as inscrits
              FROM cours c
              LEFT JOIN enseignants e ON c.id_enseignant = e.id
              LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $cours = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'cours' => $cours
    ]);

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // S'inscrire à un cours
    $data = json_decode(file_get_contents("php://input"));
    if(!isset($data->id_etudiant) || !isset($data->id_cours)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $query = "INSERT INTO inscriptions (id_etudiant, id_cours) VALUES (:id_etu, :id_cours)";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id_etu' => $data->id_etudiant, ':id_cours' => $data->id_cours]);
        echo json_encode(['success' => true, 'message' => 'Inscription réussie.']);
    } catch(PDOException $e) {
        if ($e->getCode() == 23000) { // Constraint violation (Duplicate entry)
            echo json_encode(['success' => false, 'message' => 'Déjà inscrit à ce cours.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'inscription.']);
        }
    }
}
?>
