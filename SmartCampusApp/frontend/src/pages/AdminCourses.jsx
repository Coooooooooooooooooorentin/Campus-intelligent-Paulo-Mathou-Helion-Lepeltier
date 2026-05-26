import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Search, PlusCircle, X, Trash2, Edit, Users, UserPlus, UserMinus } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Création/Edition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const defaultCourse = { titre: '', description: '', credits_ects: 3, capacite_max: 30, id_enseignant: '', categorie: 'Non classé', niveau: 'Tous niveaux' };
  const [newCourse, setNewCourse] = useState(defaultCourse);

  // Modal Inscriptions
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentToEnroll, setStudentToEnroll] = useState('');

  const fetchData = () => {
    fetch(`/SmartCampusApp/backend/api/courses_admin.php`)
      .then(res => res.json())
      .then(data => { if(data.success) setCourses(data.cours); });
    
    fetch(`/SmartCampusApp/backend/api/teachers.php`)
      .then(res => res.json())
      .then(data => { if(data.success) setTeachers(data.enseignants); });

    fetch(`/SmartCampusApp/backend/api/students.php`)
      .then(res => res.json())
      .then(data => { if(data.success) setAllStudents(data.etudiants); });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setNewCourse(defaultCourse);
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditMode(true);
    setNewCourse({
      id: course.id,
      titre: course.titre,
      description: course.description || '',
      credits_ects: course.credits_ects,
      capacite_max: course.capacite_max,
      id_enseignant: course.id_enseignant,
      categorie: course.categorie || 'Non classé',
      niveau: course.niveau || 'Tous niveaux'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCourse.id_enseignant) {
      alert("Veuillez sélectionner un professeur responsable.");
      return;
    }

    const method = editMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(`/SmartCampusApp/backend/api/courses_admin.php`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if(data.success) {
        alert(data.message);
        setIsModalOpen(false);
        setNewCourse(defaultCourse);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch(err) {
      alert("Erreur réseau.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) return;
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/courses_admin.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      if(data.success) fetchData();
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  // --- LOGIQUE INSCRIPTIONS ---
  const openEnrollModal = (course) => {
    setSelectedCourse(course);
    fetchEnrolledStudents(course.id);
    setIsEnrollModalOpen(true);
  };

  const fetchEnrolledStudents = (courseId) => {
    fetch(`/SmartCampusApp/backend/api/admin_enrollments.php?id_cours=${courseId}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setEnrolledStudents(data.etudiants);
      });
  };

  const handleManualEnroll = async () => {
    if(!studentToEnroll) return;
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/admin_enrollments.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_etudiant: studentToEnroll, id_cours: selectedCourse.id })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        fetchEnrolledStudents(selectedCourse.id);
        fetchData(); // MAJ du compteur global
      }
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  const handleManualUnenroll = async (id_etudiant) => {
    if(!window.confirm("Retirer cet étudiant de ce cours ?")) return;
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/admin_enrollments.php?id_cours=${selectedCourse.id}&id_etudiant=${id_etudiant}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        fetchEnrolledStudents(selectedCourse.id);
        fetchData(); // MAJ du compteur global
      }
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.prof_nom && c.prof_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.categorie && c.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Gestion des Cours</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                <input 
                  type="text" 
                  placeholder="Rechercher (Titre, Prof, Catégorie)..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '300px' }}
                />
              </div>
              <button className="btn-primary" onClick={openCreateModal}>
                <PlusCircle size={20} /> Créer un cours
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Titre du cours</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Organisation</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Professeur Responsable</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Inscrits / Capacité</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{c.titre}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', marginRight: '5px' }}>{c.niveau}</span>
                      <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{c.categorie}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{c.prof_nom ? `Dr. ${c.prof_nom} ${c.prof_prenom}` : <span style={{ color: 'red' }}>Non assigné</span>}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: c.nb_inscrits >= c.capacite_max ? 'red' : 'inherit' }}>{c.nb_inscrits}</span> / {c.capacite_max}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                      <button onClick={() => openEnrollModal(c)} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#4f46e5' }} title="Gérer les inscrits">
                        <Users size={16} />
                      </button>
                      <button onClick={() => openEditModal(c)} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#4b5563' }} title="Modifier">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444' }} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal Inscriptions */}
      {isEnrollModalOpen && selectedCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Étudiants inscrits - {selectedCourse.titre}</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsEnrollModalOpen(false)} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <select 
                value={studentToEnroll} 
                onChange={e => setStudentToEnroll(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <option value="">-- Sélectionner un étudiant à ajouter --</option>
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.nom} {s.prenom} ({s.matricule})</option>
                ))}
              </select>
              <button className="btn-primary" onClick={handleManualEnroll}>
                <UserPlus size={18} /> Ajouter
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Matricule</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nom</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>Aucun étudiant inscrit.</td></tr>
                  ) : (
                    enrolledStudents.map(s => (
                      <tr key={s.id_etudiant} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>{s.matricule}</td>
                        <td style={{ padding: '0.75rem' }}>{s.nom} {s.prenom}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button onClick={() => handleManualUnenroll(s.id_etudiant)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                            <UserMinus size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Edition (Identique à avant) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editMode ? 'Modifier le cours' : 'Créer un nouveau cours'}</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Titre du cours</label>
                <input required value={newCourse.titre} onChange={e => setNewCourse({...newCourse, titre: e.target.value})} placeholder="Ex: Mathématiques Appliquées" />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Catégorie</label>
                  <select value={newCourse.categorie} onChange={e => setNewCourse({...newCourse, categorie: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'white' }}>
                    <option value="Non classé">Non classé</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Management">Management</option>
                    <option value="Langues">Langues</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Niveau</label>
                  <select value={newCourse.niveau} onChange={e => setNewCourse({...newCourse, niveau: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'white' }}>
                    <option value="Tous niveaux">Tous niveaux</option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description (Optionnel)</label>
                <textarea rows="3" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              </div>
              
              <div className="input-group">
                <label>Professeur Responsable</label>
                <select 
                  required 
                  value={newCourse.id_enseignant} 
                  onChange={e => setNewCourse({...newCourse, id_enseignant: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'white' }}
                >
                  <option value="" disabled>-- Sélectionner un professeur --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>Dr. {t.nom} {t.prenom} ({t.departement})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Crédits ECTS</label>
                  <input required type="number" min="1" max="15" value={newCourse.credits_ects} onChange={e => setNewCourse({...newCourse, credits_ects: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Capacité Max</label>
                  <input required type="number" min="5" max="300" value={newCourse.capacite_max} onChange={e => setNewCourse({...newCourse, capacite_max: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                {editMode ? 'Enregistrer les modifications' : 'Créer et Publier le cours'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
