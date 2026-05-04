import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useCart }  from '../context/CartContext';
const BANNER_H = 34;
const NAV_H    = 70;
export const CLIENT_TOP = BANNER_H + NAV_H; // 104px — used by layout consumers

const TICKER_ITEMS = [
  { icon: '🛵', text: <>Livraison gratuite à partir de <strong style={{ color: 'var(--gold)' }}>250 DH</strong></> },
  { icon: '🎟️', text: <>Code promo <strong style={{ color: '#fff' }}>maison.velours</strong> — <strong style={{ color: 'var(--gold)' }}>10% de réduction</strong></> },
];

export default function ClientNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout }  = useAuth();
  const { totalItems }    = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToSection = (id) => {
    if (location.pathname === '/accueil') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/accueil', { state: { scrollTo: id } });
    }
  };

  const NAV = [
    { label: 'Menu',          id: 'ch-menu'   },
    { label: 'Réservation',   id: 'ch-resa'   },
    { label: 'Mes commandes', id: 'ch-orders' },
  ];

  return (
    <>
      <style>{`
        @keyframes mvTrain {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mv-ticker-track {
          display: inline-flex;
          align-items: center;
          animation: mvTrain 28s linear infinite;
          white-space: nowrap;
        }
        .mv-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── Announcement banner — scrolling ticker ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 201,
        height: BANNER_H,
        background: 'linear-gradient(90deg,#6B1220 0%,var(--burgundy) 45%,#6B1220 100%)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="mv-ticker-track">
          {[0, 1].map(copy => (
            <React.Fragment key={copy}>
              {TICKER_ITEMS.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                    color: 'rgba(255,255,255,0.9)', fontSize: '0.73rem',
                    fontWeight: 600, letterSpacing: '0.04em',
                    padding: '0 2rem',
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                    {item.text}
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem',
                    padding: '0 0.5rem', userSelect: 'none',
                  }}>✦</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main navbar ── */}
      <nav style={{
        position: 'fixed', top: BANNER_H, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(8,8,16,0.97)' : 'rgba(8,8,16,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        transition: 'background 0.3s',
        padding: '0 1.5rem',
      }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: NAV_H, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* Logo */}
        <Link to="/accueil" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none', marginRight: '0.5rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg,var(--burgundy),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em', boxShadow: '0 4px 14px rgba(139,26,46,0.4)' }}>MV</div>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>Maison Velours</span>
        </Link>

        {/* Section nav */}
        <div style={{ display: 'flex', gap: '0.1rem', flex: 1 }}>
          {NAV.map(({ label, id }) => (
            <button key={id} onClick={() => goToSection(id)} style={{
              color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none',
              padding: '0.45rem 1rem', borderRadius: 6,
              fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >{label}</button>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>

          {/* Panier */}
          <Link to="/panier" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 8, background: location.pathname === '/panier' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${location.pathname === '/panier' ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`, color: location.pathname === '/panier' ? 'var(--gold)' : '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--burgundy)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, border: '2px solid rgba(8,8,16,0.97)' }}>{totalItems}</span>
            )}
          </Link>

          {/* Messagerie */}
          <Link to="/messagerie" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 8, background: location.pathname === '/messagerie' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${location.pathname === '/messagerie' ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`, color: location.pathname === '/messagerie' ? 'var(--gold)' : '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </Link>

          {/* Mes Favoris */}
          <Link to="/mes-favoris" title="Mes favoris" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 8, background: location.pathname === '/mes-favoris' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${location.pathname === '/mes-favoris' ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`, color: location.pathname === '/mes-favoris' ? 'var(--gold)' : '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
            <svg width="16" height="16" fill={location.pathname === '/mes-favoris' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </Link>

          {/* Mon Compte */}
          <Link to="/mon-compte" title="Mon compte" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 8, background: location.pathname === '/mon-compte' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${location.pathname === '/mon-compte' ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`, color: location.pathname === '/mon-compte' ? 'var(--gold)' : '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>

          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.2rem' }}>
            {user?.first_name || user?.username}
          </span>

          <button onClick={() => { logout(); navigate('/'); }} style={{
            background: 'transparent', color: 'rgba(255,255,255,0.45)',
            padding: '0.4rem 0.8rem', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >Déconnexion</button>
        </div>
      </div>
    </nav>
    </>
  );
}
