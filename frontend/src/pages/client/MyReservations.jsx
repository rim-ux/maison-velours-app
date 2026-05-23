import React, { useState, useEffect } from 'react';
import { reservationsAPI } from '../../services/api';

const STATUS_STYLE = {
  pending:   { bg: 'rgba(243,156,18,0.1)',  border: 'rgba(243,156,18,0.3)',  color: '#F39C12', label: 'En attente' },
  confirmed: { bg: 'rgba(39,174,96,0.1)',   border: 'rgba(39,174,96,0.3)',   color: '#27AE60', label: 'Confirmée' },
  cancelled: { bg: 'rgba(231,76,60,0.1)',   border: 'rgba(231,76,60,0.3)',   color: '#E74C3C', label: 'Annulée' },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    reservationsAPI.myReservations()
      .then(({ data }) => setReservations(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" /></div>
  );

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>
          Mes Réservations
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Suivez l'état de vos réservations.
        </p>
      </div>

      {reservations.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: '#fff', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🗓️</div>
          <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.75rem', color: 'var(--dark)' }}>
            Aucune réservation
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Réservez votre table depuis le bouton "Réserver une table" sur la page du menu.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reservations.map(r => {
            const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'grid', gridTemplateColumns: '1fr auto',
                gap: '1rem', alignItems: 'start',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 600, color: 'var(--dark)' }}>
                      Réservation #{r.id}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.7rem', borderRadius: 50,
                      background: s.bg, border: `1px solid ${s.border}`,
                      color: s.color, fontSize: '0.72rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {s.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Date</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>
                        {new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Heure</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>{r.time?.slice(0, 5)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Convives</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>{r.guests} personne{r.guests > 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  {r.message && (
                    <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      "{r.message}"
                    </p>
                  )}

                  {r.status === 'confirmed' && (
                    <div style={{
                      marginTop: '1rem', padding: '0.85rem 1.1rem',
                      background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.2)',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: '#27AE60',
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>✅</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Réservation confirmée !</div>
                        {r.table_number ? (
                          <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            Votre <strong>Table N°{r.table_number}</strong>
                            {r.table_location ? ` (${r.table_location})` : ''} vous attend.{' '}
                            Capacité : {r.table_capacity} place{r.table_capacity > 1 ? 's' : ''}.
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            Votre table vous sera indiquée à l'arrivée.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {r.status === 'cancelled' && (
                    <div style={{
                      marginTop: '1rem', padding: '0.75rem 1rem',
                      background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#E74C3C',
                    }}>
                      ✕ Cette réservation a été annulée. Contactez-nous pour plus d'informations.
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
