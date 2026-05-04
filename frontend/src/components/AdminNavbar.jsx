import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
const SCROLL_LINKS = [
  { label: 'Accueil',      id: 'admin-hero'          },
  { label: 'Réservations', id: 'admin-reservations'  },
  { label: 'Menu',         id: 'admin-menu'          },
  { label: 'Clients',      id: 'admin-clients'       },
];

const PAGE_LINKS = [
  { label: 'Commandes',  to: '/admin/commandes'  },
  { label: 'Tables',     to: '/admin/tables'     },
  { label: 'Livraison',  to: '/admin/livraison'  },
  { label: 'Paiements',  to: '/admin/paiements'  },
  { label: 'Stats',      to: '/admin/stats'      },
  { label: 'Messagerie', to: '/admin/messagerie' },
];

export default function AdminNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToSection = (id) => {
    if (location.pathname === '/admin') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/admin', { state: { scrollTo: id } });
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(8,8,16,0.98)' : 'rgba(8,8,16,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(201,168,76,0.12)',
      transition: 'background 0.35s',
      padding: '0 1.25rem',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', gap: 0 }}>

        {/* Logo */}
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', marginRight: '1rem', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: 'linear-gradient(135deg,var(--burgundy),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em', boxShadow: '0 4px 12px rgba(139,26,46,0.45)' }}>MV</div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '0.86rem', fontWeight: 700, color: '#fff', lineHeight: 1.15 }}>Maison Velours</div>
            <div style={{ fontSize: '0.46rem', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Administration</div>
          </div>
        </Link>

        {/* Scroll links (home sections) */}
        <div style={{ display: 'flex', paddingRight: '0.75rem', marginRight: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {SCROLL_LINKS.map(({ label, id }) => (
            <button key={id} onClick={() => goToSection(id)} style={{
              color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none',
              padding: '0.35rem 0.65rem', borderRadius: 5,
              fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >{label}</button>
          ))}
        </div>

        {/* Page links */}
        <div style={{ display: 'flex', flex: 1 }}>
          {PAGE_LINKS.map(({ label, to }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.62)',
              background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
              padding: '0.35rem 0.65rem', borderRadius: 5,
              fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'color 0.2s, background 0.2s',
              border: 'none',
            })}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)' }}>
            {user?.first_name || user?.username}
          </span>

          <button onClick={() => { logout(); navigate('/'); }} style={{
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            padding: '0.35rem 0.75rem', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.73rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >Déconnexion</button>
        </div>
      </div>
    </nav>
  );
}
