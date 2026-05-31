<?php
include_once 'config/database.php';
try {
    $stmt = $conn->query("DESCRIBE cours");
    print_r($stmt->fetchAll());
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
