import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(8,8,16,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease',
        padding: '0 1.5rem',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 74,
        }}>
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))',
              borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em',
              boxShadow: '0 4px 16px rgba(139,26,46,0.4)',
            }}>MV</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                Maison Velours
              </div>
              <div style={{ fontSize: '0.56rem', color: 'var(--gold)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Restaurant Gastronomique · Casablanca
              </div>
            </div>
          </button>

          {/* Desktop auth buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} className="hide-mobile">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/accueil'}
                  style={styles.btnGold}
                >
                  {user.role === 'admin' ? 'Admin' : 'Mon espace'}
                </Link>
                <button onClick={handleLogout} style={styles.btnOutline}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.btnOutline}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}
                >
                  Login
                </Link>
                <Link to="/register" style={styles.btnGold}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.28)'; }}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            display: 'none', flexDirection: 'column', gap: 5,
            background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer',
          }} className="show-mobile-flex">
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 24, height: 2,
                background: '#fff', borderRadius: 2,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(8,8,16,0.97)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
        }} onClick={() => setMobileOpen(false)}>
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/accueil'} onClick={() => setMobileOpen(false)} style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                color: '#0A0A0F', padding: '0.8rem 2.5rem', borderRadius: 10,
                fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
              }}>
                {user.role === 'admin' ? 'Admin' : 'Mon espace'}
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.7)',
                padding: '0.75rem 2.5rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{
                background: 'transparent', color: '#fff',
                padding: '0.75rem 2.5rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center',
              }}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                color: '#0A0A0F', padding: '0.8rem 2.5rem', borderRadius: 10,
                fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center',
              }}>Inscription</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  btnGold: {
    background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
    color: '#0A0A0F',
    padding: '0.52rem 1.35rem', borderRadius: 8, border: 'none',
    fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 16px rgba(201,168,76,0.28)',
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  btnOutline: {
    background: 'transparent', color: 'rgba(255,255,255,0.82)',
    padding: '0.52rem 1.2rem', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.22)',
    fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.04em',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
    transition: 'border-color 0.2s, color 0.2s',
  },
};
