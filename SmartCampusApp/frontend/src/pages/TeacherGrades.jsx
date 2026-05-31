import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Search, CheckCircle, Lock, TrendingUp, Users, Target } from 'lucide-react';

export default function TeacherGrades() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const fetchStudents = () => {
    fetch(`/SmartCampusApp/backend/api/grades.php?id_prof=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStudents(data.etudiants);
      });
      
    fetch(`/SmartCampusApp/backend/api/teacher_grades_stats.php?id_prof=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStats(data.stats);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSaveGrade = async (id_etudiant, id_cours, nouvelleNote) => {
    if (nouvelleNote < 0 || nouvelleNote > 20) {
      alert("La note doit être comprise entre 0 et 20.");
      return;
    }

    try {
      const res = await fetch(`/SmartCampusApp/backend/api/grades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_etudiant, id_cours, note: nouvelleNote })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Note sauvegardée avec succès !');
        fetchStudents(); // Rafraîchir les notes et stats
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(data.message);
      }
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  const handleLockCourse = async (id_cours, titre) => {
    if(!window.confirm(`Êtes-vous sûr de vouloir verrouiller les notes pour le cours "${titre}" ? Cette action est IRRÉVERSIBLE.`)) return;

    try {
      const res = await fetch(`/SmartCampusApp/backend/api/lock_grades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cours })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) fetchStudents();
    } catch(e) {
      alert("Erreur réseau.");
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return alert("Aucune donnée à exporter.");
    const headers = ["Matricule", "Nom", "Prenom", "Cours", "Note"];
    const csvContent = [
      headers.join(";"),
      ...students.map(s => `${s.matricule};${s.nom};${s.prenom};${s.cours_titre};${s.note !== null ? s.note : 'N/A'}`)
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // uFEFF = BOM pour Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Notes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cours_titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map des cours uniques pour le verrouillage
  const uniqueCourses = [];
  const courseMap = new Map();
  students.forEach(s => {
    if(!courseMap.has(s.id_cours)) {
      courseMap.set(s.id_cours, true);
      uniqueCourses.push({
        id: s.id_cours,
        titre: s.cours_titre,
        locked: s.notes_verrouillees == 1
      });
    }
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1>Gestion des Notes & Statistiques</h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                <input 
                  type="text" 
                  placeholder="Rechercher étudiant ou cours..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '300px' }}
                />
              </div>
              <button className="btn-secondary" onClick={handleExportCSV}>
                Exporter CSV
              </button>
            </div>
          </div>

          {/* Statistiques des cours */}
          {stats.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Statistiques Globales par Cours</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {stats.map(s => (
                  <div key={s.id_cours} className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#111827' }}>{s.titre}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16}/> Notes saisies</span>
                      <strong>{s.nb_notes}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={16}/> Moyenne de classe</span>
                      <strong style={{ color: 'var(--primary)' }}>{s.moyenne !== null ? s.moyenne + ' / 20' : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={16}/> Taux de réussite (&ge; 10)</span>
                      <strong style={{ color: s.taux_reussite >= 50 ? '#16a34a' : '#ea580c' }}>
                        {s.taux_reussite !== null ? s.taux_reussite + ' %' : '-'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#6b7280' }}>
                      <span>Min : {s.min !== null ? s.min : '-'}</span>
                      <span>Max : {s.max !== null ? s.max : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Validation Finale */}
          {uniqueCourses.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Validation Finale des Cours</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {uniqueCourses.map(course => (
                  <div key={course.id} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <strong>{course.titre}</strong>
                    {course.locked ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Lock size={16} /> Verrouillé
                      </span>
                    ) : (
                      <button onClick={() => handleLockCourse(course.id, course.titre)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={16} /> Verrouiller
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} /> {message}
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Matricule</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Étudiant</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Cours</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Note (/20)</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun étudiant trouvé.</td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <GradeRow key={idx} student={student} onSave={handleSaveGrade} />
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

function GradeRow({ student, onSave }) {
  const [noteInput, setNoteInput] = useState(student.note !== null ? student.note : '');
  const isLocked = student.notes_verrouillees == 1;

  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isLocked ? '#f9fafb' : 'transparent' }}>
      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{student.matricule}</td>
      <td style={{ padding: '1rem', fontWeight: 500 }}>{student.nom} {student.prenom}</td>
      <td style={{ padding: '1rem' }}>
        {student.cours_titre}
        {isLocked && <Lock size={12} style={{ marginLeft: '8px', color: '#b91c1c' }} />}
      </td>
      <td style={{ padding: '1rem' }}>
        <input 
          type="number" 
          min="0" max="20" step="0.5"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          style={{ padding: '0.5rem', width: '80px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: isLocked ? '#e5e7eb' : 'white' }}
          placeholder="Ex: 15"
          disabled={isLocked}
        />
      </td>
      <td style={{ padding: '1rem', textAlign: 'center' }}>
        <button 
          className="btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
          onClick={() => onSave(student.id_etudiant, student.id_cours, noteInput)}
          disabled={noteInput === '' || isLocked}
        >
          {isLocked ? 'Verrouillé' : (student.note !== null ? 'Modifier' : 'Valider')}
        </button>
      </td>
    </tr>
  );
}
