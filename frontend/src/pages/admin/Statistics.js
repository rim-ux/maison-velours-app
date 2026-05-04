import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { statsAPI } from '../../services/api';
import { printStatsPDF } from '../../utils/printPDF';

const COLORS = ['#8B1A2E', '#C9A84C', '#3498DB', '#27AE60', '#9B59B6', '#E67E22'];
const TYPE_LABELS = { sur_place: 'Sur place', emporter: 'À emporter', livraison: 'Livraison' };

export default function Statistics() {
  const [overview,    setOverview]    = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dailyRev,    setDailyRev]    = useState([]);
  const [byType,      setByType]      = useState([]);
  const [days,        setDays]        = useState(7);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      statsAPI.overview(),
      statsAPI.topProducts(8),
      statsAPI.dailyRevenue(days),
      statsAPI.ordersByType(),
    ]).then(([o, tp, dr, bt]) => {
      setOverview(o.data);
      setTopProducts(tp.data);
      setDailyRev(dr.data.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) })));
      setByType(bt.data.map((d) => ({ ...d, name: TYPE_LABELS[d.order_type] || d.order_type })));
    }).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Statistiques</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Période :</label>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              className="btn btn-sm"
              onClick={() => setDays(d)}
              style={days === d
                ? { background: 'var(--burgundy)', color: 'white', border: '2px solid var(--burgundy)' }
                : { background: 'white', border: '2px solid var(--border)' }
              }
            >
              {d} jours
            </button>
          ))}
          <button
            onClick={() => printStatsPDF({ overview, topProducts, dailyRev, byType, days })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              background: 'linear-gradient(135deg,var(--burgundy),#6B1220)',
              color: '#fff', border: 'none',
              padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Générer PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiGrid}>
        {[
          { label: 'Commandes aujourd\'hui', value: overview?.orders.today || 0, icon: '📋', color: 'var(--burgundy)' },
          { label: 'En attente',             value: overview?.orders.pending || 0, icon: '⏳', color: '#F39C12' },
          { label: 'CA aujourd\'hui',        value: `${(overview?.revenue.today || 0).toFixed(2)} MAD`, icon: '💰', color: 'var(--gold)' },
          { label: `CA ${days} jours`,       value: `${(overview?.revenue.month || 0).toFixed(2)} MAD`, icon: '📈', color: '#27AE60' },
        ].map((k) => (
          <div key={k.label} className="card" style={{ ...styles.kpiCard, borderTopColor: k.color }}>
            <span style={{ fontSize: '2rem' }}>{k.icon}</span>
            <div>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartsGrid}>
        {/* Daily revenue chart */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Chiffre d'affaires — {days} derniers jours</h3>
          {dailyRev.length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div><h3>Aucune donnée</h3></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyRev} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v.toFixed(2)} MAD`, 'CA']} />
                <Bar dataKey="revenue" fill="var(--burgundy)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by type */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Commandes par type</h3>
          {byType.length === 0 ? (
            <div className="empty-state"><div className="icon">🥧</div><h3>Aucune donnée</h3></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Commandes']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily orders line */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Nombre de commandes par jour</h3>
          {dailyRev.length === 0 ? (
            <div className="empty-state"><div className="icon">📉</div><h3>Aucune donnée</h3></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyRev} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Commandes']} />
                <Line type="monotone" dataKey="orders" stroke="var(--gold)" strokeWidth={2} dot={{ fill: 'var(--gold)' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🏆 Top produits vendus</h3>
          {topProducts.length === 0 ? (
            <div className="empty-state"><div className="icon">🍽️</div><h3>Aucune donnée</h3></div>
          ) : (
            <div style={{ padding: '0 1.5rem 1rem' }}>
              {topProducts.map((p, i) => (
                <div key={p.product__id} style={styles.topItem}>
                  <span style={styles.topRank}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.product__name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.product__category__name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.9rem' }}>{p.total_quantity} ventes</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{parseFloat(p.total_revenue || 0).toFixed(2)} MAD</div>
                  </div>
                  <div style={{ ...styles.topBar, width: `${(p.total_quantity / topProducts[0].total_quantity) * 100}%` }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title:      { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)' },
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  kpiCard:    { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '3px solid' },
  kpiValue:   { fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-head)' },
  kpiLabel:   { fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.1rem' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  chartCard:  { padding: '1.25rem 1rem 1rem' },
  chartTitle: { fontFamily: 'var(--font-head)', fontSize: '1rem', marginBottom: '1rem', padding: '0 0.5rem', color: 'var(--dark)' },
  topItem:    { position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', overflow: 'hidden' },
  topRank:    { width: 24, height: 24, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy)', flexShrink: 0 },
  topBar:     { position: 'absolute', bottom: 0, left: 0, height: 2, background: 'var(--burgundy)', opacity: 0.2, transition: 'width 0.5s' },
};
