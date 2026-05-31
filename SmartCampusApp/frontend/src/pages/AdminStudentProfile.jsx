/**
 * SMARTCAMPUS FRONTEND - AdminStudentProfile.jsx
 * 
 * Description : Affiche le profil détaillé d'un étudiant côté administration (informations personnelles, cursus, notes).
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { ArrowLeft, Save, BookOpen, GraduationCap } from 'lucide-react';

export default function AdminStudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchStudent = () => {
    fetch(`/SmartCampusApp/backend/api/students.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setStudent(data.etudiant);
          setFormData(data.etudiant);
        }
      });
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/students.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
      if(data.success) {
        setEditMode(false);
        fetchStudent();
      }
    } catch(err) {
      alert("Erreur de sauvegarde");
    }
  };

  if (!student) return <div>Chargement...</div>;

  const totalCredits = student.cours?.reduce((acc, c) => acc + (c.note >= 10 ? c.credits_ects : 0), 0) || 0;
  const moyenne = student.cours?.length > 0 
    ? (student.cours.reduce((acc, c) => acc + (parseFloat(c.note) || 0), 0) / student.cours.filter(c => c.note !== null).length).toFixed(2)
    : 'N/A';

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/admin/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={20} /> Retour à la liste
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            
            {/* Colonne Gauche : Infos */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap /> Profil</h2>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setEditMode(!editMode)}>
                  {editMode ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Nom</label>
                    <input value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Prénom</label>
                    <input value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Email</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Matricule</label>
                    <input value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Année</label>
                    <input value={formData.annee_etude} onChange={e => setFormData({...formData, annee_etude: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}><Save size={18}/> Enregistrer</button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div><strong>Nom complet :</strong> {student.nom} {student.prenom}</div>
                  <div><strong>Email :</strong> {student.email}</div>
                  <div><strong>Matricule :</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{student.matricule}</span></div>
                  <div><strong>Année :</strong> {student.annee_etude}</div>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Moyenne :</strong> <br/><span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{moyenne}</span></div>
                    <div><strong>Crédits :</strong> <br/><span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totalCredits} ECTS</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne Droite : Cours & Notes */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen /> Parcours & Inscriptions</h2>
                {/* L'ajout à un cours pourrait ouvrir une modale ici, pour simplifier on garde l'affichage */}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Cours</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>ECTS</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Note</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {student.cours?.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun cours inscrit.</td></tr>
                  ) : (
                    student.cours?.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>{c.titre}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>{c.credits_ects}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{c.note !== null ? c.note : '-'}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {c.note !== null ? (c.note >= 10 ? <span style={{ color: 'var(--primary)' }}>Validé</span> : <span style={{ color: 'red' }}>Ajourné</span>) : 'En cours'}
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
    </div>
  );
}
