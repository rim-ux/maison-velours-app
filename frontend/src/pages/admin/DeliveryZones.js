import React, { useEffect, useState } from 'react';
import { deliveryAPI } from '../../services/api';

export default function DeliveryZones() {
  const [zones,   setZones]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ name: '', description: '', delivery_fee: '', active: true });
  const [saving,  setSaving]  = useState(false);

  const fetchZones = () => {
    deliveryAPI.getZones().then(({ data }) => setZones(data.results || data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchZones(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', delivery_fee: '', active: true });
    setModal(true);
  };

  const openEdit = (z) => {
    setEditing(z);
    setForm({ name: z.name, description: z.description, delivery_fee: z.delivery_fee, active: z.active });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await deliveryAPI.updateZone(editing.id, form);
      else         await deliveryAPI.createZone(form);
      setModal(false);
      fetchZones();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette zone ?')) return;
    await deliveryAPI.deleteZone(id);
    fetchZones();
  };

  const handleToggle = async (z) => {
    await deliveryAPI.updateZone(z.id, { active: !z.active });
    fetchZones();
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Zones de Livraison</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Gérez les zones desservies et leurs frais</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Nouvelle zone</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={styles.grid}>
          {zones.length === 0 && (
            <div className="empty-state card" style={{ gridColumn: '1/-1', padding: '3rem' }}>
              <div className="icon">🛵</div>
              <h3>Aucune zone définie</h3>
              <p>Ajoutez vos zones de livraison.</p>
            </div>
          )}
          {zones.map((z) => (
            <div key={z.id} className="card" style={{ ...styles.zoneCard, opacity: z.active ? 1 : 0.6 }}>
              <div style={styles.zoneTop}>
                <div style={styles.zoneIcon}>🛵</div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.zoneName}>{z.name}</h3>
                  {z.description && <p style={styles.zoneDesc}>{z.description}</p>}
                </div>
                <span style={{ ...styles.activeBadge, background: z.active ? '#d4edda' : '#f8d7da', color: z.active ? '#155724' : '#721c24' }}>
                  {z.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={styles.zoneFee}>
                <span style={styles.feeLabel}>Frais de livraison</span>
                <span style={styles.feeValue}>{parseFloat(z.delivery_fee).toFixed(2)} MAD</span>
              </div>
              <div style={styles.zoneActions}>
                <button className="btn btn-outline btn-sm" onClick={() => handleToggle(z)}>
                  {z.active ? '⏸ Désactiver' : '▶ Activer'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(z)}>✏️ Modifier</button>
                <button className="btn btn-danger btn-sm"  onClick={() => handleDelete(z.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier la zone' : 'Nouvelle zone de livraison'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom de la zone *</label>
                  <input className="form-control" placeholder="ex: Centre-ville, Ain Sebaa…" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={2} placeholder="Quartiers ou rues couverts…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Frais de livraison (MAD) *</label>
                  <input className="form-control" type="number" step="0.01" min="0" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })} required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Zone active
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:       { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  zoneCard:    { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  zoneTop:     { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  zoneIcon:    { fontSize: '1.8rem', flexShrink: 0 },
  zoneName:    { fontFamily: 'var(--font-head)', fontSize: '1rem', marginBottom: '0.2rem' },
  zoneDesc:    { fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 },
  activeBadge: { padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 },
  zoneFee: {
    background: 'var(--cream)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  feeLabel: { fontSize: '0.82rem', color: 'var(--muted)' },
  feeValue: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--burgundy)' },
  zoneActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
};
