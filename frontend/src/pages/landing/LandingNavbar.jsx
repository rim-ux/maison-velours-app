import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
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

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              color: '#fff',
              padding: '0.52rem 1.25rem', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.03em',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          >
            Connexion
          </button>

          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
              color: '#0A0A0F',
              padding: '0.55rem 1.4rem', borderRadius: 8, border: 'none',
              fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 16px rgba(201,168,76,0.28)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.28)'; }}
          >
            Inscription
          </button>
        </div>
      </div>
    </nav>
  );
}
