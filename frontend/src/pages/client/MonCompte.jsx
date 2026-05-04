import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function MonCompte() {
  const { user, updateUser } = useAuth();

  /* ── Profile form ── */
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    username:   user?.username   || '',
    phone:      user?.phone      || '',
    address:    user?.address    || '',
  });
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError,   setProfileError]   = useState('');

  /* ── Password form ── */
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [showPw,    setShowPw]    = useState({ current: false, new: false, confirm: false });

  const initials = ((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase()
    || profile.username?.[0]?.toUpperCase() || '?';

  /* ── Handlers ── */
  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setProfileSuccess('');
    setProfileError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data);
      setProfileSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      const msg = err.response?.data;
      setProfileError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg || 'Une erreur est survenue.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPwSuccess('');
    setPwError('');
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setPwError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (passwords.new_password.length < 6) {
      setPwError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setPwSaving(true);
    setPwSuccess('');
    setPwError('');
    try {
      await authAPI.changePassword({
        current_password: passwords.current_password,
        new_password:     passwords.new_password,
      });
      setPwSuccess('Mot de passe modifié avec succès.');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data;
      setPwError(msg?.error || (typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg) || 'Une erreur est survenue.');
    } finally {
      setPwSaving(false);
    }
  };

  /* ── Eye toggle helper ── */
  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {visible
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 720 }}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.avatar}>{initials}</div>
        <div>
          <h1 style={s.title}>Mon compte</h1>
          <p style={s.subtitle}>{user?.email}</p>
        </div>
      </div>

      {/* ── Profile section ── */}
      <section style={s.card} className="card">
        <h2 style={s.sectionTitle}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Informations personnelles
        </h2>

        {profileSuccess && <div style={s.alertSuccess}>{profileSuccess}</div>}
        {profileError   && <div style={s.alertError}>{profileError}</div>}

        <form onSubmit={handleProfileSubmit}>
          <div style={s.grid2}>
            <div className="form-group">
              <label>Prénom</label>
              <input className="form-control" name="first_name" value={profile.first_name}
                onChange={handleProfileChange} placeholder="Votre prénom" />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input className="form-control" name="last_name" value={profile.last_name}
                onChange={handleProfileChange} placeholder="Votre nom" />
            </div>
          </div>

          <div style={s.grid2}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" name="email" value={profile.email}
                onChange={handleProfileChange} placeholder="votre@email.com" />
            </div>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input className="form-control" name="username" value={profile.username}
                onChange={handleProfileChange} placeholder="nom_utilisateur" />
            </div>
          </div>

          <div style={s.grid2}>
            <div className="form-group">
              <label>Téléphone</label>
              <input className="form-control" name="phone" value={profile.phone}
                onChange={handleProfileChange} placeholder="06 00 00 00 00" />
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <input className="form-control" name="address" value={profile.address}
                onChange={handleProfileChange} placeholder="Votre adresse de livraison" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={profileSaving}
              style={{ minWidth: 160, opacity: profileSaving ? 0.7 : 1 }}>
              {profileSaving
                ? <span style={s.spinner} />
                : '✓ Enregistrer'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Password section ── */}
      <section style={s.card} className="card">
        <h2 style={s.sectionTitle}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Changer le mot de passe
        </h2>

        {pwSuccess && <div style={s.alertSuccess}>{pwSuccess}</div>}
        {pwError   && <div style={s.alertError}>{pwError}</div>}

        <form onSubmit={handlePwSubmit}>
          {/* Current password */}
          <div className="form-group">
            <label>Mot de passe actuel</label>
            <div style={s.pwWrap}>
              <input
                className="form-control"
                type={showPw.current ? 'text' : 'password'}
                name="current_password"
                value={passwords.current_password}
                onChange={handlePwChange}
                placeholder="••••••••"
                style={{ paddingRight: '2.8rem' }}
                required
              />
              <button type="button" style={s.eyeBtn}
                onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                <EyeIcon visible={showPw.current} />
              </button>
            </div>
          </div>

          <div style={s.grid2}>
            {/* New password */}
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <div style={s.pwWrap}>
                <input
                  className="form-control"
                  type={showPw.new ? 'text' : 'password'}
                  name="new_password"
                  value={passwords.new_password}
                  onChange={handlePwChange}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.8rem' }}
                  required
                />
                <button type="button" style={s.eyeBtn}
                  onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                  <EyeIcon visible={showPw.new} />
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div style={s.pwWrap}>
                <input
                  className="form-control"
                  type={showPw.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={passwords.confirm_password}
                  onChange={handlePwChange}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.8rem' }}
                  required
                />
                <button type="button" style={s.eyeBtn}
                  onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                  <EyeIcon visible={showPw.confirm} />
                </button>
              </div>
            </div>
          </div>

          {passwords.new_password && passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
            <p style={{ fontSize: '0.78rem', color: '#E74C3C', marginBottom: '0.5rem' }}>
              Les mots de passe ne correspondent pas.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={pwSaving}
              style={{ minWidth: 200, opacity: pwSaving ? 0.7 : 1 }}>
              {pwSaving
                ? <span style={s.spinner} />
                : '🔒 Changer le mot de passe'}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}

const s = {
  header: {
    display: 'flex', alignItems: 'center', gap: '1.25rem',
    marginBottom: '2rem',
  },
  avatar: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700,
    color: '#fff', flexShrink: 0,
    boxShadow: '0 4px 16px rgba(139,26,46,0.35)',
  },
  title: {
    fontFamily: 'var(--font-head)', fontSize: '1.9rem',
    color: 'var(--dark)', marginBottom: '0.15rem',
  },
  subtitle: {
    fontSize: '0.85rem', color: 'var(--muted)', margin: 0,
  },
  card: {
    padding: '1.75rem', marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-head)', fontSize: '1.05rem',
    color: 'var(--dark)', marginBottom: '1.25rem',
    display: 'flex', alignItems: 'center',
  },
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem',
  },
  alertSuccess: {
    background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.35)',
    color: '#1a7a42', borderRadius: 8, padding: '0.65rem 1rem',
    fontSize: '0.85rem', marginBottom: '1rem',
  },
  alertError: {
    background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)',
    color: '#c0392b', borderRadius: 8, padding: '0.65rem 1rem',
    fontSize: '0.85rem', marginBottom: '1rem',
  },
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', padding: '0.2rem', display: 'flex',
  },
  spinner: {
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
};
