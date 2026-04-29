import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, ordersAPI } from '../../services/api';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...styles.statCard, borderTopColor: color }} className="card">
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        {sub && <div style={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.overview(), ordersAPI.list({ status: 'en_attente' })])
      .then(([s, o]) => {
        setStats(s.data);
        setOrders((o.data.results || o.data).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de bord</h1>
          <p style={styles.subtitle}>Bienvenue — voici un aperçu de votre activité</p>
        </div>
        <Link to="/admin/commandes" className="btn btn-primary">Voir les commandes →</Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard icon="📋" label="Commandes aujourd'hui" value={stats?.orders.today || 0} sub={`${stats?.orders.pending || 0} en attente`} color="var(--burgundy)" />
        <StatCard icon="💰" label="CA du jour" value={`${(stats?.revenue.today || 0).toFixed(2)} MAD`} sub={`${(stats?.revenue.month || 0).toFixed(2)} MAD ce mois`} color="var(--gold)" />
        <StatCard icon="📦" label="Total commandes" value={stats?.orders.total || 0} sub="Depuis l'ouverture" color="#3498DB" />
        <StatCard icon="💎" label="CA total" value={`${(stats?.revenue.total || 0).toFixed(2)} MAD`} sub="Toutes périodes" color="var(--success)" />
      </div>

      {/* Recent orders */}
      <div style={{ marginTop: '2rem' }} className="card">
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Commandes récentes en attente</h3>
          <Link to="/admin/commandes" style={{ fontSize: '0.85rem', color: 'var(--burgundy)' }}>Voir tout →</Link>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✅</div>
            <h3>Aucune commande en attente</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Heure</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.user_name || '—'}</td>
                    <td>{o.type_display}</td>
                    <td style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{parseFloat(o.total).toFixed(2)} MAD</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <Link to="/admin/commandes" className="btn btn-outline btn-sm">Gérer</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={styles.quickLinks}>
        {[
          { to: '/admin/menu',      icon: '🍽️', label: 'Gérer le menu' },
          { to: '/admin/tables',    icon: '🪑', label: 'Gérer les tables' },
          { to: '/admin/livraison', icon: '🛵', label: 'Zones de livraison' },
          { to: '/admin/stats',     icon: '📈', label: 'Statistiques' },
        ].map((l) => (
          <Link key={l.to} to={l.to} style={styles.quickCard} className="card">
            <span style={{ fontSize: '2rem' }}>{l.icon}</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)' },
  subtitle: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '3px solid var(--burgundy)' },
  statIcon: { fontSize: '2rem' },
  statValue: { fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-head)', lineHeight: 1.2 },
  statLabel: { fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 },
  statSub: { fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' },
  tableTitle: { fontFamily: 'var(--font-head)', fontSize: '1.1rem' },
  quickLinks: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' },
  quickCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem', textDecoration: 'none', color: 'var(--text)', transition: 'var(--transition)', cursor: 'pointer' },
};
