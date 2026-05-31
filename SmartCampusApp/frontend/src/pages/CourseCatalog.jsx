/**
 * SMARTCAMPUS FRONTEND - CourseCatalog.jsx
 * 
 * Description : Catalogue public ou semi-public affichant l'ensemble des cours proposés par l'université.
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Search, Users, Star, Filter } from 'lucide-react';

export default function CourseCatalog() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [filterNiveau, setFilterNiveau] = useState('Tous');

  const fetchCourses = () => {
    fetch(`/SmartCampusApp/backend/api/courses.php`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setCourses(data.cours);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/enroll.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_etudiant: user.id_etudiant, id_cours: courseId })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) fetchCourses();
    } catch(e) {
      alert("Erreur lors de l'inscription");
    }
  };

  const filteredCourses = courses.filter(c => {
    const titre = c.titre || '';
    const matchSearch = titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategory = filterCategory === 'Toutes' || c.categorie === filterCategory;
    const matchNiveau = filterNiveau === 'Tous' || c.niveau === filterNiveau;

    return matchSearch && matchCategory && matchNiveau;
  });

  // Extraire les catégories et niveaux uniques pour les filtres
  const categories = ['Toutes', ...new Set(courses.map(c => c.categorie).filter(Boolean))];
  const niveaux = ['Tous', ...new Set(courses.map(c => c.niveau).filter(Boolean))];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1>Catalogue des Cours</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                <input 
                  type="text" 
                  placeholder="Rechercher un cours..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '250px' }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Filter size={18} color="var(--text-muted)" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent' }}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent' }}>
                  {niveaux.map(niv => <option key={niv} value={niv}>Niveau: {niv}</option>)}
                </select>
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Aucun cours ne correspond à vos critères.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredCourses.map(course => (
                <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: 'var(--primary)', margin: 0 }}>{course.titre}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{course.niveau || 'Tous niveaux'}</span>
                        <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>{course.categorie || 'Non classé'}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {course.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={16} /> {course.credits_ects} ECTS
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: course.inscrits >= course.capacite_max ? 'red' : 'inherit' }}>
                        <Users size={16} /> {course.inscrits} / {course.capacite_max}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                      <strong>Enseignant :</strong> {course.prof_prenom} {course.prof_nom}
                    </div>
                  </div>
                  
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: course.inscrits >= course.capacite_max ? 0.7 : 1 }}
                    onClick={() => handleEnroll(course.id)}
                    disabled={course.inscrits >= course.capacite_max}
                  >
                    {course.inscrits >= course.capacite_max ? 'Complet' : "S'inscrire"}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
