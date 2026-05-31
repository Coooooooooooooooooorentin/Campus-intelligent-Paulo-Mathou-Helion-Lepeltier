<?php
/**
 * SMARTCAMPUS API - auth.php
 * 
 * Description : API gérant l'authentification, la création de session et la vérification des identifiants.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - auth.php
 * 
 * Description : API gérant l'authentification, la création de session et la vérification des identifiants.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->email) || !isset($data->password)) {
        echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis.']);
        exit;
    }

    $email = $data->email;
    $password = $data->password;

    $query = "SELECT id, email, mot_de_passe, nom, prenom, role FROM utilisateurs WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        if (password_verify($password, $row['mot_de_passe'])) {
            
            // Si c'est un étudiant, on récupère ses infos
            $extraData = [];
            if ($row['role'] === 'Etudiant') {
                $q = "SELECT id as id_etudiant, matricule FROM etudiants WHERE id_utilisateur = :id";
                $s = $conn->prepare($q);
                $s->execute([':id' => $row['id']]);
                if($r = $s->fetch()) {
                    $extraData = $r;
                }
            } else if ($row['role'] === 'Professeur') {
                $q = "SELECT id as id_enseignant FROM enseignants WHERE id_utilisateur = :id";
                $s = $conn->prepare($q);
                $s->execute([':id' => $row['id']]);
                if($r = $s->fetch()) {
                    $extraData = $r;
                }
            }

            echo json_encode([
                'success' => true,
                'user' => array_merge([
                    'id' => $row['id'],
                    'email' => $row['email'],
                    'nom' => $row['nom'],
                    'prenom' => $row['prenom'],
                    'role' => $row['role']
                ], $extraData)
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Mot de passe incorrect.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
?>
