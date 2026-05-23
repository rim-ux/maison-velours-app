import React, { useState, useEffect, useCallback } from 'react';
import { reservationsAPI, messagesAPI, tablesAPI } from '../../services/api';

const STATUS_STYLE = {
  pending:   { bg: 'rgba(243,156,18,0.1)',  border: 'rgba(243,156,18,0.3)',  color: '#F39C12', label: 'En attente' },
  confirmed: { bg: 'rgba(39,174,96,0.1)',   border: 'rgba(39,174,96,0.3)',   color: '#27AE60', label: 'Confirmée' },
  cancelled: { bg: 'rgba(231,76,60,0.1)',   border: 'rgba(231,76,60,0.3)',   color: '#E74C3C', label: 'Annulée' },
};

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [filter,       setFilter]       = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [actionId,     setActionId]     = useState(null);

  // Message modal state
  const [msgModal,   setMsgModal]   = useState(null); // { userId, name }
  const [msgBody,    setMsgBody]    = useState('');
  const [msgSending, setMsgSending] = useState(false);

  // Table picker modal state
  const [tableModal,      setTableModal]      = useState(null); // { reservation }
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable,   setSelectedTable]   = useState('');
  const [tableLoading,    setTableLoading]    = useState(false);
  const [confirming,      setConfirming]      = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    reservationsAPI.list()
      .then(({ data }) => setReservations(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  // Open table picker: load tables with enough capacity
  const openTablePicker = async (reservation) => {
    setTableModal(reservation);
    setSelectedTable('');
    setTableLoading(true);
    try {
      const { data } = await tablesAPI.list({ status: 'libre' });
      const tables = data.results || data;
      // Filter by capacity >= guests
      setAvailableTables(tables.filter(t => t.capacity >= reservation.guests));
    } catch {
      setAvailableTables([]);
    }
    setTableLoading(false);
  };

  const confirmWithTable = async () => {
    if (!selectedTable || !tableModal) return;
    setConfirming(true);
    try {
      const { data } = await reservationsAPI.update(tableModal.id, {
        status: 'confirmed',
        table: parseInt(selectedTable, 10),
      });
      setReservations(prev => prev.map(r => r.id === tableModal.id ? data : r));
      setTableModal(null);
    } catch {
      // keep modal open on error
    }
    setConfirming(false);
  };

  const cancelReservation = async (id) => {
    setActionId(id);
    try {
      const { data } = await reservationsAPI.update(id, { status: 'cancelled' });
      setReservations(prev => prev.map(r => r.id === id ? data : r));
    } catch {}
    setActionId(null);
  };

  const sendMessage = async () => {
    if (!msgBody.trim() || !msgModal?.userId) return;
    setMsgSending(true);
    try {
      await messagesAPI.send(msgModal.userId, msgBody.trim());
      setMsgBody('');
      setMsgModal(null);
    } catch {}
    setMsgSending(false);
  };

  const filtered = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter);

  const counts = {
    all:       reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>
          Réservations
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Gérez les demandes de réservation et assignez les tables.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { key: 'all',       label: 'Total',      color: 'var(--dark)' },
          { key: 'pending',   label: 'En attente', color: '#F39C12' },
          { key: 'confirmed', label: 'Confirmées', color: '#27AE60' },
          { key: 'cancelled', label: 'Annulées',   color: '#E74C3C' },
        ].map(({ key, label, color }) => (
          <div key={key} style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color, fontFamily: 'var(--font-head)' }}>
              {counts[key]}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'En attente' },
          { key: 'confirmed', label: 'Confirmées' },
          { key: 'cancelled', label: 'Annulées' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 20,
            background: filter === f.key ? 'var(--burgundy)' : '#fff',
            color: filter === f.key ? '#fff' : 'var(--muted)',
            border: `1px solid ${filter === f.key ? 'var(--burgundy)' : 'var(--border)'}`,
            fontSize: '0.82rem', fontWeight: filter === f.key ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            {f.label} {counts[f.key] > 0 && filter !== f.key ? `(${counts[f.key]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: '#fff', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗓️</div>
          <p style={{ color: 'var(--muted)' }}>Aucune réservation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(r => {
            const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--dark)' }}>
                        {r.name}
                      </strong>
                      <span style={{
                        padding: '0.18rem 0.6rem', borderRadius: 50,
                        background: s.bg, border: `1px solid ${s.border}`,
                        color: s.color, fontSize: '0.7rem', fontWeight: 700,
                        textTransform: 'uppercase',
                      }}>
                        {s.label}
                      </span>
                      {r.user && (
                        <span style={{
                          padding: '0.18rem 0.6rem', borderRadius: 50,
                          background: 'rgba(99,91,255,0.08)', border: '1px solid rgba(99,91,255,0.2)',
                          color: '#635BFF', fontSize: '0.68rem', fontWeight: 600,
                        }}>
                          Compte client
                        </span>
                      )}
                      {r.table_number && (
                        <span style={{
                          padding: '0.18rem 0.6rem', borderRadius: 50,
                          background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)',
                          color: '#27AE60', fontSize: '0.68rem', fontWeight: 600,
                        }}>
                          Table N°{r.table_number}{r.table_location ? ` — ${r.table_location}` : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>📧 {r.email}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>📞 {r.phone}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                      Demande reçue le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Date</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>
                      {new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Heure</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>{r.time?.slice(0, 5)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Convives</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>{r.guests}</div>
                  </div>
                  {r.message && (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Message</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontStyle: 'italic' }}>"{r.message}"</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openTablePicker(r)}
                        disabled={actionId === r.id}
                        style={{
                          padding: '0.55rem 1.25rem',
                          background: '#27AE60', color: '#fff',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)', opacity: actionId === r.id ? 0.6 : 1,
                        }}
                      >
                        ✓ Confirmer & Assigner une table
                      </button>
                      <button
                        onClick={() => cancelReservation(r.id)}
                        disabled={actionId === r.id}
                        style={{
                          padding: '0.55rem 1.25rem',
                          background: 'rgba(231,76,60,0.1)', color: '#E74C3C',
                          border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)', opacity: actionId === r.id ? 0.6 : 1,
                        }}
                      >
                        ✕ Annuler {r.user && '& Notifier'}
                      </button>
                    </>
                  )}
                  {r.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => openTablePicker(r)}
                        style={{
                          padding: '0.55rem 1.25rem',
                          background: 'rgba(52,152,219,0.1)', color: '#2980B9',
                          border: '1px solid rgba(52,152,219,0.3)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        ↔ Changer de table
                      </button>
                      <button
                        onClick={() => cancelReservation(r.id)}
                        disabled={actionId === r.id}
                        style={{
                          padding: '0.55rem 1.25rem',
                          background: 'rgba(231,76,60,0.1)', color: '#E74C3C',
                          border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        ✕ Annuler la réservation
                      </button>
                    </>
                  )}
                  {r.user && (
                    <button
                      onClick={() => setMsgModal({ userId: r.user, name: r.name })}
                      style={{
                        padding: '0.55rem 1.25rem',
                        background: 'rgba(99,91,255,0.08)', color: '#635BFF',
                        border: '1px solid rgba(99,91,255,0.2)', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      💬 Envoyer un message
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table picker modal ── */}
      {tableModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={() => setTableModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius)',
            padding: '2rem', maxWidth: 480, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.25rem', color: 'var(--dark)' }}>
              Assigner une table
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Réservation de <strong>{tableModal.name}</strong> — {tableModal.guests} convive(s) le{' '}
              {new Date(tableModal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {tableModal.time?.slice(0, 5)}
            </p>

            {tableLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /></div>
            ) : availableTables.length === 0 ? (
              <div style={{
                padding: '1.25rem', background: 'rgba(231,76,60,0.06)',
                border: '1px solid rgba(231,76,60,0.2)', borderRadius: 'var(--radius-sm)',
                color: '#E74C3C', fontSize: '0.88rem', textAlign: 'center',
              }}>
                Aucune table libre avec une capacité suffisante ({tableModal.guests}+ places).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 280, overflowY: 'auto' }}>
                {availableTables.map(t => (
                  <label key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    border: `2px solid ${selectedTable === String(t.id) ? 'var(--burgundy)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: selectedTable === String(t.id) ? 'rgba(139,26,46,0.04)' : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <input
                      type="radio"
                      name="table"
                      value={t.id}
                      checked={selectedTable === String(t.id)}
                      onChange={() => setSelectedTable(String(t.id))}
                      style={{ accentColor: 'var(--burgundy)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        Table N°{t.number}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {t.capacity} places{t.location ? ` — ${t.location}` : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setTableModal(null)} style={{
                padding: '0.6rem 1.25rem', background: 'none',
                border: '1px solid var(--border)', color: 'var(--muted)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.875rem',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>Annuler</button>
              <button
                onClick={confirmWithTable}
                disabled={!selectedTable || confirming || availableTables.length === 0}
                className="btn btn-primary"
                style={{ opacity: (!selectedTable || confirming) ? 0.6 : 1 }}
              >
                {confirming ? 'Confirmation…' : '✓ Confirmer la réservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Message Modal ── */}
      {msgModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={() => setMsgModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius)',
            padding: '2rem', maxWidth: 480, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.5rem', color: 'var(--dark)' }}>
              Message à {msgModal.name}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Ce message apparaîtra dans la messagerie du client.
            </p>
            <textarea
              value={msgBody}
              onChange={e => setMsgBody(e.target.value)}
              rows={4} placeholder="Votre message..."
              style={{
                width: '100%', padding: '0.9rem',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--burgundy)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setMsgModal(null)} style={{
                padding: '0.6rem 1.25rem', background: 'none',
                border: '1px solid var(--border)', color: 'var(--muted)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.875rem',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>Annuler</button>
              <button onClick={sendMessage} disabled={msgSending || !msgBody.trim()} className="btn btn-primary"
                style={{ opacity: (!msgBody.trim() || msgSending) ? 0.6 : 1 }}>
                {msgSending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
