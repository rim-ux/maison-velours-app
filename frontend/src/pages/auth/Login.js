import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'admin' ? '/admin' : '/menu');
    } catch {
      setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        <div style={styles.top}>
          <span style={{ fontSize: '2.5rem' }}>🍷</span>
          <h1 style={styles.title}>Maison Velours</h1>
          <p style={styles.subtitle}>Connectez-vous à votre compte</p>
        </div>

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
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--burgundy)', fontWeight: 600 }}>
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
  card: { width: '100%', maxWidth: 420, padding: '2.5rem' },
  top: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)', marginTop: '0.5rem' },
  subtitle: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.3rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' },
};
