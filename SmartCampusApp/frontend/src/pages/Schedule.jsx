import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, User, Tag } from 'lucide-react';

export default function Schedule() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [allSeances, setAllSeances] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));

  // Admin Scheduling States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ id_cours: '', date: '', heure_debut: '', heure_fin: '', salle: '', type: 'CM' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Détails de la séance
  const [selectedSeance, setSelectedSeance] = useState(null);

  const fetchSchedule = () => {
    fetch(`/SmartCampusApp/backend/api/schedule.php?id=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => { if(data.success) setAllSeances(data.seances); });
  };

  useEffect(() => {
    if(user) {
      fetchSchedule();
      if(user.role === 'Admin') {
        fetch('/SmartCampusApp/backend/api/courses_admin.php')
          .then(res => res.json())
          .then(data => { if(data.success) setCourses(data.cours || []); });
      }
    }
  }, [user.id, user.role]);

  // Fonctions de gestion du calendrier
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) { // Du lundi au vendredi (5 jours)
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Filtrer les séances pour la semaine courante
  const seancesOfWeek = allSeances.filter(seance => {
    const seanceDate = new Date(seance.date_heure_debut);
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 5); // Jusqu'au vendredi inclus
    
    // On met tout à 0h pour une comparaison de date pure
    const sDateOnly = new Date(seanceDate.getFullYear(), seanceDate.getMonth(), seanceDate.getDate());
    const startOnly = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
    const endOnly = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
    
    return sDateOnly >= startOnly && sDateOnly < endOnly;
  });

  // Heures affichées dans la grille (8h à 20h)
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    
    const payload = {
      id_cours: formData.id_cours,
      date_heure_debut: `${formData.date} ${formData.heure_debut}:00`,
      date_heure_fin: `${formData.date} ${formData.heure_fin}:00`,
      salle: formData.salle,
      type: formData.type
    };

    try {
      const res = await fetch('/SmartCampusApp/backend/api/schedule_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.success) {
        setFormSuccess(data.message);
        fetchSchedule(); // Rafraîchir le calendrier
        setTimeout(() => { setIsModalOpen(false); setFormSuccess(''); }, 1500);
      } else {
        setFormError(data.message);
      }
    } catch(err) {
      setFormError('Erreur réseau.');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CM': return { bg: '#e0f2fe', border: '#38bdf8', text: '#0369a1' }; // Bleu
      case 'TD': return { bg: '#dcfce7', border: '#4ade80', text: '#15803d' }; // Vert
      case 'TP': return { bg: '#ffedd5', border: '#fb923c', text: '#c2410c' }; // Orange
      case 'Examen': return { bg: '#fee2e2', border: '#f87171', text: '#b91c1c' }; // Rouge
      default: return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' }; // Gris
    }
  };

  const parseTime = (dateString) => {
    const d = new Date(dateString);
    return { hour: d.getHours(), minute: d.getMinutes() };
  };

  // Convertit une heure (ex: 8h30) en position verticale dans la grille
  const getTopPosition = (hour, minute) => {
    const startHour = 8; // Le calendrier commence à 8h
    const pixelsPerHour = 60; // 1 heure = 60px
    return ((hour - startHour) * pixelsPerHour) + minute;
  };

  // Titre de la semaine
  const weekTitle = `${currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarIcon size={28} color="var(--primary)" /> 
              Emploi du temps
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user && user.role === 'Admin' && (
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  + Planifier une séance
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button onClick={() => navigateWeek(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                  <ChevronLeft size={20} />
                </button>
                <strong style={{ minWidth: '220px', textAlign: 'center', fontSize: '1.1rem' }}>{weekTitle}</strong>
                <button onClick={() => navigateWeek(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* CALENDRIER */}
          <div className="card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Header des jours */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
              <div style={{ borderRight: '1px solid var(--border-color)' }}></div> {/* Coin vide */}
              {weekDays.map((day, idx) => (
                <div key={idx} style={{ padding: '1rem', textAlign: 'center', borderRight: idx < 4 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', color: day.toDateString() === new Date().toDateString() ? 'var(--primary)' : 'var(--text-muted)', fontWeight: day.toDateString() === new Date().toDateString() ? 'bold' : 'normal' }}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Grille des heures */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', minHeight: `${HOURS.length * 60}px` }}>
                
                {/* Colonne des Heures */}
                <div style={{ borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)', position: 'relative' }}>
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: '60px', borderBottom: '1px solid var(--border-color)', paddingRight: '10px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', transform: 'translateY(-10px)' }}>
                      {hour}h00
                    </div>
                  ))}
                </div>

                {/* Colonnes des Jours */}
                {weekDays.map((day, dayIdx) => {
                  // Trouver les cours de ce jour spécifique
                  const daySeances = seancesOfWeek.filter(s => {
                    const d = new Date(s.date_heure_debut);
                    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
                  });

                  return (
                    <div key={dayIdx} style={{ position: 'relative', borderRight: dayIdx < 4 ? '1px solid var(--border-color)' : 'none' }}>
                      {/* Lignes horizontales de fond */}
                      {HOURS.map(hour => (
                        <div key={hour} style={{ height: '60px', borderBottom: '1px solid var(--border-color)' }}></div>
                      ))}

                      {/* Blocs de cours */}
                      {daySeances.map(seance => {
                        const start = parseTime(seance.date_heure_debut);
                        const end = parseTime(seance.date_heure_fin);
                        
                        const top = getTopPosition(start.hour, start.minute);
                        const height = getTopPosition(end.hour, end.minute) - top;
                        const colors = getTypeColor(seance.type);

                        return (
                          <div 
                            key={seance.id} 
                            onClick={() => setSelectedSeance(seance)}
                            style={{
                              position: 'absolute',
                              top: `${top}px`,
                              height: `${height}px`,
                              left: '4px',
                              right: '4px',
                              backgroundColor: colors.bg,
                              borderLeft: `4px solid ${colors.border}`,
                              borderRadius: '4px',
                              padding: '0.5rem',
                              overflow: 'hidden',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              cursor: 'pointer',
                              display: 'flex', flexDirection: 'column',
                              transition: 'transform 0.1s ease-in-out'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title="Cliquez pour voir les détails"
                          >
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: colors.text, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{seance.heure_debut} - {seance.heure_fin}</span>
                              <span style={{ backgroundColor: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '0.7rem' }}>{seance.type}</span>
                            </div>
                            <strong style={{ fontSize: '0.95rem', color: '#111827', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {seance.titre}
                            </strong>
                            
                            {height >= 60 && (
                              <div style={{ fontSize: '0.8rem', color: colors.text, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> Salle {seance.salle}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12}/> {seance.prof_nom || 'Moi'}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de planification */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Planifier une séance</h2>
            {formError && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{formError}</div>}
            {formSuccess && <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{formSuccess}</div>}
            
            <form onSubmit={handleScheduleSubmit}>
              <div className="input-group">
                <label>Cours concerné</label>
                <select required value={formData.id_cours} onChange={e => setFormData({...formData, id_cours: e.target.value})}>
                  <option value="">Sélectionnez un cours...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Date</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Heure de début</label>
                  <input type="time" required value={formData.heure_debut} onChange={e => setFormData({...formData, heure_debut: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Heure de fin</label>
                  <input type="time" required value={formData.heure_fin} onChange={e => setFormData({...formData, heure_fin: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 2 }}>
                  <label>Salle</label>
                  <input type="text" required placeholder="Ex: Amphi A, Salle 204" value={formData.salle} onChange={e => setFormData({...formData, salle: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="CM">CM</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                    <option value="Examen">Examen</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails Séance */}
      {selectedSeance && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedSeance(null)}>
          <div className="card" style={{ width: '450px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {selectedSeance.type}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {new Date(selectedSeance.date_heure_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>{selectedSeance.titre}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--input-bg)', borderRadius: '8px' }}><CalendarIcon size={20} color="var(--text-muted)" /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Horaires</div>
                  <div style={{ fontWeight: 500 }}>{selectedSeance.heure_debut} - {selectedSeance.heure_fin}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--input-bg)', borderRadius: '8px' }}><MapPin size={20} color="var(--text-muted)" /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Salle</div>
                  <div style={{ fontWeight: 500 }}>{selectedSeance.salle}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--input-bg)', borderRadius: '8px' }}><User size={20} color="var(--text-muted)" /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enseignant</div>
                  <div style={{ fontWeight: 500 }}>{selectedSeance.prof_nom || 'Moi'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSelectedSeance(null)} style={{ width: '100%' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
