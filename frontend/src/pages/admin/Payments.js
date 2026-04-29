import React, { useEffect, useState } from 'react';
import { paymentsAPI } from '../../services/api';

const METHOD_ICONS = { especes: '💵', carte: '💳', en_ligne: '🌐' };
const STATUS_BADGE = { complete: 'badge-success', en_attente: 'badge-warning', rembourse: 'badge-danger' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    paymentsAPI.list()
      .then(({ data }) => setPayments(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    if (!search) return true;
    return (
      String(p.order).includes(search) ||
      (p.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_ref || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'complete')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const byMethod = ['especes', 'carte', 'en_ligne'].map((m) => ({
    method: m,
    count: payments.filter((p) => p.method === m && p.status === 'complete').length,
    total: payments.filter((p) => p.method === m && p.status === 'complete').reduce((s, p) => s + parseFloat(p.amount), 0),
  }));

  return (
    <div>
      <h1 style={styles.title}>Gestion des Paiements</h1>

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div className="card" style={styles.totalCard}>
          <div style={styles.totalIcon}>💰</div>
          <div>
            <div style={styles.totalValue}>{totalRevenue.toFixed(2)} MAD</div>
            <div style={styles.totalLabel}>Chiffre d'affaires total</div>
          </div>
        </div>
        {byMethod.map((m) => (
          <div key={m.method} className="card" style={styles.methodCard}>
            <span style={{ fontSize: '1.8rem' }}>{METHOD_ICONS[m.method]}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--dark)' }}>{m.total.toFixed(2)} MAD</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                {m.method === 'especes' ? 'Espèces' : m.method === 'carte' ? 'Carte' : 'En ligne'} · {m.count} transaction(s)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          className="form-control"
          placeholder="🔍 Rechercher par commande, client ou référence…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Méthode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Référence</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Aucun paiement trouvé
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id}>
                    <td><strong style={{ color: 'var(--muted)' }}>#{p.id}</strong></td>
                    <td><strong>Cmd #{p.order}</strong></td>
                    <td>{p.client_name || '—'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {METHOD_ICONS[p.method]} {p.method_display}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--burgundy)' }}>
                      {parseFloat(p.amount).toFixed(2)} MAD
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[p.status] || 'badge-muted'}`}>
                        {p.status_display}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.transaction_ref || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {new Date(p.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  title:       { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '1.25rem' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  totalCard:   { padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '3px solid var(--gold)' },
  totalIcon:   { fontSize: '2.5rem' },
  totalValue:  { fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--gold)' },
  totalLabel:  { fontSize: '0.8rem', color: 'var(--muted)' },
  methodCard:  { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' },
};
