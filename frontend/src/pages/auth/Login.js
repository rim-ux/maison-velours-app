import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form);

      // If coming from the reservation gate, go back to landing page and scroll
      const fromState = location.state;
      if (fromState?.section === 'reservation') {
        navigate('/', { replace: true });
        // Small delay so the page renders before scrolling
        setTimeout(() => {
          document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        return;
      }

      // Generic "from" redirect (RequireAuth)
      if (fromState?.from && fromState.from !== '/login') {
        navigate(fromState.from, { replace: true });
        return;
      }

      navigate(user.role === 'admin' ? '/admin' : '/accueil');
    } catch (err) {
      if (!err.response) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else if (err.response?.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fromReservation = location.state?.section === 'reservation';

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        <div style={styles.top}>
          <span style={{ fontSize: '2.5rem' }}>🍷</span>
          <h1 style={styles.title}>Maison Velours</h1>
          <p style={styles.subtitle}>
            {fromReservation
              ? 'Connectez-vous pour confirmer votre réservation'
              : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {fromReservation && (
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#8B6914',
            marginBottom: '1.5rem',
            display: 'flex', gap: '0.5rem', alignItems: 'center',
          }}>
            🗓️ Après connexion, vous serez redirigé vers le formulaire de réservation.
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="votre_nom"
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Connexion…' : fromReservation ? '🗓️ Connexion & Réserver' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            state={location.state}
            style={{ color: 'var(--burgundy)', fontWeight: 600 }}
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--dark) 0%, var(--burgundy-dk) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
  },
  card:     { width: '100%', maxWidth: 420, padding: '2.5rem' },
  top:      { textAlign: 'center', marginBottom: '2rem' },
  title:    { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)', marginTop: '0.5rem' },
  subtitle: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.3rem' },
  footer:   { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' },
};
