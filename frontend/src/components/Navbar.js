import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsAPI } from '../services/api';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  // Poll notifications every 30s
  const fetchUnread = useCallback(() => {
    if (!user || isAdmin) return;
    notificationsAPI.unreadCount()
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});
  }, [user, isAdmin]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoBadge}>MV</div>
          <div>
            <div style={styles.logoName}>Maison Velours</div>
            <div style={styles.logoSub}>Restaurant Gastronomique</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links} className="hide-mobile">
          {user && !isAdmin && (
            <>
              <Link to="/mes-commandes" style={{ ...styles.link, ...(isActive('/mes-commandes') ? styles.linkActive : {}) }}>
                Mes commandes
              </Link>
              <Link to="/mes-reservations" style={{ ...styles.link, ...(isActive('/mes-reservations') ? styles.linkActive : {}) }}>
                Réservations
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ ...styles.link, color: 'var(--gold)' }}>
              Administration
            </Link>
          )}
        </div>

        {/* Right */}
        <div style={styles.right}>
          {user ? (
            <>
              {!isAdmin && (
                <>
                  {/* Notification bell */}
                  <Link to="/messagerie" style={{ ...styles.iconBtn, position: 'relative' }}
                    title="Messagerie & Notifications">
                    <svg width="22" height="22" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -5, right: -6,
                        background: 'var(--burgundy)', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 800,
                        width: 18, height: 18, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid rgba(17,17,17,0.9)',
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link to="/panier" style={{ ...styles.iconBtn, position: 'relative' }}>
                    <svg width="22" height="22" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
                  </Link>
                </>
              )}

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={styles.userBtn}>
                  <div style={styles.userAvatar}>
                    {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {user.first_name || user.username}
                  </span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div style={styles.dropdownBackdrop} onClick={() => setMenuOpen(false)} />
                    <div style={styles.dropdown} className="animate-scaleIn">
                      <div style={styles.dropdownHeader}>
                        <strong style={{ fontSize: '0.9rem' }}>{user.first_name} {user.last_name}</strong>
                        <small style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{user.email}</small>
                        <span style={styles.roleBadge}>{user.role === 'admin' ? 'Administrateur' : 'Client'}</span>
                      </div>
                      {!isAdmin && (
                        <>
                          <Link to="/messagerie" onClick={() => setMenuOpen(false)} style={styles.dropdownLink}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            Messagerie {unreadCount > 0 && <span style={{ background: 'var(--burgundy)', color: '#fff', borderRadius: 50, padding: '0 5px', fontSize: '0.7rem' }}>{unreadCount}</span>}
                          </Link>
                          <Link to="/mes-reservations" onClick={() => setMenuOpen(false)} style={styles.dropdownLink}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Mes réservations
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} style={styles.dropdownItem}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-outline-white btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-gold btn-sm">S'inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(17,17,17,0.75)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'background 0.3s, box-shadow 0.3s',
  },
  navScrolled: {
    background: 'rgba(17,17,17,0.97)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
    display: 'flex', alignItems: 'center', gap: '2rem', height: 68,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' },
  logoBadge: {
    width: 38, height: 38,
    background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', flexShrink: 0,
  },
  logoName: { fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 },
  logoSub:  { fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' },
  links:    { display: 'flex', gap: '0.25rem', flex: 1 },
  link: {
    color: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 500,
    transition: 'color 0.2s, background 0.2s', textDecoration: 'none',
  },
  linkActive: { color: '#fff', background: 'rgba(255,255,255,0.08)' },
  right:    { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' },
  iconBtn:  { display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', padding: '0.3rem', transition: 'opacity 0.2s' },
  cartBadge: {
    position: 'absolute', top: -7, right: -9,
    background: 'var(--burgundy)', color: '#fff',
    fontSize: '0.62rem', fontWeight: 800,
    width: 18, height: 18, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid rgba(17,17,17,0.9)',
  },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    color: '#fff', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '0.45rem 0.9rem 0.45rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.2s',
  },
  userAvatar: {
    width: 28, height: 28, background: 'var(--burgundy)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 700, color: '#fff',
  },
  dropdownBackdrop: { position: 'fixed', inset: 0, zIndex: 50 },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    background: '#fff', borderRadius: 'var(--radius)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    minWidth: 220, overflow: 'hidden', zIndex: 51,
    transformOrigin: 'top right',
  },
  dropdownHeader: {
    padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
  },
  roleBadge: {
    display: 'inline-block', marginTop: '0.25rem',
    padding: '0.2rem 0.6rem',
    background: 'rgba(139,26,46,0.08)', color: 'var(--burgundy)',
    borderRadius: 50, fontSize: '0.68rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em', width: 'fit-content',
  },
  dropdownLink: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', padding: '0.85rem 1.2rem',
    background: 'none', borderBottom: '1px solid rgba(0,0,0,0.04)',
    cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text)',
    fontFamily: 'var(--font-body)', transition: 'background 0.2s',
    textDecoration: 'none',
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', padding: '0.85rem 1.2rem',
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)',
    fontFamily: 'var(--font-body)', transition: 'background 0.2s', textAlign: 'left',
  },
};
