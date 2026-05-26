import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader, Camera } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function StudentScan() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [searchParams] = useSearchParams();
  const seanceIdFromUrl = searchParams.get('seance');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('idle'); // 'idle', 'scanning', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'Etudiant') {
      setStatus('error');
      setMessage("Vous devez être connecté en tant qu'étudiant.");
      return;
    }

    if (seanceIdFromUrl) {
      // Si on arrive directement via le lien du QR Code natif
      validateAttendance(seanceIdFromUrl);
    } else {
      // Sinon, on active le scanner
      setStatus('scanning');
    }

    return () => {
      // Nettoyage du scanner si le composant est démonté
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [user, seanceIdFromUrl]);

  useEffect(() => {
    if (status === 'scanning') {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        }, 
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Si on scanne avec succès
          try {
            const url = new URL(decodedText);
            const scannedSeanceId = url.searchParams.get('seance');
            if (scannedSeanceId) {
              scanner.clear(); // Arrêter la caméra
              validateAttendance(scannedSeanceId);
            } else {
              setMessage("Ce QR code n'est pas un code de présence SmartCampus.");
            }
          } catch(e) {
            setMessage("QR Code invalide.");
          }
        },
        (error) => {
          // Ignore errors as they happen constantly when no QR is in frame
        }
      );
    }
  }, [status]);

  const validateAttendance = (seanceId) => {
    setStatus('loading');
    
    fetch(`/SmartCampusApp/backend/api/attendance_student.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_etudiant: user.id_etudiant,
        id_seance: seanceId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus('success');
        setMessage("Votre présence a été validée avec succès !");
      } else {
        setStatus('error');
        setMessage(data.message || "Erreur lors de la validation.");
      }
    })
    .catch(() => {
      setStatus('error');
      setMessage("Impossible de contacter le serveur.");
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        
        {status === 'scanning' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Camera size={24} /> Scanner le tableau
            </h2>
            <div id="qr-reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
            {message && <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem' }}>{message}</p>}
            <button 
              className="btn-primary" 
              onClick={() => navigate('/student/attendance')}
              style={{ marginTop: '2rem', width: '100%', backgroundColor: '#6b7280', borderColor: '#6b7280' }}
            >
              Annuler
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <Loader size={48} className="animate-spin" />
            <p>Validation en cours...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ animation: 'bounce 0.5s ease' }}>
              <CheckCircle size={80} color="#16a34a" />
            </div>
            <h1 style={{ color: '#16a34a', fontSize: '1.5rem', marginTop: '1rem' }}>Présence Validée !</h1>
            <p style={{ color: 'var(--text-muted)' }}>{message}</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/student/attendance')}
              style={{ marginTop: '2rem', width: '100%' }}
            >
              Voir mes absences
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={80} color="#dc2626" />
            <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginTop: '1rem' }}>Erreur</h1>
            <p style={{ color: 'var(--text-muted)' }}>{message}</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/student/attendance')}
              style={{ marginTop: '2rem', width: '100%', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            >
              Retour à mes absences
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Customizing html5-qrcode UI */
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: white; }
        #qr-reader__dashboard_section_csr button {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
