import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Sparkles, BrainCircuit, Activity, RefreshCw } from 'lucide-react';

export default function AcademicAdvisor() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdvice = () => {
    setLoading(true);
    setAnalysis(null);
    setError('');

    // Simulation d'un temps de réponse IA (1.5s)
    setTimeout(() => {
      fetch(`/SmartCampusApp/backend/api/advisor_ai.php?id_utilisateur=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAnalysis(data);
          } else {
            setError(data.message);
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Erreur de connexion au serveur IA.');
          setLoading(false);
        });
    }, 1500);
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#eef2ff', borderRadius: '50%', color: '#6366f1' }}>
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 style={{ margin: 0 }}>Conseiller Académique IA</h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem' }}>Analyse prédictive de votre profil et recommandations personnalisées</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', minHeight: '400px', position: 'relative' }}>
            
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
                <RefreshCw size={40} className="spinner" color="#6366f1" />
                <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '1.1rem' }}>L'IA analyse vos données académiques...</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Compilation des notes, de l'assiduité et des objectifs.</div>
              </div>
            )}

            {error && (
              <div style={{ color: 'white', backgroundColor: '#ef4444', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {!loading && analysis && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles color="white" size={24} />
                  </div>
                  <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-color)', flexGrow: 1 }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
                      {analysis.greetings}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analysis.analysis.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <Activity size={18} color="#6366f1" style={{ marginTop: '3px', flexShrink: 0 }} />
                          <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                  <button 
                    onClick={fetchAdvice}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#6366f1'; }}
                  >
                    <RefreshCw size={18} />
                    Actualiser l'analyse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
