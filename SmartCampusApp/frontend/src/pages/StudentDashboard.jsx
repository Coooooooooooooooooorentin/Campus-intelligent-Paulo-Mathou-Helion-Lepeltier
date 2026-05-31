/**
 * SMARTCAMPUS FRONTEND - StudentDashboard.jsx
 * 
 * Description : Tableau de bord de l'étudiant : récapitulatif des cours du jour, notifications et statut académique.
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { BookOpen, Award, Clock, BarChart2, Calendar, FileText, Bell, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    // Stats globales
    fetch(`/SmartCampusApp/backend/api/dashboard.php?id=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStats(data.stats);
      });

    // Notes détaillées pour graphiques
    fetch(`/SmartCampusApp/backend/api/student_grades_stats.php?id_etudiant=${user.id_etudiant}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setGrades(data.grades);
      });
  }, [user]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content page-transition">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Bonjour, {user?.prenom} 👋</h1>
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
                <BookOpen size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cours Inscrits</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.nb_cours : '...'}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
                <Award size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Moyenne Générale</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? (stats.gpa !== null ? stats.gpa : '-') : '...'} / 20</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Absences</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats ? stats.absences : '...'}</div>
              </div>
            </div>
            
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Prochaines Séances */}
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={24} color="var(--primary)" /> 
                Prochaines séances
              </h2>
              {stats && stats.prochaines_seances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Aucun cours de prévu prochainement.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats?.prochaines_seances.map((seance, index) => (
                    <div key={index} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ padding: '0.75rem', backgroundColor: 'var(--input-bg)', borderRadius: '8px', textAlign: 'center', minWidth: '70px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {new Date(seance.date_heure_debut).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {new Date(seance.date_heure_debut).getDate()}
                        </div>
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{seance.titre}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                          {new Date(seance.date_heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })} - {new Date(seance.date_heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          📍 Salle : <strong>{seance.salle}</strong> ({seance.type})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières notes */}
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} color="var(--primary)" /> 
                Notes récentes
              </h2>
              {stats && stats.dernieres_notes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Aucune note publiée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats?.dernieres_notes.map((note, index) => (
                    <div key={index} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{note.titre}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {note.type_evaluation} - Le {new Date(note.date_saisie).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: note.valeur >= 10 ? 'var(--primary)' : '#dc2626' }}>
                        {note.valeur} / 20
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={24} color="var(--primary)" /> 
              Mes Notes & Positionnement
            </h2>
            
            {grades.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Vous n'êtes inscrit à aucun cours pour le moment.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {grades.map(grade => {
                  if (grade.note === null) return (
                    <div key={grade.id_cours} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{grade.titre}</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aucune note attribuée pour l'instant.</p>
                    </div>
                  );

                  // Calcul des pourcentages pour le graphique (sur base 20)
                  const myPercentage = (grade.note / 20) * 100;
                  const avgPercentage = grade.moyenne_classe ? (grade.moyenne_classe / 20) * 100 : 0;
                  const isAboveAvg = grade.note >= grade.moyenne_classe;

                  return (
                    <div key={grade.id_cours} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--hover-bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{grade.titre}</strong>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isAboveAvg ? 'var(--primary)' : '#f59e0b' }}>
                          {grade.note} / 20
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Barre de l'étudiant */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                            <span>Ma note</span>
                            <span>{grade.note}/20</span>
                          </div>
                          <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${myPercentage}%`, height: '100%', backgroundColor: isAboveAvg ? 'var(--primary)' : '#f59e0b', transition: 'width 1s ease-in-out', borderRadius: '6px' }}></div>
                          </div>
                        </div>

                        {/* Barre Moyenne de la classe */}
                        {grade.moyenne_classe !== null && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                              <span>Moyenne de la classe</span>
                              <span>{grade.moyenne_classe}/20</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${avgPercentage}%`, height: '100%', backgroundColor: 'var(--text-muted)', transition: 'width 1s ease-in-out', borderRadius: '4px' }}></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats extrêmes */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Note Min: <strong>{grade.note_min !== null ? grade.note_min : '-'}</strong></span>
                        <span>Note Max: <strong>{grade.note_max !== null ? grade.note_max : '-'}</strong></span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
