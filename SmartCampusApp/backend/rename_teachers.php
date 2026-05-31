<?php
include_once 'config/database.php';

$prenoms = ['Jean', 'Pierre', 'Michel', 'Marie', 'Nathalie', 'Sophie', 'Isabelle', 'Thomas', 'Nicolas', 'Julien', 'Laurent', 'Eric', 'Christophe', 'Philippe', 'Alice', 'Claire', 'Julie', 'Camille', 'Antoine', 'Lucas', 'Hugo', 'Gabriel', 'Louis', 'Arthur', 'Jules', 'Emma', 'Chloé', 'Léa', 'Manon', 'Mathilde'];
$noms = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefevre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre'];

try {
    $conn->beginTransaction();

    $stmt = $conn->query("SELECT id FROM utilisateurs WHERE role = 'Professeur' AND nom LIKE 'Intervenant%'");
    $profs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $noms_utilises = [];

    foreach ($profs as $p) {
        // Générer un nom complet unique
        do {
            $prenom = $prenoms[array_rand($prenoms)];
            $nom = $noms[array_rand($noms)];
            $full = $prenom . $nom;
        } while (in_array($full, $noms_utilises));
        
        $noms_utilises[] = $full;

        $email = strtolower(str_replace(' ', '', $prenom)) . '.' . strtolower(str_replace(' ', '', $nom)) . '@smartcampus.fr';

        $update = $conn->prepare("UPDATE utilisateurs SET nom = ?, prenom = ?, email = ? WHERE id = ?");
        $update->execute([$nom, $prenom, $email, $p['id']]);
    }

    $conn->commit();
    echo "Succès : " . count($profs) . " professeurs ont été renommés avec des noms réalistes !";

} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo "Erreur : " . $e->getMessage();
}
?>
