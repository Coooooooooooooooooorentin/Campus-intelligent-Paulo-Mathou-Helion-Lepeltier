/**
 * SMARTCAMPUS FRONTEND - TeacherAttendance.jsx
 * 
 * Description : Interface professeur pour faire l'appel et noter la présence des étudiants inscrits à ses cours.
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { CheckCircle, XCircle, Clock, Search, ChevronRight, QrCode, X } from 'lucide-react';

export default function TeacherAttendance() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [seances, setSeances] = useState([]);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // QR Code Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/SmartCampusApp/backend/api/attendance_teacher.php?id_prof=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setSeances(data.seances);
      });
  }, [user.id]);

  const handleSelectSeance = (seance) => {
    setSelectedSeance(seance);
    fetch(`/SmartCampusApp/backend/api/attendance_teacher.php?id_seance=${seance.id_seance}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStudents(data.etudiants);
      });
  };

  const handleUpdateStatus = async (id_etudiant, statut) => {
    setStudents(students.map(s => s.id_etudiant === id_etudiant ? { ...s, statut } : s));
    try {
      await fetch(`/SmartCampusApp/backend/api/attendance_teacher.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_seance: selectedSeance.id_seance, id_etudiant, statut })
      });
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <h1 style={{ marginBottom: '2rem' }}>Faire l'appel</h1>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            
            <div className="card" style={{ flex: 1, padding: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Sélectionner une séance</h2>
              {seances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Aucune séance programmée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {seances.map(s => (
                    <div 
                      key={s.id_seance} 
                      onClick={() => handleSelectSeance(s)}
                      style={{ 
                        padding: '1rem', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        backgroundColor: selectedSeance?.id_seance === s.id_seance ? '#e0e7ff' : 'white',
                        borderColor: selectedSeance?.id_seance === s.id_seance ? 'var(--primary)' : 'var(--border-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: 'var(--primary)' }}>{s.cours_titre}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(s.date_heure_debut).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })} 
                          {' - '} Salle {s.salle}
                        </div>
                      </div>
                      <ChevronRight size={20} color={selectedSeance?.id_seance === s.id_seance ? 'var(--primary)' : 'var(--text-muted)'} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ flex: 2, minHeight: '50vh' }}>
              {!selectedSeance ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  Sélectionnez une séance à gauche pour commencer l'appel.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem' }}>Appel : {selectedSeance.cours_titre}</h2>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Salle {selectedSeance.salle}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        className="btn-primary" 
                        onClick={() => setIsQrModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        <QrCode size={18} /> Générer QR Code
                      </button>

                      <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                        <input 
                          type="text" 
                          placeholder="Rechercher étudiant..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          style={{ paddingLeft: '2rem', width: '200px', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Étudiant</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Statut actuel</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun étudiant inscrit.</td></tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.id_etudiant} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem' }}>
                              <strong style={{ display: 'block' }}>{student.nom} {student.prenom}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.matricule}</span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              {student.statut === 'Present' && <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Présent</span>}
                              {student.statut === 'Absent' && <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Absent</span>}
                              {student.statut === 'Retard' && <span style={{ color: '#ea580c', fontWeight: 'bold' }}>Retard</span>}
                              {student.statut === 'Non renseigné' && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleUpdateStatus(student.id_etudiant, 'Present')}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #bbf7d0', backgroundColor: student.statut === 'Present' ? '#bbf7d0' : 'white', color: '#16a34a', cursor: 'pointer' }}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(student.id_etudiant, 'Retard')}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fed7aa', backgroundColor: student.statut === 'Retard' ? '#fed7aa' : 'white', color: '#ea580c', cursor: 'pointer' }}
                              >
                                <Clock size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(student.id_etudiant, 'Absent')}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: student.statut === 'Absent' ? '#fecaca' : 'white', color: '#dc2626', cursor: 'pointer' }}
                              >
                                <XCircle size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* MODAL QR CODE */}
      {isQrModalOpen && selectedSeance && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => {
                setIsQrModalOpen(false);
                // Rafraîchir la liste quand on ferme le QR code (au cas où des élèves se sont scannés)
                handleSelectSeance(selectedSeance);
              }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Scanner pour valider</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{selectedSeance.cours_titre}</p>
            
            {/* Génération dynamique via l'API publique goqr.me */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://${window.location.hostname}:5173/student/scan?seance=${selectedSeance.id_seance}`} 
                alt="QR Code"
                style={{ border: '4px solid white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Les étudiants doivent scanner ce code avec l'appareil photo de leur téléphone pour valider leur présence.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
