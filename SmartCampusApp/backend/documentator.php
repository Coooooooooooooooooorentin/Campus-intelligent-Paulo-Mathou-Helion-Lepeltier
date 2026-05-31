<?php
/**
 * Script automatique de documentation et nettoyage pour SmartCampus
 */

$docs = [
    // --- FRONTEND ---
    'AcademicAdvisor.jsx' => 'Gère l\'interface du conseiller académique, permettant d\'assigner des professeurs aux cours et de gérer la planification globale.',
    'AdminCourses.jsx' => 'Composant administrateur : permet de lister, créer, modifier et supprimer les cours disponibles dans l\'établissement.',
    'AdminDashboard.jsx' => 'Tableau de bord principal de l\'administrateur, offrant une vue d\'ensemble des statistiques (étudiants, professeurs, cours).',
    'AdminStudentProfile.jsx' => 'Affiche le profil détaillé d\'un étudiant côté administration (informations personnelles, cursus, notes).',
    'AdminStudents.jsx' => 'Interface administrateur pour gérer la liste des étudiants (ajout, modification, suppression).',
    'AdminTeacherProfile.jsx' => 'Affiche le profil détaillé d\'un enseignant, ses départements et ses cours affectés.',
    'AdminTeachers.jsx' => 'Interface administrateur pour la gestion du corps professoral.',
    'CourseCatalog.jsx' => 'Catalogue public ou semi-public affichant l\'ensemble des cours proposés par l\'université.',
    'Login.jsx' => 'Page d\'authentification centralisée pour tous les rôles (Étudiant, Professeur, Admin).',
    'Messages.jsx' => 'Système de messagerie interne permettant la communication entre les différents utilisateurs.',
    'Schedule.jsx' => 'Composant principal du calendrier (Emploi du temps), gérant l\'affichage dynamique des séances récurrentes selon le rôle de l\'utilisateur.',
    'StudentAttendance.jsx' => 'Interface permettant à l\'étudiant de consulter ses absences et présences aux cours.',
    'StudentDashboard.jsx' => 'Tableau de bord de l\'étudiant : récapitulatif des cours du jour, notifications et statut académique.',
    'StudentEnrollments.jsx' => 'Gestion des inscriptions aux cours pour un étudiant, affichage de ses matières actuelles.',
    'StudentScan.jsx' => 'Interface mobile-friendly pour scanner un QR Code ou valider sa présence en classe.',
    'TeacherAttendance.jsx' => 'Interface professeur pour faire l\'appel et noter la présence des étudiants inscrits à ses cours.',
    'TeacherDashboard.jsx' => 'Tableau de bord du professeur : résumé de ses classes, cours à venir et actions rapides.',
    'TeacherGrades.jsx' => 'Interface permettant au professeur de saisir, modifier et valider les notes de ses étudiants.',
    'Transcript.jsx' => 'Relevé de notes officiel de l\'étudiant, générant le bulletin académique complet.',

    // --- BACKEND ---
    'auth.php' => 'API gérant l\'authentification, la création de session et la vérification des identifiants.',
    'schedule.php' => 'API responsable de la récupération, création et gestion des séances d\'emploi du temps.',
    'enroll.php' => 'API gérant les inscriptions des étudiants aux différents cours.',
    'admin_courses.php' => 'API administrateur : CRUD complet sur la table des cours.',
    'admin_users.php' => 'API administrateur : gestion des utilisateurs (création, modification, suppression).',
    'admin_enrollments.php' => 'API permettant aux administrateurs de forcer ou modifier des inscriptions.',
    'attendance.php' => 'API gérant la soumission et la lecture des présences/absences (l\'appel).',
    'grades.php' => 'API de gestion des notes : lecture pour les étudiants, écriture pour les professeurs.',
    'transcript.php' => 'API générant les données du relevé de notes d\'un étudiant.',
    'messages.php' => 'API gérant la communication et les messages internes de la plateforme.',
    'teacher_courses.php' => 'API listant spécifiquement les cours assignés à un professeur donné.'
];

function processFile($filePath, $docMap) {
    if (!file_exists($filePath)) return;
    
    $filename = basename($filePath);
    $content = file_get_contents($filePath);
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    
    // Si l'en-tête existe déjà, on ne l'ajoute pas deux fois
    if (strpos($content, '/**') === 0 || strpos($content, '/*') === 0) {
        // Déjà documenté, on passe
        // Mais on applique quand même le nettoyage
    } else {
        $description = isset($docMap[$filename]) ? $docMap[$filename] : "Fichier $filename : Fonctionnalité liée au système SmartCampus.";
        
        if ($ext === 'php') {
            $header = "<?php\n/**\n * SMARTCAMPUS API - $filename\n * \n * Description : $description\n * Rôle : Backend / Base de données\n */\n";
            // Remplacer le premier <?php
            $content = preg_replace('/<\?php\s*/', $header, $content, 1);
        } else if ($ext === 'jsx' || $ext === 'js') {
            $header = "/**\n * SMARTCAMPUS FRONTEND - $filename\n * \n * Description : $description\n * Rôle : Interface Utilisateur (React)\n */\n\n";
            $content = $header . $content;
        }
    }
    
    // --- NETTOYAGE DES COMMENTAIRES INUTILES ---
    // Supprimer les console.log commentés : // console.log(...)
    $content = preg_replace('/^\s*\/\/\s*console\.log.*$/m', '', $content);
    // Supprimer les commentaires vides
    $content = preg_replace('/^\s*\/\/\s*$/m', '', $content);
    // Supprimer les TODO génériques laissés en plan
    $content = preg_replace('/^\s*\/\/\s*TODO:.*$/mi', '', $content);
    
    file_put_contents($filePath, $content);
    echo "Documenté et nettoyé : $filename\n";
}

$frontendPath = '/Users/corentinlepeltier/Desktop/Projet smart campus/SmartCampusApp/frontend/src/pages/';
$backendPath = '/Users/corentinlepeltier/Desktop/Projet smart campus/SmartCampusApp/backend/api/';

// Traiter le frontend
if (is_dir($frontendPath)) {
    $files = scandir($frontendPath);
    foreach ($files as $file) {
        if (str_ends_with($file, '.jsx') || str_ends_with($file, '.js')) {
            processFile($frontendPath . $file, $docs);
        }
    }
}

// Traiter le backend
if (is_dir($backendPath)) {
    $files = scandir($backendPath);
    foreach ($files as $file) {
        if (str_ends_with($file, '.php')) {
            processFile($backendPath . $file, $docs);
        }
    }
}

echo "\n=> Opération terminée avec succès !";
?>
