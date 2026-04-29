import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, tablesAPI, deliveryAPI, paymentsAPI } from '../../services/api';

const ORDER_TYPES = [
  { value: 'sur_place', label: 'Sur place', icon: '🪑', desc: 'Dîner confortablement dans notre restaurant' },
  { value: 'emporter',  label: 'À emporter', icon: '🥡', desc: 'Récupérez votre commande au comptoir' },
  { value: 'livraison', label: 'Livraison', icon: '🛵', desc: 'Livré directement chez vous' },
];

const PAYMENT_METHODS = [
  { value: 'especes', label: 'Espèces', icon: '💵' },
  { value: 'carte',   label: 'Carte bancaire', icon: '💳' },
  { value: 'en_ligne', label: 'En ligne', icon: '🌐' },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType,     setOrderType]     = useState('sur_place');
  const [table,         setTable]         = useState('');
  const [zone,          setZone]          = useState('');
  const [address,       setAddress]       = useState(user?.address || '');
  const [notes,         setNotes]         = useState('');
  const [payMethod,     setPayMethod]     = useState('especes');
  const [tables,        setTables]        = useState([]);
  const [zones,         setZones]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    tablesAPI.list({ status: 'libre' }).then(({ data }) => setTables(data.results || data));
    deliveryAPI.getZones().then(({ data }) => setZones(data.results || data));
  }, []);

  if (items.length === 0) { navigate('/panier'); return null; }

  const deliveryFee = orderType === 'livraison' && zone
    ? parseFloat(zones.find((z) => z.id === parseInt(zone))?.delivery_fee || 0)
    : 0;
  const grandTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        order_type: orderType,
        notes,
        items: items.map((i) => ({ product: i.id, quantity: i.quantity })),
      };
      if (orderType === 'sur_place') payload.table = parseInt(table);
      if (orderType === 'livraison') { payload.delivery_zone = parseInt(zone); payload.delivery_address = address; }

      const { data: order } = await ordersAPI.create(payload);

      await paymentsAPI.create({ order: order.id, method: payMethod, amount: grandTotal });

      clearCart();
      navigate(`/suivi-commande/${order.id}`);
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 880 }}>
      <h1 style={styles.title}>Passer la commande</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={styles.layout}>
        <div>
          {/* Order type */}
          <div style={styles.section} className="card">
            <h3 style={styles.sectionTitle}>Type de commande</h3>
            <div style={styles.typeGrid}>
              {ORDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
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

          {/* Conditional fields */}
          {orderType === 'sur_place' && (
            <div style={styles.section} className="card">
              <h3 style={styles.sectionTitle}>Choisir une table</h3>
              <select className="form-control" value={table} onChange={(e) => setTable(e.target.value)} required>
                <option value="">— Sélectionner une table —</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>Table {t.number} ({t.capacity} personnes)</option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'livraison' && (
            <div style={styles.section} className="card">
              <h3 style={styles.sectionTitle}>Livraison</h3>
              <div className="form-group">
                <label>Zone de livraison</label>
                <select className="form-control" value={zone} onChange={(e) => setZone(e.target.value)} required>
                  <option value="">— Sélectionner une zone —</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} (+{z.delivery_fee} MAD)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Adresse de livraison</label>
                <textarea className="form-control" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Numéro, rue, quartier, ville…" required />
              </div>
            </div>
          )}

          {/* Notes */}
          <div style={styles.section} className="card">
            <h3 style={styles.sectionTitle}>Notes (optionnel)</h3>
            <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, préférences, instructions particulières…" />
          </div>

          {/* Payment method */}
          <div style={styles.section} className="card">
            <h3 style={styles.sectionTitle}>Mode de paiement</h3>
            <div style={styles.payGrid}>
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPayMethod(m.value)}
                  style={{ ...styles.payCard, ...(payMethod === m.value ? styles.payCardActive : {}) }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={styles.summary} className="card">
          <h3 style={styles.sectionTitle}>Récapitulatif</h3>
          {items.map((i) => (
            <div key={i.id} style={styles.summaryRow}>
              <span>{i.name} × {i.quantity}</span>
              <span>{(i.quantity * parseFloat(i.price)).toFixed(2)} MAD</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.summaryRow}>
            <span>Sous-total</span>
            <span>{totalPrice.toFixed(2)} MAD</span>
          </div>
          {deliveryFee > 0 && (
            <div style={styles.summaryRow}>
              <span>Livraison</span>
              <span>+{deliveryFee.toFixed(2)} MAD</span>
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '1.05rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--burgundy)' }}>{grandTotal.toFixed(2)} MAD</span>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'Traitement…' : '✓ Confirmer la commande'}
          </button>
        </div>
      </form>
    </div>
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
    textAlign: 'center', fontFamily: 'var(--font-body)',
  },
  typeCardActive: { borderColor: 'var(--burgundy)', background: 'rgba(139,26,46,0.05)' },
  typeIcon: { fontSize: '1.8rem' },
  payGrid: { display: 'flex', gap: '0.75rem' },
  payCard: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
    padding: '0.85rem',
    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--white)', cursor: 'pointer', transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
  payCardActive: { borderColor: 'var(--gold)', background: 'rgba(201,168,76,0.08)' },
  summary: { padding: '1.5rem', position: 'sticky', top: 90 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.6rem', color: 'var(--text)' },
  divider: { borderTop: '1px solid var(--border)', margin: '0.75rem 0' },
};
