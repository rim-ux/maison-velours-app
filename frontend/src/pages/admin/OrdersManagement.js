import React, { useEffect, useState, useCallback } from 'react';
import { ordersAPI } from '../../services/api';

const STATUS_OPTIONS = [
  { value: '',              label: 'Tous les statuts' },
  { value: 'en_attente',   label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete',        label: 'Prête' },
  { value: 'livree',       label: 'Livrée / Servie' },
  { value: 'annulee',      label: 'Annulée' },
];

const NEXT_STATUS = {
  en_attente:    'en_preparation',
  en_preparation: 'prete',
  prete:         'livree',
};

const STATUS_BADGE = {
  en_attente:     'badge-warning',
  en_preparation: 'badge-info',
  prete:          'badge-success',
  livree:         'badge-muted',
  annulee:        'badge-danger',
};

export default function OrdersManagement() {
  const [orders,      setOrders]      = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);

  const fetchOrders = useCallback(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (typeFilter)   params.order_type = typeFilter;
    ordersAPI.list(params)
      .then(({ data }) => setOrders(data.results || data))
      .finally(() => setLoading(false));
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await ordersAPI.updateStatus(order.id, next);
    fetchOrders();
  };

  const handleCancel = async (order) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    await ordersAPI.updateStatus(order.id, 'annulee');
    fetchOrders();
    if (selected?.id === order.id) setSelected(null);
  };

  return (
    <div>
      <h1 style={styles.title}>Gestion des Commandes</h1>

      {/* Filters */}
      <div style={styles.filters} className="card">
        <select className="form-control" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: 180 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="sur_place">Sur place</option>
          <option value="emporter">À emporter</option>
          <option value="livraison">Livraison</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}>🔄 Actualiser</button>
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.85rem' }}>
          {orders.length} commande(s)
        </span>
      </div>

      <div style={styles.layout}>
        {/* Table */}
        <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
          {loading ? <div className="spinner" /> : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Aucune commande trouvée</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o.id} style={selected?.id === o.id ? { background: 'rgba(139,26,46,0.05)' } : {}}>
                      <td><button onClick={() => setSelected(selected?.id === o.id ? null : o)} style={{ fontWeight: 700, color: 'var(--burgundy)', background: 'none', border: 'none', cursor: 'pointer' }}>#{o.id}</button></td>
                      <td>{o.user_name || '—'}</td>
                      <td>{o.type_display}</td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-muted'}`}>{o.status_display}</span></td>
                      <td style={{ fontWeight: 600 }}>{parseFloat(o.total).toFixed(2)} MAD</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(o.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {NEXT_STATUS[o.status] && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleAdvance(o)}>
                              Avancer →
                            </button>
                          )}
                          {o.status !== 'annulee' && o.status !== 'livree' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o)}>✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={styles.detail} className="card">
            <div style={styles.detailHeader}>
              <h3 style={{ fontFamily: 'var(--font-head)' }}>Commande #{selected.id}</h3>
              <button style={{ fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted)' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '1rem' }}>
              <p style={styles.detailRow}><span>Client :</span> <strong>{selected.user_name}</strong></p>
              <p style={styles.detailRow}><span>Type :</span> <strong>{selected.type_display}</strong></p>
              {selected.table_number && <p style={styles.detailRow}><span>Table :</span> <strong>N° {selected.table_number}</strong></p>}
              {selected.zone_name && <p style={styles.detailRow}><span>Zone :</span> <strong>{selected.zone_name}</strong></p>}
              {selected.delivery_address && <p style={styles.detailRow}><span>Adresse :</span> <strong>{selected.delivery_address}</strong></p>}
              {selected.notes && <p style={styles.detailRow}><span>Notes :</span> <em>{selected.notes}</em></p>}
              <hr style={{ margin: '0.75rem 0', borderColor: 'var(--border)' }} />
              <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Articles</h4>
              {selected.items.map((i) => (
                <div key={i.id} style={styles.detailItem}>
                  <span>{i.product_name} × {i.quantity}</span>
                  <span>{parseFloat(i.subtotal).toFixed(2)} MAD</span>
                </div>
              ))}
              <div style={{ ...styles.detailItem, fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--burgundy)' }}>{parseFloat(selected.total).toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-head)', fontSize: '1.8rem', marginBottom: '1.25rem', color: 'var(--dark)' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '1rem', marginBottom: '1rem' },
  layout: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  detail: { width: 300, flexShrink: 0, position: 'sticky', top: 20, padding: 0, overflow: 'hidden' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text)' },
  detailItem: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' },
};
