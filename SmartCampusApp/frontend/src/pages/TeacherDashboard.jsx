/**
 * SMARTCAMPUS FRONTEND - TeacherDashboard.jsx
 * 
 * Description : Tableau de bord du professeur : résumé de ses classes, cours à venir et actions rapides.
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { BookOpen, Users, AlertCircle, Bell, Calendar, Edit3, ClipboardList } from 'lucide-react';

export default function TeacherDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/SmartCampusApp/backend/api/dashboard.php?id=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStats(data.stats);
      });
  }, [user]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Espace Enseignant - Dr. {user?.nom}</h1>
            {stats && stats.messages_non_lus > 0 && (
              <div 
                onClick={() => navigate('/messages')} 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: 'bold' }}
              >
                <Bell size={20} />
                {stats.messages_non_lus} message(s) non lu(s)
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '50%', color: 'var(--primary)' }}>
                <BookOpen size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cours Enseignés</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.cours_enseignes : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
                <Users size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Étudiants Inscrits</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.total_etudiants : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
                <AlertCircle size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Prochaines Séances</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.prochaines_seances.length : '...'}</div>
              </div>
            </div>
            
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={24} color="var(--primary)" /> 
                Mes prochaines séances (Appel)
              </h2>
              {stats && stats.prochaines_seances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Aucun cours de prévu prochainement.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats?.prochaines_seances.map((seance, index) => (
                    <div key={index} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center', minWidth: '70px' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {new Date(seance.date_heure_debut).toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {new Date(seance.date_heure_debut).getDate()}
                          </div>
                        </div>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: '#111827' }}>{seance.titre}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {new Date(seance.date_heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })} - {new Date(seance.date_heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            📍 Salle : <strong>{seance.salle}</strong>
                          </div>
                        </div>
                      </div>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/teacher/attendance')}>
                        Faire l'appel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={24} color="var(--primary)" /> 
                Accès rapides
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Edit3 size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 'bold' }}>Saisie des notes</span>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/teacher/grades')}>Accéder</button>
                </div>
                <div style={{ padding: '1rem', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} color="#f59e0b" />
                    <span style={{ fontWeight: 'bold' }}>Catalogue des cours</span>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/catalogue')}>Accéder</button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
