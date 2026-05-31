/**
 * SMARTCAMPUS FRONTEND - Login.jsx
 * 
 * Description : Page d'authentification centralisée pour tous les rôles (Étudiant, Professeur, Admin).
 * Rôle : Interface Utilisateur (React)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Pour MAMP, on assume localhost:8888 par défaut (ou 8888 sur Mac)
      const response = await fetch(`/SmartCampusApp/backend/api/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'Etudiant') window.location.href = '/student/dashboard';
        else if (data.user.role === 'Professeur') window.location.href = '/teacher/dashboard';
        else if (data.user.role === 'Admin') window.location.href = '/admin/dashboard';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que MAMP est lancé.');
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-logo">
          <GraduationCap size={40} />
          ECE Paris
        </div>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Connexion à SmartCampus</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: 8 }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label>Adresse Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
