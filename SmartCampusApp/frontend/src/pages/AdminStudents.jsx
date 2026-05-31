/**
 * SMARTCAMPUS FRONTEND - AdminStudents.jsx
 * 
 * Description : Interface administrateur pour gérer la liste des étudiants (ajout, modification, suppression).
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Search, UserPlus, X, Trash2, Filter } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('Toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [newStudent, setNewStudent] = useState({ nom: '', prenom: '', email: '', matricule: '', annee_etude: 'L1' });

  const fetchStudents = () => {
    fetch(`/SmartCampusApp/backend/api/students.php`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setStudents(data.etudiants);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/students.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      if(data.success) {
        alert("Étudiant créé avec succès ! Le mot de passe par défaut est 'password'.");
        setIsModalOpen(false);
        fetchStudents();
      } else {
        alert(data.message);
      }
    } catch(err) {
      alert("Erreur de connexion.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/students.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      if(data.success) fetchStudents();
    } catch(e) {
      alert("Erreur réseau ou CORS : " + e.message);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return alert("Aucune donnée à exporter.");
    const headers = ["Matricule", "Nom", "Prenom", "Email", "Annee"];
    const csvContent = [
      headers.join(";"),
      ...students.map(s => `${s.matricule};${s.nom};${s.prenom};${s.email};${s.annee_etude}`)
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // uFEFF = BOM pour Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Etudiants_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAnnee = filterAnnee === 'Toutes' || s.annee_etude === filterAnnee;
    return matchSearch && matchAnnee;
  });

  const availableAnnees = [...new Set(students.map(s => s.annee_etude).filter(Boolean))];
  const expectedOrder = ['L1', 'L2', 'L3', 'M1', 'M2'];
  availableAnnees.sort((a, b) => {
    let idxA = expectedOrder.indexOf(a);
    let idxB = expectedOrder.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    if (idxA === idxB) return a.localeCompare(b);
    return idxA - idxB;
  });
  const annees = ['Toutes', ...availableAnnees];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content page-transition">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1>Gestion des Étudiants</h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 10 }} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '250px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Filter size={18} color="var(--text-muted)" />
                <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent' }}>
                  {annees.map(an => <option key={an} value={an}>{an}</option>)}
                </select>
              </div>
              <button className="btn-secondary" onClick={handleExportCSV}>
                Exporter CSV
              </button>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={20} /> Ajouter
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Matricule</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Nom complet</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Année</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => {
                  const estARisque = (s.moyenne !== null && parseFloat(s.moyenne) < 10) || parseInt(s.absences) >= 3;
                  return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{s.matricule}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{s.nom} {s.prenom}</td>
                    <td style={{ padding: '1rem' }}>{s.email}</td>
                    <td style={{ padding: '1rem' }}>{s.annee_etude}</td>
                    <td style={{ padding: '1rem' }}>
                      {estARisque ? (
                        <span className="badge badge-danger" title={`Moyenne: ${s.moyenne || 'N/A'} | Absences: ${s.absences}`}>À risque</span>
                      ) : (
                        <span className="badge badge-primary">Conforme</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                      <Link to={`/admin/students/${s.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                        Voir profil
                      </Link>
                      <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal Ajout Étudiant */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Ajouter un étudiant</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="input-group">
                <label>Nom</label>
                <input required value={newStudent.nom} onChange={e => setNewStudent({...newStudent, nom: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Prénom</label>
                <input required value={newStudent.prenom} onChange={e => setNewStudent({...newStudent, prenom: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Email (Identifiant)</label>
                <input required type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Matricule</label>
                  <input required value={newStudent.matricule} onChange={e => setNewStudent({...newStudent, matricule: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Année</label>
                  <input required value={newStudent.annee_etude} onChange={e => setNewStudent({...newStudent, annee_etude: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                Créer le compte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
