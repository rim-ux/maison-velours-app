import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',            icon: '📊', label: 'Tableau de bord', end: true },
  { to: '/admin/commandes',  icon: '📋', label: 'Commandes' },
  { to: '/admin/menu',       icon: '🍽️', label: 'Menu' },
  { to: '/admin/tables',     icon: '🪑', label: 'Tables' },
  { to: '/admin/livraison',  icon: '🛵', label: 'Zones de livraison' },
  { to: '/admin/paiements',  icon: '💳', label: 'Paiements' },
  { to: '/admin/stats',      icon: '📈', label: 'Statistiques' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.header}>
        <span style={styles.logoIcon}>🍷</span>
        <div>
          <div style={styles.logoName}>Maison Velours</div>
          <div style={styles.logoRole}>Administration</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>👤</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--white)' }}>
              {user?.first_name || user?.username}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Administrateur</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Déconnexion</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 250, minHeight: '100vh',
    background: 'var(--dark)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 50,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logoIcon: { fontSize: '1.8rem' },
  logoName: { fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--white)', fontWeight: 700 },
  logoRole: { fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  nav: { flex: 1, padding: '1rem 0', overflowY: 'auto' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.875rem', fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    color: 'var(--white)',
    background: 'rgba(201,168,76,0.15)',
    borderLeftColor: 'var(--gold)',
  },
  navIcon: { fontSize: '1.1rem', width: 22, textAlign: 'center' },
  userSection: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'var(--burgundy)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem',
  },
  logoutBtn: {
    width: '100%', padding: '0.6rem',
    background: 'rgba(231,76,60,0.15)',
    border: '1px solid rgba(231,76,60,0.3)',
    color: '#e74c3c',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.82rem', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition)',
    textAlign: 'center',
  },
};
