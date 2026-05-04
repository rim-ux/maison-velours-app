import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ease = [0.25, 0.46, 0.45, 0.94];

const HOURS = ['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];

const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(201,168,76,0.18)',
  borderRadius: 10,
  padding: '0.9rem 1.2rem',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  transition: 'border-color 0.25s, box-shadow 0.25s',
  colorScheme: 'dark',
};

const labelBase = {
  display: 'block',
  fontSize: '0.68rem', fontWeight: 700,
  color: 'rgba(201,168,76,0.75)',
  letterSpacing: '0.14em', textTransform: 'uppercase',
  marginBottom: '0.55rem',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      {children}
    </div>
  );
}

export default function ReservationForm() {
  const today = new Date().toISOString().split('T')[0];
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:    user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    date: '', time: '20:00', guests: 2, message: '',
  });
  const [status,   setStatus]   = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'guests' ? parseInt(value) : value }));
  };

  const onFocus = e => {
    e.target.style.borderColor = 'rgba(201,168,76,0.55)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(201,168,76,0.09)';
  };
  const onBlur = e => {
    e.target.style.borderColor = 'rgba(201,168,76,0.18)';
    e.target.style.boxShadow   = 'none';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await api.post('/tables/reservations/', {
        name: form.name, email: form.email, phone: form.phone,
        date: form.date, time: form.time, guests: form.guests, message: form.message,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      const data = err.response?.data;
      setErrorMsg(
        typeof data === 'string'
          ? data
          : data?.detail || Object.values(data || {})[0]?.[0] || 'Une erreur est survenue.'
      );
    }
  };

  return (
    <section id="reservation" style={{
      background: 'linear-gradient(180deg, #05050A 0%, #0B0615 100%)',
      padding: '9rem 1.5rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />

      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Réservation
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', marginBottom: '1rem' }}>
            Réservez votre table
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, fontSize: '0.95rem' }}>
            Notre équipe confirme chaque réservation sous 24h.
            Vous recevrez une notification dans votre espace client.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* NOT LOGGED IN — gate */}
          {!user ? (
            <motion.div
              key="gate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              style={{
                textAlign: 'center',
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid rgba(201,168,76,0.18)',
                borderRadius: 24, padding: '4.5rem 3rem',
              }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid rgba(201,168,76,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 2rem',
                background: 'rgba(201,168,76,0.06)',
                fontSize: '2rem',
              }}>
                🔒
              </div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', color: '#fff', marginBottom: '1rem' }}>
                Connexion requise
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 420, margin: '0 auto 2.5rem' }}>
                Pour réserver, connectez-vous à votre espace client.
                Vous recevrez la confirmation directement dans votre messagerie.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" state={{ from: '/', section: 'reservation' }} style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                  color: '#0A0A0F', padding: '0.9rem 2.5rem', borderRadius: 10,
                  fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none', display: 'inline-block',
                  boxShadow: '0 6px 28px rgba(201,168,76,0.35)',
                }}>
                  Se connecter
                </Link>
                <Link to="/register" style={{
                  background: 'transparent', color: 'rgba(255,255,255,0.8)',
                  padding: '0.9rem 2.5rem', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.88rem', fontWeight: 500,
                  textDecoration: 'none', display: 'inline-block',
                }}>
                  Créer un compte
                </Link>
              </div>
            </motion.div>

          ) : status === 'success' ? (
            /* SUCCESS */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              style={{
                textAlign: 'center',
                background: 'rgba(39,174,96,0.06)',
                border: '1px solid rgba(39,174,96,0.25)',
                borderRadius: 24, padding: '5rem 3rem',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  border: '2px solid rgba(39,174,96,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 2rem',
                  background: 'rgba(39,174,96,0.08)',
                }}
              >
                <svg width="38" height="38" fill="none" stroke="#27AE60" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </motion.div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.9rem', color: '#fff', marginBottom: '1.1rem' }}>
                Demande envoyée !
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Votre demande pour le{' '}
                <strong style={{ color: '#C9A84C' }}>{form.date}</strong> à{' '}
                <strong style={{ color: '#C9A84C' }}>{form.time}</strong>{' '}
                a bien été reçue.<br />
                Vous recevrez une notification de confirmation dans votre messagerie sous 24h.
              </p>
              <Link to="/mes-reservations" style={{
                display: 'inline-block',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#C9A84C', padding: '0.75rem 2rem', borderRadius: 10,
                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              }}>
                Voir mes réservations →
              </Link>
            </motion.div>

          ) : (
            /* FORM */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(201,168,76,0.1)',
                borderRadius: 24, padding: '3rem',
              }}
            >
              {/* Logged-in badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 10, padding: '0.75rem 1rem',
                marginBottom: '2rem',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--burgundy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                }}>
                  {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                    {user.first_name || user.username}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,0.7)' }}>
                    Réservation liée à votre compte
                  </div>
                </div>
              </div>

              <div className="res-grid-2" style={{ marginBottom: '1.5rem' }}>
                <Field label="Nom complet *">
                  <input type="text" name="name" value={form.name}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    required placeholder="Votre nom" style={inputBase} />
                </Field>
                <Field label="Email *">
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    required placeholder="votre@email.com" style={inputBase} />
                </Field>
              </div>

              <div className="res-grid-2" style={{ marginBottom: '1.5rem' }}>
                <Field label="Téléphone *">
                  <input type="tel" name="phone" value={form.phone}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    required placeholder="+212 6XX-XXXXXX" style={inputBase} />
                </Field>
                <Field label="Nombre de convives *">
                  <select name="guests" value={form.guests}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    style={{ ...inputBase, cursor: 'pointer' }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                      <option key={n} value={n} style={{ background: '#1A1A2E', color: '#fff' }}>
                        {n === 12 ? '12+ personnes' : `${n} personne${n > 1 ? 's' : ''}`}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="res-grid-2" style={{ marginBottom: '1.5rem' }}>
                <Field label="Date souhaitée *">
                  <input type="date" name="date" value={form.date}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    required min={today} style={inputBase} />
                </Field>
                <Field label="Heure préférée *">
                  <select name="time" value={form.time}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    style={{ ...inputBase, cursor: 'pointer' }}>
                    {HOURS.map(h => (
                      <option key={h} value={h} style={{ background: '#1A1A2E', color: '#fff' }}>{h}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <Field label="Occasion particulière ou demandes spéciales">
                  <textarea name="message" value={form.message}
                    onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                    rows={4} placeholder="Anniversaire, allergies, préférences..."
                    style={{ ...inputBase, resize: 'vertical', lineHeight: 1.65 }} />
                </Field>
              </div>

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(231,76,60,0.09)', border: '1px solid rgba(231,76,60,0.28)',
                    borderRadius: 10, padding: '0.9rem 1.2rem',
                    color: '#E74C3C', fontSize: '0.875rem', marginBottom: '1.5rem',
                  }}
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={status !== 'loading' ? { scale: 1.025, boxShadow: '0 16px 48px rgba(201,168,76,0.45)' } : {}}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: status === 'loading'
                    ? 'rgba(201,168,76,0.45)'
                    : 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                  color: '#0A0A0F',
                  padding: '1.15rem', borderRadius: 12,
                  fontSize: '0.88rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  border: 'none',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 6px 28px rgba(201,168,76,0.28)',
                }}
              >
                {status === 'loading' ? 'Envoi en cours…' : '✓ Confirmer la réservation'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
