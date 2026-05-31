/**
 * SMARTCAMPUS FRONTEND - AdminTeachers.jsx
 * 
 * Description : Interface administrateur pour la gestion du corps professoral.
 * Rôle : Interface Utilisateur (React)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Search, UserPlus, X, Trash2 } from 'lucide-react';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTeacher, setNewTeacher] = useState({ nom: '', prenom: '', email: '', departement: '' });

  const fetchTeachers = () => {
    fetch(`/SmartCampusApp/backend/api/teachers.php`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setTeachers(data.enseignants);
      });
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/teachers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      });
      const data = await res.json();
      if(data.success) {
        alert("Enseignant créé avec succès !");
        setIsModalOpen(false);
        fetchTeachers();
      } else {
        alert(data.message);
      }
    } catch(err) {
      alert("Erreur de connexion.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Voulez-vous vraiment supprimer cet enseignant ? Tous ses cours seront également supprimés.")) return;
    try {
      const res = await fetch(`/SmartCampusApp/backend/api/teachers.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      if(data.success) fetchTeachers();
    } catch(e) {
      alert("Erreur réseau ou CORS : " + e.message);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.departement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Gestion des Enseignants</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={20} /> Ajouter
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Nom complet</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Département</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>Dr. {t.nom} {t.prenom}</td>
                    <td style={{ padding: '1rem' }}>{t.departement}</td>
                    <td style={{ padding: '1rem' }}>{t.email}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                      <Link to={`/admin/teachers/${t.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                        Voir profil
                      </Link>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Ajouter un enseignant</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleAddTeacher}>
              <div className="input-group">
                <label>Nom</label>
                <input required value={newTeacher.nom} onChange={e => setNewTeacher({...newTeacher, nom: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Prénom</label>
                <input required value={newTeacher.prenom} onChange={e => setNewTeacher({...newTeacher, prenom: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Email professionnel</label>
                <input required type="email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Département / Spécialité</label>
                <input required value={newTeacher.departement} onChange={e => setNewTeacher({...newTeacher, departement: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                Créer le profil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
