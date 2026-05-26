import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, GraduationCap, LogOut, Users, FileText, Briefcase, Mail, QrCode, BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetch(`/SmartCampusApp/backend/api/messages.php?id_user=${user.id}&type=reception`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUnreadCount(data.messages.filter(m => m.lu === 0).length);
          }
        });
    }
  }, [user, location.pathname]); // Update when changing pages

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getDashboardLink = () => {
    if (user?.role === 'Professeur') return '/teacher/dashboard';
    if (user?.role === 'Admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <GraduationCap size={32} />
        ECE Paris
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1, marginTop: '2rem' }}>
        <Link to={getDashboardLink()} className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Tableau de Bord
        </Link>
        
        {user?.role === 'Etudiant' && (
          <>
            <Link to="/student/scan" className={`nav-link ${location.pathname === '/student/scan' ? 'active' : ''}`}>
              <QrCode size={20} />
              Scanner QR
            </Link>
            <Link to="/student/advisor" className={`nav-link ${location.pathname === '/student/advisor' ? 'active' : ''}`}>
              <BrainCircuit size={20} />
              Conseiller IA
            </Link>
            <Link to="/student/transcript" className={`nav-link ${location.pathname === '/student/transcript' ? 'active' : ''}`}>
              <FileText size={20} />
              Mon relevé PDF
            </Link>
            <Link to="/student/catalog" className={`nav-link ${location.pathname === '/student/catalog' ? 'active' : ''}`}>
              <BookOpen size={20} />
              Catalogue
            </Link>
            <Link to="/student/enrollments" className={`nav-link ${location.pathname === '/student/enrollments' ? 'active' : ''}`}>
              <GraduationCap size={20} />
              Mes cours
            </Link>
            <Link to="/student/attendance" className={`nav-link ${location.pathname === '/student/attendance' ? 'active' : ''}`}>
              <Users size={20} />
              Mes absences
            </Link>
          </>
        )}
        
        {user?.role === 'Professeur' && (
          <>
            <Link to="/teacher/grades" className={`nav-link ${location.pathname === '/teacher/grades' ? 'active' : ''}`}>
              <FileText size={20} />
              Saisie des notes
            </Link>
            <Link to="/teacher/attendance" className={`nav-link ${location.pathname === '/teacher/attendance' ? 'active' : ''}`}>
              <Users size={20} />
              Faire l'appel
            </Link>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <Link to="/admin/students" className={`nav-link ${location.pathname.includes('/admin/students') ? 'active' : ''}`}>
              <Users size={20} />
              Étudiants
            </Link>
            <Link to="/admin/teachers" className={`nav-link ${location.pathname.includes('/admin/teachers') ? 'active' : ''}`}>
              <Briefcase size={20} />
              Enseignants
            </Link>
            <Link to="/admin/courses" className={`nav-link ${location.pathname.includes('/admin/courses') ? 'active' : ''}`}>
              <BookOpen size={20} />
              Cours
            </Link>
          </>
        )}

        <Link to="/schedule" className={`nav-link ${location.pathname === '/schedule' ? 'active' : ''}`}>
          <Calendar size={20} />
          Emploi du temps
        </Link>
        <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`} style={{ position: 'relative' }}>
          <Mail size={20} />
          Messagerie
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', right: '1rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
              {unreadCount}
            </span>
          )}
        </Link>
      </nav>

      <div style={{ padding: '1rem' }}>
        <button className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }} onClick={logout}>
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
