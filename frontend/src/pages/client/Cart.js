import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart }  from '../../context/CartContext';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { menuAPI }  from '../../services/api';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=70&auto=format&fit=crop';

export default function Cart() {
  const { items, removeItem, updateQty, totalPrice, addItem } = useCart();
  const { user }   = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const [recs, setRecs]               = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [addedRecId, setAddedRecId]   = useState(null);
  // Map id → image_url fraîche depuis l'API (remplace les URLs vides/base64 du localStorage)
  const [freshImages, setFreshImages] = useState({});

  useEffect(() => {
    menuAPI.getProducts()
      .then(({ data }) => {
        const map = {};
        (data.results || data).forEach(p => { if (p.image_url) map[p.id] = p.image_url; });
        setFreshImages(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) { setRecs([]); return; }
    setRecsLoading(true);
    menuAPI.recommendations(items.map(i => i.id))
      .then(({ data }) => setRecs(data.results || data))
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [items.length]);

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/commande');
  };

  const handleAddRec = (product) => {
    addItem(product);
    setAddedRecId(product.id);
    setTimeout(() => setAddedRecId(null), 1400);
    toast.push(`${product.name} ajouté au panier`, { icon: '✓' });
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Votre panier est vide</h3>
          <p>Découvrez notre menu et ajoutez vos plats préférés.</p>
          <Link to="/accueil" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Voir le menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 860 }}>
      <h1 style={s.title}>🛒 Mon Panier</h1>

      <div style={s.layout}>
        {/* Items */}
        <div style={s.itemsList}>
          {items.map((item) => (
            <div key={item.id} style={s.item} className="card">
              <div style={s.itemImg}>
                <img
                  src={freshImages[item.id] || item.image_url || PLACEHOLDER}
                  alt={item.name}
                  style={s.img}
                  onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </div>
              <div style={s.itemInfo}>
                <h3 style={s.itemName}>{item.name}</h3>
                <p style={s.itemPrice}>{parseFloat(item.price).toFixed(2)} MAD / unité</p>
              </div>
              <div style={s.itemControls}>
                <div style={s.qtyControls}>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span style={s.qty}>{item.quantity}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <strong style={{ color: 'var(--burgundy)' }}>
                  {(item.quantity * parseFloat(item.price)).toFixed(2)} MAD
                </strong>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>🗑️</button>
              </div>
            </div>
          ))}

          {/* ── Tu pourrais aussi aimer ── */}
          {recs.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  ✨ Tu pourrais aussi aimer
                </span>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.85rem' }}>
                {recs.map(p => {
                  const isAdded = addedRecId === p.id;
                  return (
                    <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <img
                        src={p.image_url || PLACEHOLDER}
                        alt={p.name}
                        style={{ width: '100%', height: 100, objectFit: 'cover' }}
                        onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                      />
                      <div style={{ padding: '0.7rem' }}>
                        <p style={{ fontFamily: 'var(--font-head)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.2rem', lineHeight: 1.3 }}>{p.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.82rem' }}>{parseFloat(p.price).toFixed(0)} MAD</span>
                          <button onClick={() => handleAddRec(p)} style={{ background: isAdded ? 'rgba(39,174,96,0.12)' : 'var(--burgundy)', color: isAdded ? '#27AE60' : '#fff', border: isAdded ? '1px solid rgba(39,174,96,0.4)' : 'none', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
                            {isAdded ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={s.summary} className="card">
          <h3 style={s.summaryTitle}>Récapitulatif</h3>
          {items.map((item) => (
            <div key={item.id} style={s.summaryRow}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.quantity * parseFloat(item.price)).toFixed(2)} MAD</span>
            </div>
          ))}
          <div style={s.summaryDivider} />

          {/* Free delivery indicator */}
          {totalPrice >= 250 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
              <span style={{ fontSize: '0.8rem' }}>🎉</span>
              <span style={{ fontSize: '0.75rem', color: '#27AE60', fontWeight: 600 }}>Livraison gratuite débloquée !</span>
            </div>
          )}
          {totalPrice < 250 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                <span>🛵 Livraison gratuite dès 250 MAD</span>
                <span style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{(250 - totalPrice).toFixed(0)} MAD restants</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min((totalPrice / 250) * 100, 100)}%`, background: 'var(--burgundy)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <div style={s.summaryTotal}>
            <span>Total</span>
            <span style={{ color: 'var(--burgundy)', fontWeight: 700 }}>{totalPrice.toFixed(2)} MAD</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} onClick={handleCheckout}>
            Passer la commande →
          </button>
          <Link to="/accueil" style={s.backLink}>← Continuer les achats</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  title:        { fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '2rem', color: 'var(--dark)' },
  layout:       { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' },
  itemsList:    { display: 'flex', flexDirection: 'column', gap: '1rem' },
  item:         { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' },
  itemImg:      { width: 70, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0 },
  img:          { width: '100%', height: '100%', objectFit: 'cover' },
itemInfo:     { flex: 1 },
  itemName:     { fontFamily: 'var(--font-head)', fontSize: '0.95rem', marginBottom: '0.25rem' },
  itemPrice:    { fontSize: '0.8rem', color: 'var(--muted)' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '1rem' },
  qtyControls:  { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qty:          { fontWeight: 600, minWidth: 24, textAlign: 'center' },
  summary:      { padding: '1.5rem', position: 'sticky', top: 90 },
  summaryTitle: { fontFamily: 'var(--font-head)', fontSize: '1.2rem', marginBottom: '1rem' },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted)' },
  summaryDivider: { borderTop: '1px solid var(--border)', margin: '1rem 0' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', fontWeight: 600 },
  backLink:     { display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' },
};
