<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id_cours)) {
        echo json_encode(['success' => false, 'message' => 'ID du cours manquant.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE cours SET notes_verrouillees = 1 WHERE id = :id_cours");
        $stmt->execute([':id_cours' => $data->id_cours]);
        
        echo json_encode(['success' => true, 'message' => 'Les notes de ce cours ont été verrouillées définitivement.']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD: ' . $e->getMessage()]);
    }
}
?>
