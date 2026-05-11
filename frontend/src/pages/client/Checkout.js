import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, tablesAPI, deliveryAPI, paymentsAPI } from '../../services/api';
import api from '../../services/api';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Utilisation de la clé configurée dans ton fichier .env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '').catch(() => null);

const ORDER_TYPES = [
  { value: 'sur_place', label: 'Sur place', icon: '🪑', desc: 'Dîner confortablement dans notre restaurant' },
  { value: 'emporter', label: 'À emporter', icon: '🥡', desc: 'Récupérez votre commande au comptoir' },
  { value: 'livraison', label: 'Livraison', icon: '🛵', desc: 'Livré directement chez vous' },
];

const PAYMENT_METHODS = [
  { value: 'especes', label: 'Espèces', icon: '💵' },
  { value: 'carte', label: 'Carte en main', icon: '💳' },
  { value: 'en_ligne', label: 'Payer en ligne', icon: '🔒', badge: 'Stripe' },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#2C2C2C',
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#E74C3C', iconColor: '#E74C3C' },
  },
};

function CheckoutInner() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [orderType, setOrderType] = useState('sur_place');
  const [table, setTable] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [payMethod, setPayMethod] = useState('especes');
  const [tables, setTables] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoInput, setPromoInput]   = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError]   = useState('');

  useEffect(() => {
    tablesAPI.list({ status: 'libre' }).then(({ data }) => setTables(data.results || data));
    deliveryAPI.getZones().then(({ data }) => setZones(data.results || data));
  }, []);

  if (items.length === 0) { navigate('/panier'); return null; }

  const freeDelivery = orderType === 'livraison' && totalPrice >= 250;
  const deliveryFee = orderType === 'livraison' && zone && !freeDelivery
    ? parseFloat(zones.find(z => z.id === parseInt(zone))?.delivery_fee || 0)
    : 0;
  const discount    = promoApplied ? (totalPrice + deliveryFee) * 0.10 : 0;
  const grandTotal  = totalPrice + deliveryFee - discount;

  const applyPromo = () => {
    if (promoInput.trim().toLowerCase() === 'maison.velours') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('Code promo invalide.');
    }
  };

  const buildOrderPayload = () => {
    const payload = {
      order_type: orderType,
      notes,
      items: items.map(i => ({ product: i.id, quantity: i.quantity })),
    };
    if (orderType === 'sur_place') payload.table = parseInt(table);
    if (orderType === 'livraison') {
      payload.delivery_zone = parseInt(zone);
      payload.delivery_address = address;
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (payMethod === 'en_ligne') {
        if (!stripe || !elements) {
          setError("Stripe.js n'a pas pu se charger. Vérifiez votre connexion internet et désactivez les bloqueurs de pub, puis rechargez la page.");
          setLoading(false);
          return;
        }

        const { data: intentData } = await api.post('/payments/create-intent/', {
          amount: grandTotal,
        }, { timeout: 15000 });

        const cardElement = elements.getElement(CardElement);
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
                email: user.email,
              },
            },
          }
        );

        if (stripeError) {
          setError(stripeError.message);
          setLoading(false);
          return;
        }

        const { data: order } = await ordersAPI.create(buildOrderPayload());
        await paymentsAPI.create({
          order: order.id,
          method: 'en_ligne',
          amount: grandTotal,
          transaction_ref: paymentIntent.id,
        });

        clearCart();
        navigate(`/suivi-commande/${order.id}`);

      } else {
        const { data: order } = await ordersAPI.create(buildOrderPayload());
        await paymentsAPI.create({ order: order.id, method: payMethod, amount: grandTotal });
        clearCart();
        navigate(`/suivi-commande/${order.id}`);
      }

    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'string'
        ? data
        : data?.error || data?.detail
          || (data?.non_field_errors?.[0])
          || (data && JSON.stringify(data))
          || err.message
          || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isStripe = payMethod === 'en_ligne';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 880 }}>
      <h1 style={styles.title}>Passer la commande</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={styles.layout}>
        <div>
          {/* Type de commande */}
          <div style={styles.section} className="card">
            <h3 style={styles.sectionTitle}>Type de commande</h3>
            <div style={styles.typeGrid}>
              {ORDER_TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setOrderType(t.value)}
                  style={{ ...styles.typeCard, ...(orderType === t.value ? styles.typeCardActive : {}) }}
                >
                  <span style={styles.typeIcon}>{t.icon}</span>
                  <strong>{t.label}</strong>
                  <small style={{ color: 'var(--muted)' }}>{t.desc}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {orderType === 'sur_place' && (
            <div style={styles.section} className="card">
              <h3 style={styles.sectionTitle}>Choisir une table</h3>
              <select className="form-control" value={table} onChange={e => setTable(e.target.value)} required>
                <option value="">— Sélectionner une table —</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>Table {t.number} ({t.capacity} personnes)</option>
                ))}
              </select>
            </div>
          )}

          {/* Livraison */}
          {orderType === 'livraison' && (
            <div style={styles.section} className="card">
              <h3 style={styles.sectionTitle}>Livraison</h3>

              {/* ETA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(52,152,219,0.07)', border: '1px solid rgba(52,152,219,0.25)', borderRadius: 8, padding: '0.55rem 0.9rem', marginBottom: '0.85rem' }}>
                <span>⏱</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2980B9' }}>Livraison estimée : 25–35 min</span>
              </div>

              {freeDelivery && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)',
                  borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '1rem',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>🎉</span>
                  <div>
                    <strong style={{ color: '#27AE60', fontSize: '0.85rem' }}>Livraison offerte !</strong>
                    <p style={{ fontSize: '0.75rem', color: '#27AE60', margin: 0, opacity: 0.85 }}>
                      Votre commande dépasse 250 DH — la livraison est gratuite.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Zone de livraison</label>
                <select className="form-control" value={zone} onChange={e => setZone(e.target.value)} required>
                  <option value="">— Sélectionner une zone —</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}{freeDelivery ? ' (offerte)' : ` (+${z.delivery_fee} MAD)`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Adresse de livraison</label>
                <textarea className="form-control" rows={3} value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Numéro, rue, quartier, ville…" required />
              </div>
            </div>
          )}

          {/* Mode de paiement */}
          <div style={styles.section} className="card">
            <h3 style={styles.sectionTitle}>Mode de paiement</h3>
            <div style={styles.payGrid}>
              {PAYMENT_METHODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setPayMethod(m.value)}
                  style={{ ...styles.payCard, ...(payMethod === m.value ? styles.payCardActive : {}) }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{m.label}</span>
                  {m.badge && (
                    <span style={styles.stripeBadge}>{m.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {isStripe && (
              <div style={{ ...styles.stripeBox, overflow: 'visible' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="5" fill="#635BFF" />
                      <path d="M11.5 8.5c0-.83.67-1.5 1.5-1.5.55 0 1.04.3 1.31.74L16 6.5C15.38 5.6 14.28 5 13 5c-1.93 0-3.5 1.57-3.5 3.5v.5H8v2h1.5V17h2v-6H14l.5-2h-3V8.5z" fill="white"/>
                    </svg>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#635BFF' }}>
                      Paiement sécurisé par Stripe
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['Visa', 'Mastercard', 'Amex'].map(b => (
                      <span key={b} style={styles.cardBrand}>{b}</span>
                    ))}
                  </div>
                </div>

                {/* Card field — overflow:visible on parent avoids clipping the Stripe iframe */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Numéro de carte
                  </label>
                  <div style={{
                    ...styles.cardElementWrap,
                    opacity: !stripe ? 0.55 : 1,
                    pointerEvents: !stripe ? 'none' : 'auto',
                  }}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  {!stripe && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                      ⏳ Chargement du système de paiement…
                    </p>
                  )}
                </div>

                {/* Security notice */}
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
                  🔒 Vos données sont chiffrées et transmises directement à Stripe. Nous ne stockons jamais vos informations bancaires.
                </p>

                {/* Test card hint (dev mode) */}
                <div style={{
                  background: 'rgba(99,91,255,0.05)',
                  border: '1px dashed rgba(99,91,255,0.25)',
                  borderRadius: 8, padding: '0.65rem 0.9rem',
                  fontSize: '0.75rem', color: 'rgba(0,0,0,0.55)',
                  display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                }}>
                  <span>🧪</span>
                  <div>
                    <strong style={{ color: '#635BFF' }}>Mode test :</strong>{' '}
                    carte <code style={{ fontFamily: 'monospace', background: 'rgba(99,91,255,0.08)', padding: '0 3px', borderRadius: 3 }}>4242 4242 4242 4242</code>
                    {' '}· date future · CVC quelconque
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Récapitulatif */}
        <div style={styles.summary} className="card">
          <h3 style={styles.sectionTitle}>Récapitulatif</h3>
          {items.map(i => (
            <div key={i.id} style={styles.summaryRow}>
              <span>{i.name} × {i.quantity}</span>
              <span>{(i.quantity * parseFloat(i.price)).toFixed(2)} MAD</span>
            </div>
          ))}
          {orderType === 'livraison' && freeDelivery && (
            <div style={{ ...styles.summaryRow, color: '#27AE60', fontWeight: 600 }}>
              <span>🎉 Livraison offerte</span>
              <span>0,00 MAD</span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div style={styles.summaryRow}>
              <span style={{ color: 'var(--muted)' }}>Frais de livraison</span>
              <span>+{deliveryFee.toFixed(2)} MAD</span>
            </div>
          )}

          {/* Code promo */}
          <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            {!promoApplied ? (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  placeholder="Code promo"
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem',
                    border: `1px solid ${promoError ? '#E74C3C' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  style={{
                    padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--dark)', color: '#fff', border: 'none',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                  }}
                >Appliquer</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#27AE60', fontWeight: 600 }}>🎟️ maison.velours — 10% appliqué</span>
                <button type="button" onClick={() => { setPromoApplied(false); setPromoInput(''); }} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
            )}
            {promoError && <p style={{ fontSize: '0.72rem', color: '#E74C3C', marginTop: '0.3rem' }}>{promoError}</p>}
          </div>

          <div style={styles.divider} />
          {promoApplied && (
            <div style={{ ...styles.summaryRow, color: '#27AE60', fontWeight: 600 }}>
              <span>Réduction (10%)</span>
              <span>−{discount.toFixed(2)} MAD</span>
            </div>
          )}
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '1.05rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--burgundy)' }}>{grandTotal.toFixed(2)} MAD</span>
          </div>

          {isStripe && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="#635BFF" />
                <path d="M11.5 8.5c0-.83.67-1.5 1.5-1.5.55 0 1.04.3 1.31.74L16 6.5C15.38 5.6 14.28 5 13 5c-1.93 0-3.5 1.57-3.5 3.5v.5H8v2h1.5V17h2v-6H14l.5-2h-3V8.5z" fill="white"/>
              </svg>
              <span style={{ fontSize: '0.72rem', color: '#635BFF', fontWeight: 600 }}>Paiement chiffré Stripe</span>
            </div>
          )}
          <button type="submit" disabled={loading || (isStripe && !stripe)}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%', marginTop: isStripe ? 0 : '1.25rem',
              background: isStripe ? 'linear-gradient(135deg, #635BFF, #4F46E5)' : undefined,
              boxShadow: isStripe ? '0 6px 24px rgba(99,91,255,0.4)' : undefined,
              opacity: (loading || (isStripe && !stripe)) ? 0.7 : 1,
              cursor: (loading || (isStripe && !stripe)) ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Traitement en cours…
              </span>
            ) : isStripe
              ? '🔒 Payer maintenant'
              : '✓ Confirmer la commande'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--dark)' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' },
  section: { padding: '1.5rem', marginBottom: '1.25rem' },
  sectionTitle: { fontFamily: 'var(--font-head)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--dark)' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' },
  typeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
    padding: '1rem 0.5rem',
    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--white)', cursor: 'pointer', transition: 'var(--transition)',
    textAlign: 'center',
  },
  typeCardActive: { borderColor: 'var(--burgundy)', background: 'rgba(139,26,46,0.05)' },
  typeIcon: { fontSize: '1.8rem' },
  payGrid: { display: 'flex', gap: '0.75rem' },
  payCard: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
    padding: '0.85rem',
    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--white)', cursor: 'pointer', transition: 'var(--transition)',
  },
  payCardActive: { borderColor: '#635BFF', background: 'rgba(99,91,255,0.06)' },
  stripeBadge: {
    fontSize: '0.6rem', background: '#635BFF', color: '#fff',
    borderRadius: 4, padding: '0.12rem 0.45rem', fontWeight: 700,
  },
  stripeBox: {
    marginTop: '1.25rem',
    padding: '1.25rem',
    border: '1.5px solid rgba(99,91,255,0.25)',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(99,91,255,0.03)',
  },
  cardElementWrap: {
    padding: '0.85rem 1rem',
    border: '1.5px solid #e0d5e0',
    borderRadius: 8,
    background: '#fff',
  },
  cardBrand: {
    fontSize: '0.68rem', fontWeight: 600,
    border: '1px solid #e0d5e0', borderRadius: 4,
    padding: '0.15rem 0.5rem', color: 'var(--muted)',
  },
  summary: { padding: '1.5rem', position: 'sticky', top: 90 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.6rem', color: 'var(--text)' },
  divider: { borderTop: '1px solid var(--border)', margin: '0.75rem 0' },
};