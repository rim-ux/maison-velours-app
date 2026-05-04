import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI, reservationsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format&fit=crop';

const CAT_IMAGES = {
  'Entrees':            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=75&auto=format&fit=crop',
  'Entrées':            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=75&auto=format&fit=crop',
  'Plats':              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=75&auto=format&fit=crop',
  'Plats Marocains':    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=75&auto=format&fit=crop',
  'Cuisine Italienne':  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=75&auto=format&fit=crop',
  'Cuisine Espagnole':  'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=75&auto=format&fit=crop',
  'Desserts':           'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=75&auto=format&fit=crop',
  'Boissons':           'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=75&auto=format&fit=crop',
  'Cafes':              'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=75&auto=format&fit=crop',
  'Cafés':              'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=75&auto=format&fit=crop',
};

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [activecat,  setActiveCat]  = useState(null);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const [showReserve,    setShowReserve]    = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError,   setReserveError]   = useState('');
  const [reserveForm,    setReserveForm]    = useState({
    name: '', email: '', phone: '', date: '', time: '20:00', guests: 2, message: '',
  });

  const openReserve = () => {
    setReserveForm(f => ({
      ...f,
      name:  user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '',
      email: user?.email || '',
    }));
    setReserveSuccess(false);
    setReserveError('');
    setShowReserve(true);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    setReserveLoading(true);
    setReserveError('');
    try {
      await reservationsAPI.create({
        name:    reserveForm.name,
        email:   reserveForm.email,
        phone:   reserveForm.phone,
        date:    reserveForm.date,
        time:    reserveForm.time,
        guests:  parseInt(reserveForm.guests),
        message: reserveForm.message,
      });
      setReserveSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      setReserveError(typeof d === 'string' ? d : JSON.stringify(d) || 'Une erreur est survenue.');
    } finally {
      setReserveLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([menuAPI.getCategories(), menuAPI.getProducts({ available: true })])
      .then(([cats, prods]) => {
        setCategories(cats.data);
        setProducts(prods.data.results || prods.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat    = !activecat || p.category === activecat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* ── Hero ── */}
      <div style={styles.hero}>
        <img
          src={HERO_IMAGE}
          alt="Maison Velours"
          style={{ ...styles.heroBg, opacity: heroLoaded ? 1 : 0 }}
          onLoad={() => setHeroLoaded(true)}
        />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent} className="animate-fadeInUp">
          <p style={styles.heroEyebrow}>Bienvenue chez</p>
          <h1 style={styles.heroTitle}>Maison Velours</h1>
          <div style={styles.heroDivider} />
          <p style={styles.heroDesc}>
            Cuisine marocaine, italienne et espagnole — 100% halal, fait maison
          </p>
          <div style={styles.heroCtas}>
            <a href="#menu-content" className="btn btn-gold btn-lg">Découvrir le menu</a>
            <button
              type="button"
              onClick={openReserve}
              style={styles.reserveBtn}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Réserver une table
            </button>
            {totalItems > 0 && (
              <Link to="/panier" className="btn btn-outline-white btn-lg">
                Panier ({totalItems})
              </Link>
            )}
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={styles.scrollIndicator}>
          <div style={styles.scrollLine} />
          <span style={styles.scrollText}>Défiler</span>
        </div>
      </div>

      {/* ── Categories visual ── */}
      <div style={styles.catSection} id="menu-content">
        <div className="container">
          <h2 style={styles.sectionTitle} className="animate-fadeInUp">Notre Carte</h2>
          <p style={styles.sectionSub}>Sélectionnez une catégorie</p>
          <div style={styles.catGrid}>
            <button
              onClick={() => setActiveCat(null)}
              style={{
                ...styles.catCard,
                ...(activecat === null ? styles.catCardActive : {}),
              }}
            >
              <div style={{ ...styles.catImg, background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))' }}>
                <span style={styles.catAllIcon}>Tout</span>
              </div>
              <span style={styles.catName}>Tout le menu</span>
              <span style={styles.catCount}>{products.length} plats</span>
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  style={{
                    ...styles.catCard,
                    ...(activecat === c.id ? styles.catCardActive : {}),
                  }}
                >
                  <div style={styles.catImgWrap}>
                    <img
                      src={CAT_IMAGES[c.name] || CAT_IMAGES['Plats']}
                      alt={c.name}
                      style={styles.catImg}
                    />
                    <div style={styles.catImgOverlay} />
                  </div>
                  <span style={styles.catName}>{c.name}</span>
                  <span style={styles.catCount}>{count} plat{count > 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {/* Search */}
        <div style={styles.searchBar}>
          <div style={styles.searchWrap}>
            <svg width="18" height="18" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Rechercher un plat, une boisson..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={styles.clearBtn}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          {(search || activecat) && (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">—</div>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez une autre catégorie ou modifiez votre recherche.</p>
          </div>
        ) : (
          categories
            .filter((c) => !activecat || c.id === activecat)
            .map((cat) => {
              const catProducts = filtered.filter((p) => p.category === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <section key={cat.id} style={{ marginBottom: '3.5rem' }}>
                  <div style={styles.catHeader}>
                    <div style={styles.catHeaderLine} />
                    <h2 style={styles.catTitle}>{cat.name}</h2>
                    <div style={styles.catHeaderLine} />
                  </div>
                  <div style={styles.grid}>
                    {catProducts.map((p, i) => (
                      <div key={p.id} className={`animate-fadeInUp delay-${Math.min(i + 1, 4)}`}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </div>

      {/* ── Reservation modal ── */}
      {showReserve && (
        <div style={styles.modalBackdrop} onClick={() => setShowReserve(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Réserver une table</h2>
                <p style={styles.modalSub}>Maison Velours · Casablanca</p>
              </div>
              <button onClick={() => setShowReserve(false)} style={styles.modalClose}>✕</button>
            </div>

            {reserveSuccess ? (
              <div style={styles.successBox}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
                <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  Demande envoyée !
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Votre demande de réservation a été transmise. Vous recevrez une confirmation dans votre messagerie.
                </p>
                <button
                  onClick={() => setShowReserve(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '1.5rem' }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleReserveSubmit}>
                {reserveError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{reserveError}</div>}
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Nom complet</label>
                    <input className="form-control" required value={reserveForm.name}
                      onChange={e => setReserveForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jean Dupont" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Téléphone</label>
                    <input className="form-control" required value={reserveForm.phone}
                      onChange={e => setReserveForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+212 6XX XXX XXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" required value={reserveForm.email}
                    onChange={e => setReserveForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@exemple.com" />
                </div>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Date</label>
                    <input className="form-control" type="date" required min={today}
                      value={reserveForm.date}
                      onChange={e => setReserveForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Heure</label>
                    <input className="form-control" type="time" required
                      value={reserveForm.time}
                      onChange={e => setReserveForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ width: 110 }}>
                    <label>Convives</label>
                    <input className="form-control" type="number" min="1" max="20" required
                      value={reserveForm.guests}
                      onChange={e => setReserveForm(f => ({ ...f, guests: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea className="form-control" rows={3} value={reserveForm.message}
                    onChange={e => setReserveForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Allergies, occasion spéciale, demandes particulières…" />
                </div>
                <button type="submit" disabled={reserveLoading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {reserveLoading ? 'Envoi en cours…' : 'Confirmer la réservation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  /* Hero */
  hero: {
    position: 'relative',
    height: '100vh',
    minHeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.8s ease',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(17,11,11,0.72) 60%, rgba(0,0,0,0.85) 100%)',
  },
  heroContent: {
    position: 'relative', zIndex: 2,
    textAlign: 'center', color: '#fff',
    padding: '0 1.5rem', maxWidth: 680,
  },
  heroEyebrow: {
    fontSize: '0.8rem',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  heroTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '1.25rem',
    color: '#fff',
  },
  heroDivider: {
    width: 60, height: 2,
    background: 'var(--gold)',
    margin: '0 auto 1.5rem',
  },
  heroDesc: {
    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
    opacity: 0.85,
    lineHeight: 1.8,
    marginBottom: '2.5rem',
  },
  heroCtas: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  scrollIndicator: {
    position: 'absolute', bottom: 32, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    zIndex: 2,
    animation: 'fadeInUp 1s ease 1s both',
  },
  scrollLine: {
    width: 1, height: 50,
    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))',
    animation: 'scrollPulse 2s ease infinite',
  },
  scrollText: { fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },

  /* Categories */
  catSection: { background: 'var(--dark)', padding: '5rem 0' },
  sectionTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  sectionSub: { textAlign: 'center', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem', fontSize: '0.9rem' },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem',
  },
  catCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
    padding: '0 0 1rem',
    border: '2px solid transparent',
    borderRadius: 'var(--radius)',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.35s var(--ease)',
    overflow: 'hidden',
    fontFamily: 'var(--font-body)',
  },
  catCardActive: {
    borderColor: 'var(--gold)',
    background: 'rgba(201,168,76,0.08)',
  },
  catImgWrap: { position: 'relative', width: '100%', height: 110, overflow: 'hidden' },
  catImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s var(--ease)' },
  catImgOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', transition: 'background 0.3s' },
  catAllIcon: {
    width: '100%', height: 110,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em',
    color: 'var(--gold)',
    textTransform: 'uppercase',
  },
  catName: { fontSize: '0.9rem', fontWeight: 600, color: '#fff' },
  catCount: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' },

  /* Search */
  searchBar: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    marginBottom: '2.5rem', flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    flex: 1, maxWidth: 420,
    background: '#fff',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.7rem 1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchInput: {
    border: 'none', outline: 'none', flex: 1,
    fontSize: '0.9rem', background: 'transparent', color: 'var(--text)',
  },
  clearBtn: {
    color: 'var(--muted)', cursor: 'pointer', display: 'flex',
    alignItems: 'center', background: 'none', border: 'none', padding: 2,
  },

  /* Section titles */
  catHeader: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    marginBottom: '1.75rem',
  },
  catHeaderLine: { flex: 1, height: 1, background: 'var(--border)' },
  catTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: '1.6rem',
    color: 'var(--dark)',
    whiteSpace: 'nowrap',
  },

  /* Products grid */
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' },

  /* Reservation button */
  reserveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.9rem 2.2rem',
    background: 'linear-gradient(135deg, var(--burgundy) 0%, #6B1220 100%)',
    color: '#fff',
    border: '2px solid rgba(255,255,255,0.25)',
    borderRadius: 10,
    fontSize: '0.9rem', fontWeight: 700,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 8px 32px rgba(139,26,46,0.55)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  /* Modal */
  modalBackdrop: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
  },
  modalBox: {
    background: '#fff',
    borderRadius: 'var(--radius)',
    width: '100%', maxWidth: 580,
    maxHeight: '90vh', overflowY: 'auto',
    padding: '2rem',
    boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.75rem',
  },
  modalTitle: {
    fontFamily: 'var(--font-head)', fontSize: '1.6rem',
    color: 'var(--dark)', marginBottom: '0.2rem',
  },
  modalSub: { color: 'var(--muted)', fontSize: '0.85rem' },
  modalClose: {
    background: 'none', border: 'none', fontSize: '1.2rem',
    cursor: 'pointer', color: 'var(--muted)',
    padding: '0.25rem', lineHeight: 1,
  },
  formRow: { display: 'flex', gap: '1rem' },
  successBox: { textAlign: 'center', padding: '2rem 1rem' },
};
