<?php
/**
 * SMARTCAMPUS API - courses_admin.php
 * 
 * Description : Fichier courses_admin.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - courses_admin.php
 * 
 * Description : Fichier courses_admin.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Lister tous les cours avec le nom du professeur assigné et le nombre d'inscrits
    $query = "SELECT c.id, c.titre, c.description, c.credits_ects, c.capacite_max, c.categorie, c.niveau,
                     u.nom as prof_nom, u.prenom as prof_prenom, e.id as id_enseignant,
                     (SELECT COUNT(*) FROM inscriptions i WHERE i.id_cours = c.id) as nb_inscrits
              FROM cours c
              LEFT JOIN enseignants e ON c.id_enseignant = e.id
              LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id
              ORDER BY c.titre ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $cours = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'cours' => $cours]);

} else if ($method === 'POST') {
    // Créer un nouveau cours
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->titre) || !isset($data->credits_ects) || !isset($data->capacite_max) || !isset($data->id_enseignant)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO cours (titre, description, credits_ects, capacite_max, id_enseignant, categorie, niveau) 
                                VALUES (:titre, :desc, :credits, :cap, :id_prof, :cat, :niv)");
        $stmt->execute([
            ':titre' => $data->titre,
            ':desc' => $data->description ?? '',
            ':credits' => $data->credits_ects,
            ':cap' => $data->capacite_max,
            ':id_prof' => $data->id_enseignant,
            ':cat' => $data->categorie ?? 'Non classé',
            ':niv' => $data->niveau ?? 'Tous niveaux'
        ]);

        echo json_encode(['success' => true, 'message' => 'Cours créé avec succès.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la création : ' . $e->getMessage()]);
    }

} else if ($method === 'PUT') {
    // Modifier un cours existant
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id) || !isset($data->titre) || !isset($data->credits_ects) || !isset($data->capacite_max) || !isset($data->id_enseignant)) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE cours SET titre = :titre, description = :desc, credits_ects = :credits, 
                                capacite_max = :cap, id_enseignant = :id_prof, categorie = :cat, niveau = :niv 
                                WHERE id = :id");
        $stmt->execute([
            ':titre' => $data->titre,
            ':desc' => $data->description ?? '',
            ':credits' => $data->credits_ects,
            ':cap' => $data->capacite_max,
            ':id_prof' => $data->id_enseignant,
            ':cat' => $data->categorie ?? 'Non classé',
            ':niv' => $data->niveau ?? 'Tous niveaux',
            ':id' => $data->id
        ]);
        echo json_encode(['success' => true, 'message' => 'Cours mis à jour avec succès.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage()]);
    }

} else if ($method === 'DELETE') {
    // Supprimer un cours
    if(!isset($_GET['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID manquant.']);
        exit;
    }

    try {
        $conn->beginTransaction();
        
        // Supprimer manuellement en cascade pour éviter les erreurs de contrainte
        $conn->prepare("DELETE FROM notes WHERE id_cours = :id")->execute([':id' => $_GET['id']]);
        $conn->prepare("DELETE FROM inscriptions WHERE id_cours = :id")->execute([':id' => $_GET['id']]);
        
        $stmt = $conn->prepare("DELETE FROM cours WHERE id = :id");
        $stmt->execute([':id' => $_GET['id']]);
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Cours supprimé. (Les inscriptions ont été annulées)']);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erreur de suppression.']);
    }
}
?>
