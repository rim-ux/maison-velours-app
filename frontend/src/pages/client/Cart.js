import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { items, removeItem, updateQty, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/commande');
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Votre panier est vide</h3>
          <p>Découvrez notre menu et ajoutez vos plats préférés.</p>
          <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Voir le menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 800 }}>
      <h1 style={styles.title}>🛒 Mon Panier</h1>

      <div style={styles.layout}>
        {/* Items */}
        <div style={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} style={styles.item} className="card">
              <div style={styles.itemImg}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={styles.img} />
                  : <div style={styles.imgPlaceholder}>🍽️</div>
                }
              </div>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)} MAD / unité</p>
              </div>
              <div style={styles.itemControls}>
                <div style={styles.qtyControls}>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span style={styles.qty}>{item.quantity}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <strong style={{ color: 'var(--burgundy)' }}>
                  {(item.quantity * parseFloat(item.price)).toFixed(2)} MAD
                </strong>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={styles.summary} className="card">
          <h3 style={styles.summaryTitle}>Récapitulatif</h3>
          {items.map((item) => (
            <div key={item.id} style={styles.summaryRow}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.quantity * parseFloat(item.price)).toFixed(2)} MAD</span>
            </div>
          ))}
          <div style={styles.summaryDivider} />
          <div style={styles.summaryTotal}>
            <span>Total</span>
            <span style={{ color: 'var(--burgundy)', fontWeight: 700 }}>{totalPrice.toFixed(2)} MAD</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} onClick={handleCheckout}>
            Passer la commande →
          </button>
          <Link to="/menu" style={styles.backLink}>← Continuer les achats</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '2rem', color: 'var(--dark)' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  item: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' },
  itemImg: { width: 70, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream-dk)', fontSize: '1.8rem' },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'var(--font-head)', fontSize: '0.95rem', marginBottom: '0.25rem' },
  itemPrice: { fontSize: '0.8rem', color: 'var(--muted)' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '1rem' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qty: { fontWeight: 600, minWidth: 24, textAlign: 'center' },
  summary: { padding: '1.5rem', position: 'sticky', top: 90 },
  summaryTitle: { fontFamily: 'var(--font-head)', fontSize: '1.2rem', marginBottom: '1rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted)' },
  summaryDivider: { borderTop: '1px solid var(--border)', margin: '1rem 0' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', fontWeight: 600 },
  backLink: { display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' },
};
