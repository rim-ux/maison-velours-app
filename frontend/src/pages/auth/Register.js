import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', password2: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password !== form.password2) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }
    try {
      await register(form);
      navigate('/menu');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        <div style={styles.top}>
          <span style={{ fontSize: '2rem' }}>🍷</span>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>Rejoignez Maison Velours</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label>Prénom</label>
              <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Rim" required />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} placeholder="HIDDANE" required />
            </div>
          </div>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input className="form-control" name="username" value={form.username} onChange={handleChange} placeholder="rim_h" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" required />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+212 6 00 00 00 00" />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="6 caractères minimum" required />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input className="form-control" type="password" name="password2" value={form.password2} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Inscription…' : 'S\'inscrire'}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--burgundy)', fontWeight: 600 }}>Se connecter</Link>
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
  card: { width: '100%', maxWidth: 480, padding: '2rem 2.5rem' },
  top: { textAlign: 'center', marginBottom: '1.5rem' },
  title: { fontFamily: 'var(--font-head)', fontSize: '1.6rem', color: 'var(--dark)', marginTop: '0.5rem' },
  subtitle: { color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' },
  footer: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--muted)' },
};
