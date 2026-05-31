<?php
/**
 * SMARTCAMPUS API - advisor_ai.php
 * 
 * Description : Fichier advisor_ai.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
/**
 * SMARTCAMPUS API - advisor_ai.php
 * 
 * Description : Fichier advisor_ai.php : Fonctionnalité liée au système SmartCampus.
 * Rôle : Backend / Base de données
 */
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_utilisateur'])) {
        echo json_encode(['success' => false, 'message' => 'Paramètre manquant.']);
        exit;
    }

    $id_utilisateur = $_GET['id_utilisateur'];

    try {
        // 1. Récupérer l'ID de l'étudiant et ses infos
        $etuQuery = $conn->prepare("
            SELECT e.id, u.prenom, u.nom, e.annee_etude 
            FROM etudiants e 
            JOIN utilisateurs u ON e.id_utilisateur = u.id 
            WHERE u.id = :id_utilisateur
        ");
        $etuQuery->execute([':id_utilisateur' => $id_utilisateur]);
        $etudiant = $etuQuery->fetch();

        if (!$etudiant) {
            echo json_encode(['success' => false, 'message' => 'Étudiant introuvable.']);
            exit;
        }

        $id_etudiant = $etudiant['id'];
        $prenom = $etudiant['prenom'];

        // 2. Récupérer la moyenne globale
        $gpaQuery = $conn->prepare("SELECT AVG(valeur) as gpa FROM notes WHERE id_etudiant = :id");
        $gpaQuery->execute([':id' => $id_etudiant]);
        $gpa = $gpaQuery->fetchColumn();

        // 3. Récupérer les notes par matière
        $notesQuery = $conn->prepare("
            SELECT c.titre, n.valeur 
            FROM notes n 
            JOIN cours c ON n.id_cours = c.id 
            WHERE n.id_etudiant = :id
        ");
        $notesQuery->execute([':id' => $id_etudiant]);
        $notes = $notesQuery->fetchAll();

        // 4. Récupérer le nombre d'absences
        $absQuery = $conn->prepare("SELECT COUNT(*) as nb FROM presences WHERE id_etudiant = :id AND statut = 'Absent'");
        $absQuery->execute([':id' => $id_etudiant]);
        $absences = $absQuery->fetchColumn();

        // --- MOTEUR DE RÈGLES IA ---
        $conseils = [];

        // Analyse Globale
        if ($gpa === null) {
            $conseils[] = "Je n'ai pas encore assez de données sur tes notes pour faire une analyse précise de ton niveau global. Continue d'assister à tes cours !";
        } else if ($gpa >= 16) {
            $conseils[] = "Excellente dynamique ! Ta moyenne générale est de " . round($gpa, 2) . "/20. Tu maîtrises parfaitement ton cursus, je te suggère de continuer sur cette lancée ou de te porter volontaire pour aider tes camarades.";
        } else if ($gpa >= 12) {
            $conseils[] = "Tes résultats sont solides avec une moyenne de " . round($gpa, 2) . "/20. Tu es sur la bonne voie. Essaie de cibler tes points faibles pour viser l'excellence.";
        } else if ($gpa >= 10) {
            $conseils[] = "Attention, ta moyenne générale de " . round($gpa, 2) . "/20 est juste. Il va falloir redoubler d'efforts sur le prochain semestre pour consolider tes acquis.";
        } else {
            $conseils[] = "Alerte académique : Ta moyenne actuelle (" . round($gpa, 2) . "/20) est insuffisante pour valider ton année. Je te recommande fortement de prendre rendez-vous avec le service de scolarité pour organiser du soutien personnalisé.";
        }

        // Analyse des Matières
        $matieresFaibles = [];
        $matieresFortes = [];
        foreach ($notes as $n) {
            if ($n['valeur'] < 10) {
                $matieresFaibles[] = $n['titre'];
            } else if ($n['valeur'] >= 15) {
                $matieresFortes[] = $n['titre'];
            }
        }

        if (count($matieresFaibles) > 0) {
            $conseils[] = "J'ai détecté des lacunes préoccupantes dans les matières suivantes : " . implode(', ', array_unique($matieresFaibles)) . ". Il serait judicieux de revoir ces concepts en priorité.";
        }
        if (count($matieresFortes) > 0) {
            $conseils[] = "Félicitations pour tes excellentes performances en : " . implode(', ', array_unique($matieresFortes)) . ". C'est clairement ton point fort !";
        }

        // Analyse de l'Assiduité
        if ($absences == 0) {
            $conseils[] = "Ton assiduité est irréprochable (0 absence). C'est la clé de la réussite, bravo !";
        } else if ($absences <= 2) {
            $conseils[] = "Tu comptabilises $absences absence(s). Reste vigilant à ne pas dépasser le quota autorisé pour ne pas pénaliser tes notes de participation.";
        } else {
            $conseils[] = "⚠️ ALERTE : Tu as accumulé $absences absences. Ceci est un facteur de risque majeur pour la validation de ton année. Veille à justifier tes absences au plus vite auprès de l'administration.";
        }

        // Simulation de délai pour faire "IA"
        // sleep(2); // Retiré pour de meilleures perfs réseau, la simulation sera faite en JS.

        echo json_encode([
            'success' => true,
            'greetings' => "Bonjour $prenom, je suis ton Assistant Académique IA. J'ai analysé ton profil et voici mon compte-rendu :",
            'analysis' => $conseils
        ]);

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur BD : ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
?>
