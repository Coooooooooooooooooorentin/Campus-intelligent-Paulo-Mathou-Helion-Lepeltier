import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Mail, Send, Inbox, Check, AlertCircle, Trash2, Reply } from 'lucide-react';

export default function Messages() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('reception'); // 'reception', 'envoi', 'nouveau'
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Nouveau message
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ id_destinataire: '', sujet: '', contenu: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (activeTab === 'reception' || activeTab === 'envoi') {
      fetch(`/SmartCampusApp/backend/api/messages.php?id_user=${user.id}&type=${activeTab}`)
        .then(res => res.json())
        .then(data => { if(data.success) setMessages(data.messages); });
    } else if (activeTab === 'nouveau') {
      fetch('/SmartCampusApp/backend/api/users_list.php')
        .then(res => res.json())
        .then(data => { 
          if(data.success) setUsers(data.users.filter(u => u.id !== user.id)); 
        });
    }
    setSelectedMessage(null);
  }, [activeTab, user.id]);

  const handleReadMessage = (msg) => {
    setSelectedMessage(msg);
    if (activeTab === 'reception' && msg.lu === 0) {
      // Marquer comme lu
      fetch('/SmartCampusApp/backend/api/messages.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_message: msg.id })
      }).then(() => {
        setMessages(messages.map(m => m.id === msg.id ? { ...m, lu: 1 } : m));
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    if (!formData.id_destinataire) {
      setStatusMsg({ type: 'error', text: 'Veuillez sélectionner un destinataire valide dans la liste.' });
      return;
    }
    try {
      const res = await fetch('/SmartCampusApp/backend/api/messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_expediteur: user.id,
          id_destinataire: formData.id_destinataire,
          sujet: formData.sujet,
          contenu: formData.contenu
        })
      });
      const data = await res.json();
      if(data.success) {
        setStatusMsg({ type: 'success', text: 'Message envoyé avec succès !' });
        setFormData({ id_destinataire: '', sujet: '', contenu: '' });
        setUserSearch('');
        setTimeout(() => setActiveTab('envoi'), 1500);
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch(err) {
      setStatusMsg({ type: 'error', text: 'Erreur réseau.' });
    }
  };

  const handleReply = () => {
    if (users.length === 0) {
      fetch('/SmartCampusApp/backend/api/users_list.php')
        .then(res => res.json())
        .then(data => { 
          if(data.success) setUsers(data.users.filter(u => u.id !== user.id)); 
        });
    }
    const destinataireId = activeTab === 'reception' ? selectedMessage.id_expediteur : selectedMessage.id_destinataire;
    const destinataireNom = activeTab === 'reception' ? `${selectedMessage.expediteur_nom} ${selectedMessage.expediteur_prenom} (${selectedMessage.expediteur_role})` : `${selectedMessage.destinataire_nom} ${selectedMessage.destinataire_prenom} (${selectedMessage.destinataire_role})`;
    
    const prefix = selectedMessage.sujet.startsWith('Réponse : ') ? '' : 'Réponse : ';
    setFormData({
      id_destinataire: destinataireId,
      sujet: prefix + selectedMessage.sujet,
      contenu: `\n\n--- Le ${new Date(selectedMessage.date_envoi).toLocaleDateString('fr-FR')} à ${new Date(selectedMessage.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}, ${activeTab === 'reception' ? selectedMessage.expediteur_nom : selectedMessage.destinataire_nom} a écrit ---\n${selectedMessage.contenu}`
    });
    setUserSearch(destinataireNom);
    setActiveTab('nouveau');
  };

  const handleDeleteMessage = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    try {
      const res = await fetch('/SmartCampusApp/backend/api/messages.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_message: selectedMessage.id })
      });
      const data = await res.json();
      if(data.success) {
        setMessages(messages.filter(m => m.id !== selectedMessage.id));
        setSelectedMessage(null);
      } else {
        alert(data.message);
      }
    } catch(err) {
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
          
          <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={28} color="var(--primary)" /> Messagerie Interne
          </h1>

          <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
            
            {/* Menu de navigation */}
            <div className="card" style={{ width: '250px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('nouveau')}
                style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                + Nouveau Message
              </button>
              
              <div 
                onClick={() => setActiveTab('reception')}
                style={{ padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: activeTab === 'reception' ? '#e0e7ff' : 'transparent', color: activeTab === 'reception' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'reception' ? 'bold' : 'normal' }}
              >
                <Inbox size={18} /> Boîte de réception
              </div>
              
              <div 
                onClick={() => setActiveTab('envoi')}
                style={{ padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: activeTab === 'envoi' ? '#e0e7ff' : 'transparent', color: activeTab === 'envoi' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'envoi' ? 'bold' : 'normal' }}
              >
                <Send size={18} /> Messages envoyés
              </div>
            </div>

            {/* Contenu principal */}
            <div className="card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {activeTab === 'nouveau' ? (
                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Rédiger un message</h2>
                  {statusMsg.text && (
                    <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: statusMsg.type === 'success' ? '#16a34a' : '#dc2626' }}>
                      {statusMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group" style={{ position: 'relative' }}>
                      <label>Destinataire :</label>
                      <input 
                        type="text" 
                        placeholder="Rechercher un utilisateur (Nom, Prénom, Rôle)..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setShowUserDropdown(true);
                          setFormData({...formData, id_destinataire: ''});
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                        required={!formData.id_destinataire}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      />
                      {showUserDropdown && userSearch && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                          {users.filter(u => `${u.nom} ${u.prenom} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                            <div 
                              key={u.id}
                              style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                              onClick={() => {
                                setFormData({...formData, id_destinataire: u.id});
                                setUserSearch(`${u.nom} ${u.prenom} (${u.role})`);
                                setShowUserDropdown(false);
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              {u.nom} {u.prenom} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({u.role})</span>
                            </div>
                          ))}
                          {users.filter(u => `${u.nom} ${u.prenom} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Aucun résultat...</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label>Sujet :</label>
                      <input type="text" required value={formData.sujet} onChange={e => setFormData({...formData, sujet: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Message :</label>
                      <textarea required rows="8" value={formData.contenu} onChange={e => setFormData({...formData, contenu: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'vertical' }}></textarea>
                    </div>
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send size={16} /> Envoyer le message
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'flex', height: '100%' }}>
                  
                  {/* Liste des messages */}
                  <div style={{ width: '350px', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
                    {messages.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun message.</div>
                    ) : (
                      messages.map(msg => (
                        <div 
                          key={msg.id} 
                          onClick={() => handleReadMessage(msg)}
                          style={{ 
                            padding: '1rem', 
                            borderBottom: '1px solid var(--border-color)', 
                            cursor: 'pointer',
                            backgroundColor: selectedMessage?.id === msg.id ? '#f3f4f6' : (msg.lu === 0 && activeTab === 'reception' ? '#eff6ff' : 'white')
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ color: msg.lu === 0 && activeTab === 'reception' ? '#111827' : '#4b5563' }}>
                              {activeTab === 'reception' ? `${msg.expediteur_nom} ${msg.expediteur_prenom}` : `À: ${msg.destinataire_nom} ${msg.destinataire_prenom}`}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(msg.date_envoi).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: msg.lu === 0 && activeTab === 'reception' ? 'bold' : 'normal', color: msg.lu === 0 && activeTab === 'reception' ? 'var(--primary)' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {msg.sujet}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Lecture du message */}
                  <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
                    {!selectedMessage ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Mail size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Sélectionnez un message pour le lire.</p>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <h2 style={{ color: '#111827', margin: 0 }}>{selectedMessage.sujet}</h2>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {activeTab === 'reception' && (
                              <button onClick={handleReply} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                                <Reply size={16} /> Répondre
                              </button>
                            )}
                            <button onClick={handleDeleteMessage} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }}>
                              <Trash2 size={16} /> Supprimer
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>De :</span>
                            <strong>{activeTab === 'reception' ? `${selectedMessage.expediteur_nom} ${selectedMessage.expediteur_prenom} (${selectedMessage.expediteur_role})` : `Moi`}</strong>
                            <br/>
                            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>À :</span>
                            <strong>{activeTab === 'envoi' ? `${selectedMessage.destinataire_nom} ${selectedMessage.destinataire_prenom} (${selectedMessage.destinataire_role})` : `Moi`}</strong>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            Le {new Date(selectedMessage.date_envoi).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                            à {new Date(selectedMessage.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#374151' }}>
                          {selectedMessage.contenu}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
