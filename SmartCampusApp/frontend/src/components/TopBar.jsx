import { Bell, Search, Menu, Moon, Sun, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  
  // États Existants
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Nouveaux États Premium
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Appliquer le thème initial
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    if (user) {
      fetch(`/SmartCampusApp/backend/api/messages.php?id_user=${user.id}&type=reception`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUnreadMessages(data.messages.filter(m => m.lu === 0));
          }
        });
    }
  }, [user, isDarkMode]);

  // Recherche API dynamique
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetch(`/SmartCampusApp/backend/api/search.php?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if(data.success) {
            setSearchResults(data.results);
            setIsSearchOpen(true);
          }
        });
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  };

  const toggleMobileMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  };

  return (
    <div className="topbar">
      
      {/* Côté Gauche : Menu Mobile & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '150px' }}>
        <button onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }} className="mobile-only">
          <Menu size={24} />
        </button>
        
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', display: 'none' }} className="mobile-logo">
          SmartCampus
        </div>
      </div>

      {/* Centre : Barre de Recherche Globale */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '450px', margin: '0 2rem 0 1rem' }} ref={searchRef}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-main)', borderRadius: '999px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', transition: 'border-color 0.2s' }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Rechercher (ex: IA, Dupont...)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if(searchResults.length > 0) setIsSearchOpen(true); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)', fontSize: '0.95rem' }}
            />
          </div>

          {/* Dropdown de recherche */}
          {isSearchOpen && (
            <div style={{ position: 'absolute', top: '120%', left: 0, width: '100%', backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)', borderRadius: '12px', border: '1px solid var(--border-color)', zIndex: 50, overflow: 'hidden' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun résultat.</div>
              ) : (
                searchResults.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => { navigate(res.url); setIsSearchOpen(false); setSearchQuery(''); }}
                    style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{res.titre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{res.type}</div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Côté Droit : Actions & Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end', whiteSpace: 'nowrap', minWidth: '150px' }}>
        
        {/* Toggle Dark Mode */}
        <button 
          onClick={toggleTheme} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-main)' }}
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDarkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-main)' }} 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} color={unreadMessages.length > 0 ? "var(--primary)" : "var(--text-muted)"} />
            {unreadMessages.length > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                {unreadMessages.length}
              </span>
            )}
          </div>

          {/* Menu déroulant des notifications */}
          {showDropdown && (
            <div style={{ 
              position: 'absolute', top: '120%', right: 0, width: '300px', backgroundColor: 'var(--card-bg)', 
              boxShadow: 'var(--shadow-lg)', borderRadius: '12px', border: '1px solid var(--border-color)', zIndex: 50, overflow: 'hidden' 
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', backgroundColor: 'var(--bg-main)' }}>
                Notifications
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {unreadMessages.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Aucune nouvelle notification.
                  </div>
                ) : (
                  unreadMessages.slice(0, 5).map(msg => (
                    <div 
                      key={msg.id} 
                      onClick={() => { navigate('/messages'); setShowDropdown(false); }}
                      style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', whiteSpace: 'normal' }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        De: {msg.expediteur_nom}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {msg.sujet}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
             <img src={`https://ui-avatars.com/api/?name=${user?.prenom}+${user?.nom}&background=0FAD5D&color=fff`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
