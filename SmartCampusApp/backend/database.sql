-- Script d'initialisation pour MAMP (SmartCampus DB) - V2 avec Emploi du temps

CREATE DATABASE IF NOT EXISTS smartcampus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartcampus_db;

-- 1. Table Utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('Etudiant', 'Professeur', 'Admin') NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table Etudiants
CREATE TABLE IF NOT EXISTS etudiants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    annee_etude VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- 3. Table Enseignants
CREATE TABLE IF NOT EXISTS enseignants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    departement VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- 4. Table Cours
CREATE TABLE IF NOT EXISTS cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    credits_ects INT NOT NULL,
    capacite_max INT NOT NULL,
    id_enseignant INT NOT NULL,
    categorie VARCHAR(100) DEFAULT 'Non classé',
    niveau VARCHAR(50) DEFAULT 'Tous niveaux',
    notes_verrouillees TINYINT(1) DEFAULT 0,
    FOREIGN KEY (id_enseignant) REFERENCES enseignants(id) ON DELETE CASCADE
);

-- 5. Table Inscriptions
CREATE TABLE IF NOT EXISTS inscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_cours INT NOT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('Actif', 'Annulé') DEFAULT 'Actif',
    FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE,
    UNIQUE KEY (id_etudiant, id_cours)
);

-- 6. Table Notes
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_cours INT NOT NULL,
    valeur DECIMAL(4,2) NOT NULL,
    type_evaluation VARCHAR(50) NOT NULL,
    commentaire TEXT,
    date_saisie DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE
);

-- 7. Table Seances (NOUVEAU)
CREATE TABLE IF NOT EXISTS seances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cours INT NOT NULL,
    date_heure_debut DATETIME NOT NULL,
    date_heure_fin DATETIME NOT NULL,
    salle VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE
);

-- 8. Table Presences (NOUVEAU)
CREATE TABLE IF NOT EXISTS presences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_seance INT NOT NULL,
    statut ENUM('Present', 'Absent', 'Retard') DEFAULT 'Present',
    FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
    FOREIGN KEY (id_seance) REFERENCES seances(id) ON DELETE CASCADE
);

-- 9. Insertions de données factices (Mock Data)
-- Mots de passe = 'password'
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role) VALUES 
('corentin.l@edu.ece.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'L.', 'Corentin', 'Etudiant'),
('prof.dubois@edu.ece.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dubois', 'Jean', 'Professeur'),
('admin.scolarite@edu.ece.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Scolarité', 'Admin', 'Admin');

INSERT INTO etudiants (id_utilisateur, matricule, annee_etude) VALUES 
(1, 'ECE21000', 'M1');

INSERT INTO enseignants (id_utilisateur, departement) VALUES 
(2, 'Informatique');

INSERT INTO cours (titre, description, credits_ects, capacite_max, id_enseignant) VALUES 
('Intelligence Artificielle', 'Introduction au Machine Learning', 6, 30, 1),
('Programmation Web Avancée', 'React, PHP, bases de données', 5, 25, 1);

INSERT INTO inscriptions (id_etudiant, id_cours) VALUES 
(1, 1),
(1, 2);

INSERT INTO notes (id_etudiant, id_cours, valeur, type_evaluation, commentaire) VALUES 
(1, 1, 16.5, 'Examen Final', 'Très bon travail'),
(1, 2, 18.0, 'Projet', 'Excellent projet');

-- Insertions des Séances (MOCK DATA) pour la semaine courante
-- Supposons que nous sommes fin mai 2026. On va créer des dates génériques (ex: demain et après-demain)
INSERT INTO seances (id_cours, date_heure_debut, date_heure_fin, salle, type) VALUES 
(1, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 12 HOUR, 'Salle C102', 'CM'),
(2, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 16 HOUR, 'Labo B01', 'TP'),
(1, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 8 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 10 HOUR, 'Salle C105', 'TD');

-- Insertions Présences
INSERT INTO presences (id_etudiant, id_seance, statut) VALUES 
(1, 1, 'Present');
