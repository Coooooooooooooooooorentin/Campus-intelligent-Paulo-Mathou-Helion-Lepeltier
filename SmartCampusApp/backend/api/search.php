<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
        echo json_encode(['success' => true, 'results' => []]);
        exit;
    }

    $q = "%" . trim($_GET['q']) . "%";
    $results = [];

    try {
        // Recherche Utilisateurs (Étudiants / Profs)
        $userQuery = $conn->prepare("SELECT id, nom, prenom, role FROM utilisateurs WHERE nom LIKE :q OR prenom LIKE :q LIMIT 5");
        $userQuery->execute([':q' => $q]);
        $users = $userQuery->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as $u) {
            $results[] = [
                'type' => $u['role'],
                'titre' => strtoupper($u['nom']) . ' ' . $u['prenom'],
                'id' => $u['id'],
                'url' => $u['role'] === 'Etudiant' ? "/admin/students/{$u['id']}" : "#" // Ajustable
            ];
        }

        // Recherche Cours
        $coursQuery = $conn->prepare("SELECT id, titre FROM cours WHERE titre LIKE :q LIMIT 3");
        $coursQuery->execute([':q' => $q]);
        $cours = $coursQuery->fetchAll(PDO::FETCH_ASSOC);

        foreach ($cours as $c) {
            $results[] = [
                'type' => 'Cours',
                'titre' => $c['titre'],
                'id' => $c['id'],
                'url' => '/student/catalog'
            ];
        }

        echo json_encode(['success' => true, 'results' => $results]);

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD.']);
    }
}
?>
