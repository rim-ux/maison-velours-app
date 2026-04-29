import React, { useEffect, useState } from 'react';
import { tablesAPI } from '../../services/api';

const STATUS_STYLES = {
  libre:    { bg: '#d4edda', color: '#155724', label: 'Libre' },
  occupee:  { bg: '#fff3cd', color: '#856404', label: 'Occupée' },
  reservee: { bg: '#d1ecf1', color: '#0c5460', label: 'Réservée' },
};

export default function TablesManagement() {
  const [tables,  setTables]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ number: '', capacity: 4, status: 'libre', location: '' });
  const [saving,  setSaving]  = useState(false);

  const fetchTables = () => {
    tablesAPI.list().then(({ data }) => setTables(data.results || data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTables(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ number: '', capacity: 4, status: 'libre', location: '' });
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ number: t.number, capacity: t.capacity, status: t.status, location: t.location });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await tablesAPI.update(editing.id, form);
      else         await tablesAPI.create(form);
      setModal(false);
      fetchTables();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette table ?')) return;
    await tablesAPI.delete(id);
    fetchTables();
  };

  const handleStatusChange = async (table, status) => {
    await tablesAPI.update(table.id, { status });
    fetchTables();
  };

  const counts = {
    libre:    tables.filter((t) => t.status === 'libre').length,
    occupee:  tables.filter((t) => t.status === 'occupee').length,
    reservee: tables.filter((t) => t.status === 'reservee').length,
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Tables</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Nouvelle table</button>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        {Object.entries(STATUS_STYLES).map(([key, s]) => (
          <div key={key} className="card" style={{ ...styles.summaryCard, borderTopColor: s.color }}>
            <span style={{ fontSize: '2rem' }}>{key === 'libre' ? '🟢' : key === 'occupee' ? '🔴' : '🔵'}</span>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{counts[key]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Tables {s.label}s</div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual floor plan */}
      {loading ? <div className="spinner" /> : (
        <>
          <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1rem', color: 'var(--dark)' }}>Plan de salle</h3>
          <div style={styles.floorPlan}>
            {tables.map((t) => {
              const s = STATUS_STYLES[t.status];
              return (
                <div key={t.id} style={{ ...styles.tableCard, background: s.bg, borderColor: s.color }}>
                  <div style={styles.tableNumber}>Table {t.number}</div>
                  <div style={styles.tableIcon}>🪑</div>
                  <div style={{ ...styles.tableStatus, color: s.color }}>{s.label}</div>
                  <div style={styles.tableCapacity}>{t.capacity} pers.</div>
                  {t.location && <div style={styles.tableLocation}>{t.location}</div>}
                  <div style={styles.tableActions}>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t, e.target.value)}
                      style={{ ...styles.statusSelect, color: s.color }}
                    >
                      <option value="libre">Libre</option>
                      <option value="occupee">Occupée</option>
                      <option value="reservee">Réservée</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {tables.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="icon">🪑</div>
                <h3>Aucune table</h3>
                <p>Ajoutez vos tables pour commencer.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier la table' : 'Nouvelle table'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Numéro de table *</label>
                    <input className="form-control" type="number" min="1" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Capacité (personnes) *</label>
                    <input className="form-control" type="number" min="1" max="20" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="libre">Libre</option>
                    <option value="occupee">Occupée</option>
                    <option value="reservee">Réservée</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Emplacement (optionnel)</label>
                  <input className="form-control" placeholder="ex: Terrasse, Salle principale…" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
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
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title:       { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  summaryCard: { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '3px solid' },
  floorPlan:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' },
  tableCard: {
    border: '2px solid',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
    transition: 'var(--transition)',
  },
  tableNumber:   { fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' },
  tableIcon:     { fontSize: '2rem' },
  tableStatus:   { fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableCapacity: { fontSize: '0.8rem', color: 'var(--muted)' },
  tableLocation: { fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' },
  tableActions:  { width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' },
  statusSelect:  { width: '100%', padding: '0.35rem 0.5rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'var(--font-body)', background: 'white', cursor: 'pointer' },
};
