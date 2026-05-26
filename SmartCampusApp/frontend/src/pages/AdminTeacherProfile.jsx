import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { ArrowLeft, Save, BookOpen, Briefcase } from 'lucide-react';

export default function AdminTeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchTeacher = () => {
    fetch(`/SmartCampusApp/backend/api/teachers.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setTeacher(data.enseignant);
          setFormData(data.enseignant);
        }
      });
  };

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/teachers.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
      if(data.success) {
        setEditMode(false);
        fetchTeacher();
      }
    } catch(err) {
      alert("Erreur de sauvegarde");
    }
  };

  if (!teacher) return <div>Chargement...</div>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/admin/teachers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={20} /> Retour à la liste
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            
            {/* Colonne Gauche : Infos */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase /> Profil</h2>
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
                    <label>Email professionnel</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Département / Spécialité</label>
                    <input value={formData.departement} onChange={e => setFormData({...formData, departement: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}><Save size={18}/> Enregistrer</button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e5e7eb', margin: '0 auto 1rem', overflow: 'hidden' }}>
                      <img src={`https://ui-avatars.com/api/?name=${teacher.prenom}+${teacher.nom}&background=0FAD5D&color=fff&size=80`} alt="Avatar" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Dr. {teacher.nom} {teacher.prenom}</div>
                  </div>
                  
                  <div><strong>Email :</strong> {teacher.email}</div>
                  <div><strong>Département :</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{teacher.departement}</span></div>
                </div>
              )}
            </div>

            {/* Colonne Droite : Cours Enseignés */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen /> Responsabilités Pédagogiques</h2>
                {/* L'assignation d'un prof à un cours se fera via la page Gestion des Cours (Grand 5) */}
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#1f2937' }}>
                  Gérer l'affectation
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Titre du Cours</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Capacité</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Crédits ECTS</th>
                  </tr>
                </thead>
                <tbody>
                  {teacher.cours?.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun cours assigné.</td></tr>
                  ) : (
                    teacher.cours?.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>{c.titre}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>Max {c.capacite_max}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)' }}>{c.credits_ects}</td>
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
