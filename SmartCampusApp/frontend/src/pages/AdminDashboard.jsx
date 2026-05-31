/**
 * SMARTCAMPUS FRONTEND - AdminDashboard.jsx
 * 
 * Description : Tableau de bord principal de l'administrateur, offrant une vue d'ensemble des statistiques (étudiants, professeurs, cours).
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Users, GraduationCap, Building, Bell, Calendar, UserPlus, BookPlus, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
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
        <div className="page-content page-transition">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Administration Scolarité</h1>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '50%', color: 'var(--primary)' }}>
                <GraduationCap size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Étudiants</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.total_etudiants : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
                <Users size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Professeurs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.total_professeurs : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
                <Building size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cours Actifs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.cours_actifs : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f3e8ff', borderRadius: '50%', color: '#9333ea' }}>
                <Calendar size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Séances Programmées</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.total_seances : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#ef4444' }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Absences Globales</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.total_absences : '...'}</div>
              </div>
            </div>
            
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem' }}>Actions Rapides</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
                  onClick={() => navigate('/admin/students')}
                >
                  <UserPlus size={20} />
                  Gérer les étudiants
                </button>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#1f2937' }}
                  onClick={() => navigate('/admin/courses')}
                >
                  <BookPlus size={20} />
                  Gérer les cours
                </button>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--text-muted)' }}
                  onClick={() => navigate('/schedule')}
                >
                  <Calendar size={20} />
                  Plannifier des cours
                </button>
              </div>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1.5rem' }}>Performances Académiques</h2>
              {!stats || !stats.academique ? (
                <div style={{ color: 'var(--text-muted)' }}>Analyse en cours...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* GPA Global */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--input-bg)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Moyenne de l'École</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {stats.academique.gpa_global ? `${parseFloat(stats.academique.gpa_global).toFixed(2).replace('.', ',')} / 20` : '-'}
                    </div>
                  </div>

                  {/* Taux de Réussite avec barre de progression */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Taux de Réussite (Notes ≥ 10)</span>
                      <span style={{ fontWeight: 'bold', color: stats.academique.taux_reussite >= 50 ? 'var(--primary)' : '#ef4444' }}>
                        {stats.academique.taux_reussite}%
                      </span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.academique.taux_reussite}%`, backgroundColor: stats.academique.taux_reussite >= 50 ? 'var(--primary)' : '#ef4444', height: '100%', borderRadius: '999px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>

                  {/* Tops et Flops */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#166534', fontWeight: 'bold', marginBottom: '0.25rem' }}>Top Matière</div>
                      <div style={{ fontWeight: 'bold', color: '#14532d' }}>{stats.academique.top_cours ? stats.academique.top_cours.titre : '-'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#16a34a' }}>{stats.academique.top_cours ? `${parseFloat(stats.academique.top_cours.moyenne).toFixed(2).replace('.', ',')} moy.` : ''}</div>
                    </div>
                    
                    <div style={{ padding: '1rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#991b1b', fontWeight: 'bold', marginBottom: '0.25rem' }}>Matière Difficile</div>
                      <div style={{ fontWeight: 'bold', color: '#7f1d1d' }}>{stats.academique.flop_cours ? stats.academique.flop_cours.titre : '-'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#dc2626' }}>{stats.academique.flop_cours ? `${parseFloat(stats.academique.flop_cours.moyenne).toFixed(2).replace('.', ',')} moy.` : ''}</div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>
                <AlertTriangle size={24} />
                <h2 style={{ margin: 0 }}>Détection Prédictive (À Risque)</h2>
              </div>
              
              {!stats ? (
                <div style={{ color: 'var(--text-muted)' }}>Analyse en cours...</div>
              ) : stats.etudiants_a_risque && stats.etudiants_a_risque.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.etudiants_a_risque.map(etu => (
                    <div 
                      key={etu.id} 
                      style={{ padding: '1rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => navigate(`/admin/students/${etu.id}`)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#991b1b' }}>{etu.nom.toUpperCase()} {etu.prenom}</div>
                          <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>Matricule: {etu.matricule}</div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          {etu.nb_absences > 0 && <span style={{ display: 'block', color: '#b91c1c', fontWeight: 'bold' }}>{etu.nb_absences} Absences</span>}
                          {etu.gpa !== null && etu.gpa < 10 && <span style={{ display: 'block', color: '#d97706', fontWeight: 'bold' }}>GPA: {parseFloat(etu.gpa).toFixed(2).replace('.', ',')}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#047857' }}>
                  <Building size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 'bold' }}>Aucun étudiant à risque détecté.</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Tous les indicateurs académiques sont au vert.</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
