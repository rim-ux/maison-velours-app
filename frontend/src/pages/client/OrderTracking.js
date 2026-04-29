import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const STATUS_STEPS = [
  { key: 'en_attente',     label: 'Commande reçue',      icon: '✅' },
  { key: 'en_preparation', label: 'En préparation',      icon: '👨‍🍳' },
  { key: 'prete',          label: 'Prête',               icon: '🔔' },
  { key: 'livree',         label: 'Livrée / Servie',     icon: '🎉' },
];

const STATUS_COLORS = {
  en_attente:     '#F39C12',
  en_preparation: '#3498DB',
  prete:          '#27AE60',
  livree:         '#8B1A2E',
  annulee:        '#E74C3C',
};

export default function OrderTracking() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let interval;
    const fetchOrder = () => {
      ordersAPI.get(id)
        .then(({ data }) => setOrder(data))
        .catch(() => setError('Commande introuvable.'))
        .finally(() => setLoading(false));
    };
    fetchOrder();
    interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (error)   return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}><p style={{ color: 'var(--danger)' }}>{error}</p><Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>Retour au menu</Link></div>;

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'annulee';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 700 }}>
      <h1 style={styles.title}>Suivi de commande #{order.id}</h1>

      {/* Status bar */}
      {isCancelled ? (
        <div className="alert alert-error" style={{ fontSize: '1rem', textAlign: 'center' }}>
          ❌ Cette commande a été annulée.
        </div>
      ) : (
        <div style={styles.steps}>
          {STATUS_STEPS.map((step, idx) => {
            const done    = idx <= currentIdx;
            const current = idx === currentIdx;
            return (
              <React.Fragment key={step.key}>
                <div style={styles.step}>
                  <div style={{
                    ...styles.stepCircle,
                    background: done ? 'var(--burgundy)' : 'var(--border)',
                    transform: current ? 'scale(1.15)' : 'none',
                    boxShadow: current ? '0 0 0 4px rgba(139,26,46,0.2)' : 'none',
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: done ? 'var(--burgundy)' : 'var(--muted)', fontWeight: done ? 600 : 400, textAlign: 'center' }}>
                    {step.label}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div style={{ ...styles.connector, background: idx < currentIdx ? 'var(--burgundy)' : 'var(--border)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Order details */}
      <div style={styles.card} className="card">
        <div style={styles.cardHeader}>
          <div>
            <span style={{ ...styles.statusBadge, background: STATUS_COLORS[order.status] || '#888' }}>
              {order.status_display}
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {new Date(order.created_at).toLocaleString('fr-FR')}
          </span>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Type</span>
            <span style={styles.infoValue}>{order.type_display}</span>
          </div>
          {order.table_number && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Table</span>
              <span style={styles.infoValue}>N° {order.table_number}</span>
            </div>
          )}
          {order.zone_name && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Zone</span>
              <span style={styles.infoValue}>{order.zone_name}</span>
            </div>
          )}
          {order.delivery_address && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Adresse</span>
              <span style={styles.infoValue}>{order.delivery_address}</span>
            </div>
          )}
        </div>

        <h4 style={styles.itemsTitle}>Détail de la commande</h4>
        {order.items.map((item) => (
          <div key={item.id} style={styles.orderItem}>
            <span>{item.product_name} × {item.quantity}</span>
            <span>{parseFloat(item.subtotal).toFixed(2)} MAD</span>
          </div>
        ))}
        <div style={styles.total}>
          <strong>Total</strong>
          <strong style={{ color: 'var(--burgundy)' }}>{parseFloat(order.total).toFixed(2)} MAD</strong>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/mes-commandes" className="btn btn-outline">Mes commandes</Link>
        <Link to="/menu" className="btn btn-primary">Nouveau menu</Link>
      </div>
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-head)', fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--dark)' },
  steps: {
    display: 'flex', alignItems: 'flex-start', marginBottom: '2rem',
    background: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 },
  stepCircle: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', color: 'var(--white)',
    transition: 'all 0.3s',
  },
  connector: { flex: 1, height: 3, alignSelf: 'center', borderRadius: 2, marginBottom: 22, transition: 'background 0.3s' },
  card: { overflow: 'visible' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' },
  statusBadge: { color: 'var(--white)', padding: '0.3rem 0.9rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  infoLabel: { fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoValue: { fontWeight: 600, fontSize: '0.9rem' },
  itemsTitle: { padding: '1rem 1.5rem 0.5rem', fontFamily: 'var(--font-head)', fontSize: '1rem' },
  orderItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderBottom: '1px solid var(--border)' },
  total: { display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', fontWeight: 700 },
};
