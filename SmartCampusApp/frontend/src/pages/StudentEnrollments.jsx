import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { BookOpen, Search, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentEnrollments() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyCourses = () => {
    fetch(`/SmartCampusApp/backend/api/enroll.php?id_etudiant=${user.id_etudiant}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setCourses(data.cours);
      });
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleUnenroll = async (course) => {
    if (course.notes_verrouillees == 1) {
      alert("Ce cours est verrouillé. Vous ne pouvez plus vous désinscrire.");
      return;
    }
    
    if(!window.confirm(`Êtes-vous sûr de vouloir vous désinscrire du cours "${course.titre}" ?`)) return;

    try {
      const res = await fetch(`/SmartCampusApp/backend/api/enroll.php?id_etudiant=${user.id_etudiant}&id_cours=${course.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) fetchMyCourses();
    } catch(e) {
      alert("Erreur réseau ou CORS.");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.prof_nom && c.prof_nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1>Mes Cours Inscrits</h1>
            <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
              <input 
                type="text" 
                placeholder="Rechercher un de mes cours..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '250px' }}
              />
            </div>
          </div>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Vous n'êtes inscrit à aucun cours</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Découvrez les matières disponibles et inscrivez-vous dès maintenant.</p>
              <Link to="/student/courses" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Parcourir le catalogue
              </Link>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Titre du cours</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Professeur</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Crédits ECTS</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Statut</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>
                        {c.titre}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.categorie} • {c.niveau}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>Dr. {c.prof_nom} {c.prof_prenom}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{c.credits_ects}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {c.notes_verrouillees == 1 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <AlertTriangle size={12} /> Notes clôturées
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            En cours
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnenroll(c)} 
                          style={{ 
                            background: 'none', border: 'none', cursor: c.notes_verrouillees == 1 ? 'not-allowed' : 'pointer', 
                            color: c.notes_verrouillees == 1 ? '#9ca3af' : '#ef4444',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500
                          }}
                          disabled={c.notes_verrouillees == 1}
                          title={c.notes_verrouillees == 1 ? "Désinscription impossible" : "Se désinscrire"}
                        >
                          <XCircle size={18} /> Se désinscrire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
