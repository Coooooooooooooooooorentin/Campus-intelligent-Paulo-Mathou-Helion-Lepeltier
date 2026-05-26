<?php
// Configuration pour MAMP (par défaut)
$host = '127.0.0.1';
$port = '8889'; // MAMP utilise souvent 8889 pour MySQL
$db_name = 'smartcampus_db';
$username = 'root';
$password = 'root';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $conn = new PDO("mysql:host={$host};port={$port};dbname={$db_name};charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $exception) {
    echo json_encode(['error' => 'Erreur de connexion à la base de données : ' . $exception->getMessage()]);
    exit();
}
?>
