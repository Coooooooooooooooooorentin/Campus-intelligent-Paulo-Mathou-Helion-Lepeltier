import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Download, GraduationCap } from 'lucide-react';

export default function Transcript() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/SmartCampusApp/backend/api/transcript.php?id_utilisateur=${user.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData);
        }
      });
  }, [user]);

  const handlePrint = () => {
    const element = document.getElementById('transcript-content');
    const opt = {
      margin:       [0.5, 0, 0.5, 0], // top, left, bottom, right
      filename:     `Releve_Notes_${data.etudiant.nom}_${data.etudiant.prenom}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Générer et télécharger le PDF
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print(); // Fallback si la librairie ne charge pas
    }
  };

  if (!data) return <div className="app-container"><Sidebar /><div className="main-content"><TopBar /><div className="page-content">Chargement du relevé...</div></div></div>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
          
          <div style={{ width: '100%', maxWidth: '210mm', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} className="no-print">
            <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <Download size={20} />
              Télécharger PDF
            </button>
          </div>

          {/* DOCUMENT A4 */}
          <div 
            id="transcript-content"
            className="print-area card" 
            style={{ 
              width: '100%', maxWidth: '210mm', minHeight: '297mm', 
              backgroundColor: 'white', padding: '3rem', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              color: 'black' 
            }}
          >
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #10b981', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem' }}>
                  <GraduationCap size={32} />
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>SmartCampus ECE</h1>
                </div>
                <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>École d'Ingénieurs</div>
                <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>37 Quai de Grenelle, 75015 Paris</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>RELEVÉ DE NOTES</h2>
                <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '0.25rem' }}>Année Universitaire {data.etablissement.annee}</div>
                <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>Édité le {data.etablissement.date_generation}</div>
              </div>
            </div>

            {/* Identité */}
            <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Étudiant(e)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{data.etudiant.nom.toUpperCase()} {data.etudiant.prenom}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Matricule</div>
                <div style={{ fontSize: '1.1rem', color: '#111827', fontWeight: 500 }}>{data.etudiant.matricule}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Niveau</div>
                <div style={{ fontSize: '1.1rem', color: '#111827', fontWeight: 500 }}>{data.etudiant.annee_etude}</div>
              </div>
            </div>

            {/* Tableau des notes */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #111827' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#111827' }}>Unité d'Enseignement (UE)</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 0', color: '#111827' }}>Crédits</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 0', color: '#111827' }}>Note / 20</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 0', color: '#111827' }}>Moy. Promo</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#111827' }}>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {data.cours.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500, color: '#1f2937' }}>{c.titre}</td>
                    <td style={{ textAlign: 'center', padding: '1rem 0' }}>{c.credits_ects}</td>
                    <td style={{ textAlign: 'center', padding: '1rem 0', fontWeight: 'bold' }}>
                      {c.valeur !== '-' ? parseFloat(c.valeur).toFixed(2).replace('.', ',') : '-'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem 0', color: '#6b7280' }}>
                      {c.moyenne_classe ? parseFloat(c.moyenne_classe).toFixed(2).replace('.', ',') : '-'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '1rem 0', color: c.appreciation === 'Validé' ? '#10b981' : (c.appreciation === 'En attente' ? '#6b7280' : '#ef4444') }}>
                      {c.appreciation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bilan Global */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                  <span style={{ color: '#4b5563' }}>Moyenne Générale :</span>
                  <strong style={{ color: '#111827' }}>
                    {data.statistiques.gpa !== null ? `${parseFloat(data.statistiques.gpa).toFixed(2).replace('.', ',')} / 20` : '-'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: '#4b5563' }}>Crédits ECTS acquis :</span>
                  <strong style={{ color: '#111827' }}>{data.statistiques.total_ects}</strong>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
              Document généré électroniquement par SmartCampus. Toute altération frauduleuse de ce document est passible de sanctions disciplinaires.
              <br/>Signature de la direction des études :
              <div style={{ marginTop: '1rem', fontStyle: 'italic', fontFamily: 'serif', fontSize: '1.5rem', color: '#1f2937' }}>Direction Scolarité</div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
