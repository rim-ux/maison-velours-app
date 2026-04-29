import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const STATUS_COLORS = {
  en_attente:     { bg: '#fff3cd', color: '#856404' },
  en_preparation: { bg: '#d1ecf1', color: '#0c5460' },
  prete:          { bg: '#d4edda', color: '#155724' },
  livree:         { bg: '#e9ecef', color: '#495057' },
  annulee:        { bg: '#f8d7da', color: '#721c24' },
};

export default function MyOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.myOrders()
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 style={styles.title}>Mes Commandes</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commande.</p>
          <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Découvrir le menu</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => {
            const sc = STATUS_COLORS[order.status] || { bg: '#eee', color: '#333' };
            return (
              <div key={order.id} style={styles.orderCard} className="card">
                <div style={styles.orderTop}>
                  <div>
                    <h3 style={styles.orderTitle}>Commande #{order.id}</h3>
                    <p style={styles.orderMeta}>
                      {order.type_display} — {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...styles.badge, background: sc.bg, color: sc.color }}>
                      {order.status_display}
                    </span>
                    <p style={styles.orderTotal}>{parseFloat(order.total).toFixed(2)} MAD</p>
                  </div>
                </div>
                <div style={styles.orderItems}>
                  {order.items.slice(0, 3).map((i) => (
                    <span key={i.id} style={styles.itemChip}>{i.product_name} × {i.quantity}</span>
                  ))}
                  {order.items.length > 3 && (
                    <span style={styles.itemChip}>+{order.items.length - 3} autres</span>
                  )}
                </div>
                <Link to={`/suivi-commande/${order.id}`} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', margin: '0.75rem 1.5rem 1rem' }}>
                  Suivre →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--dark)' },
  orderCard: { padding: 0 },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  orderTitle: { fontFamily: 'var(--font-head)', fontSize: '1rem', marginBottom: '0.2rem' },
  orderMeta: { fontSize: '0.8rem', color: 'var(--muted)' },
  badge: { display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' },
  orderTotal: { fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.95rem' },
  orderItems: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.5rem' },
  itemChip: { background: 'var(--cream)', border: '1px solid var(--border)', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.78rem', color: 'var(--text)' },
};
