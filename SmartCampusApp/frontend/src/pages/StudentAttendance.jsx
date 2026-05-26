import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { AlertTriangle, Calendar, Clock, XCircle, Camera } from 'lucide-react';

export default function StudentAttendance() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [historique, setHistorique] = useState([]);
  const [stats, setStats] = useState({ absences: 0, retards: 0 });

  useEffect(() => {
    fetch(`/SmartCampusApp/backend/api/attendance_student.php?id_etudiant=${user.id_etudiant}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setHistorique(data.historique);
          setStats(data.stats);
        }
      });
  }, [user.id_etudiant]);

  // Règle métier : Seuil d'alerte à 10 absences
  const hasAlert = stats.absences >= 10;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ margin: 0 }}>Suivi des Présences</h1>
            <a 
              href="/student/scan"
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', borderColor: '#10b981', textDecoration: 'none' }}
            >
              <Camera size={18} /> Scanner un QR Code
            </a>
          </div>

          {/* Alertes et compteurs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: hasAlert ? '4px solid #dc2626' : '4px solid #16a34a' }}>
              <div style={{ padding: '1rem', backgroundColor: hasAlert ? '#fee2e2' : '#dcfce7', borderRadius: '50%', color: hasAlert ? '#dc2626' : '#16a34a' }}>
                {hasAlert ? <AlertTriangle size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Absences</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: hasAlert ? '#dc2626' : 'inherit' }}>{stats.absences}</div>
                {hasAlert && <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>Seuil d'alerte dépassé !</div>}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ea580c' }}>
              <div style={{ padding: '1rem', backgroundColor: '#ffedd5', borderRadius: '50%', color: '#ea580c' }}>
                <Clock size={32} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Retards</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.retards}</div>
              </div>
            </div>

          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <h2 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} /> Historique détaillé
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Cours</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {historique.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun historique de présence trouvé.</td>
                  </tr>
                ) : (
                  historique.map((h, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>
                        {new Date(h.date_heure_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        <br />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(h.date_heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(h.date_heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{h.cours_titre}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{h.type}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {h.statut === 'Present' && <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Présent</span>}
                        {h.statut === 'Absent' && <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Absent</span>}
                        {h.statut === 'Retard' && <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Retard</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
