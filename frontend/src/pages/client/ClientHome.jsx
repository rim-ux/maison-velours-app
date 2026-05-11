import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useCart }  from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { menuAPI, favoritesAPI, reservationsAPI, ordersAPI } from '../../services/api';
import ClientNavbar from '../../components/ClientNavbar';

const HERO = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format&fit=crop';

const ORDER_STATUS = {
  pending:   { label: 'En attente',   color: '#F39C12', bg: 'rgba(243,156,18,0.1)',  border: 'rgba(243,156,18,0.3)'  },
  confirmed: { label: 'Confirmée',    color: '#27AE60', bg: 'rgba(39,174,96,0.1)',   border: 'rgba(39,174,96,0.3)'   },
  preparing: { label: 'En préparation', color: '#8B26AE', bg: 'rgba(139,38,174,0.1)', border: 'rgba(139,38,174,0.3)' },
  ready:     { label: 'Prête',        color: '#2980B9', bg: 'rgba(41,128,185,0.1)',  border: 'rgba(41,128,185,0.3)'  },
  delivered: { label: 'Livrée',       color: '#27AE60', bg: 'rgba(39,174,96,0.08)', border: 'rgba(39,174,96,0.2)'   },
  cancelled: { label: 'Annulée',      color: '#E74C3C', bg: 'rgba(231,76,60,0.07)', border: 'rgba(231,76,60,0.2)'   },
};

export default function ClientHome() {
  const { user }            = useAuth();
  const { addItem, items: cartItems, totalItems } = useCart();
  const toast               = useToast();
  const navigate            = useNavigate();
  const location            = useLocation();

  const [products,      setProducts]      = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeCat,     setActiveCat]     = useState(null);
  const [addedId,       setAddedId]       = useState(null);
  const [bestSellerIds, setBestSellerIds] = useState(new Set());
  const [favoriteIds,   setFavoriteIds]   = useState(new Set());
  const [togglingFav,   setTogglingFav]   = useState(null);

  const [resForm, setResForm] = useState({
    name: '', email: '', phone: '', date: '', time: '', guests: 2, message: '',
  });
  const [resSent,   setResSent]   = useState(false);
  const [resSaving, setResSaving] = useState(false);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(location.state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      setResForm(f => ({
        ...f,
        name:  `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    // Produits et catégories en priorité — ne jamais bloquer sur les autres
    Promise.all([menuAPI.getProducts(), menuAPI.getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.data.results || prods.data);
        setCategories(cats.data.results || cats.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Données secondaires indépendantes
    ordersAPI.myOrders().then(r => setOrders(r.data.results || r.data)).catch(() => {});
    menuAPI.bestSellers(8).then(r => setBestSellerIds(new Set((r.data.results || r.data).map(p => p.id)))).catch(() => {});
    favoritesAPI.list().then(r => setFavoriteIds(new Set(r.data))).catch(() => {});
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleAddItem = (product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const handleToggleFav = async (productId) => {
    setTogglingFav(productId);
    const wasFav = favoriteIds.has(productId);
    // Optimistic update — feedback immédiat
    setFavoriteIds(prev => {
      const next = new Set(prev);
      wasFav ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      const { data } = await favoritesAPI.toggle(productId);
      // Sync avec la réponse serveur
      setFavoriteIds(prev => {
        const next = new Set(prev);
        data.favorited ? next.add(productId) : next.delete(productId);
        return next;
      });
      toast.push(data.favorited ? 'Ajouté aux favoris ♥' : 'Retiré des favoris', { icon: data.favorited ? '❤️' : '🤍' });
    } catch (err) {
      // Annule l'update optimiste
      setFavoriteIds(prev => {
        const next = new Set(prev);
        wasFav ? next.add(productId) : next.delete(productId);
        return next;
      });
      const msg = err?.response
        ? `Erreur serveur (${err.response.status})`
        : 'Backend non démarré — lance le serveur Django';
      toast.push(msg, { icon: '⚠️' });
    }
    setTogglingFav(null);
  };

  const handleReorder = (order) => {
    if (!order.items?.length) return;
    order.items.forEach(item => {
      addItem({ id: item.product, name: item.product_name, price: item.unit_price, image_url: '' });
    });
    toast.push(`${order.items.length} article(s) ajouté(s) au panier`, { icon: '🛒' });
    navigate('/panier');
  };

  const handleResSubmit = async (e) => {
    e.preventDefault();
    setResSaving(true);
    try {
      await reservationsAPI.create(resForm);
      setResSent(true);
    } catch {}
    setResSaving(false);
  };

  const filtered = activeCat ? products.filter(p => p.category === activeCat) : products;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F0', fontFamily: 'var(--font-body)' }}>

      <ClientNavbar />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 580, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={HERO} alt="Maison Velours" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(10,8,12,0.75) 55%, rgba(0,0,0,0.88) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '0 2rem', maxWidth: 750 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.4rem' }}>
            <div style={{ height: 1, width: 48, background: 'linear-gradient(to right,transparent,var(--gold))', opacity: 0.7 }} />
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>Votre espace</span>
            <div style={{ height: 1, width: 48, background: 'linear-gradient(to left,transparent,var(--gold))', opacity: 0.7 }} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.6rem,6.5vw,4.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.6rem' }}>
            Bienvenue,{' '}
            <span style={{ background: 'linear-gradient(135deg,#C9A84C,#F0D890)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {user?.first_name || user?.username}
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2.8rem' }}>
            Maison Velours — Casablanca
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('ch-menu')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              background: 'linear-gradient(135deg,var(--burgundy),#6B1220)',
              color: '#fff', padding: '0.9rem 2.2rem', borderRadius: 10,
              fontSize: '0.93rem', fontWeight: 700, letterSpacing: '0.05em',
              border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', boxShadow: '0 8px 28px rgba(139,26,46,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(139,26,46,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,26,46,0.5)'; }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Voir le menu
            </button>
            <button onClick={() => scrollTo('ch-resa')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              background: 'linear-gradient(135deg,#C9A84C,#F0D890)',
              color: '#0A0A0F', padding: '0.9rem 2.2rem', borderRadius: 10,
              fontSize: '0.93rem', fontWeight: 700, letterSpacing: '0.05em',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 28px rgba(201,168,76,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(201,168,76,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.4)'; }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Réserver une table
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.54rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>Défiler</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,rgba(201,168,76,0.65),transparent)' }} />
        </div>
      </section>

      {/* ══ MENU ══ */}
      <section id="ch-menu" style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to right,transparent,var(--gold))' }} />
              <span style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>Notre carte</span>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to left,transparent,var(--gold))' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--dark)', marginBottom: '0.3rem' }}>Menu</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Ajoutez vos plats au panier</p>
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <button onClick={() => setActiveCat(null)} style={{
                padding: '0.45rem 1.2rem', borderRadius: 25,
                background: activeCat === null ? 'var(--dark)' : 'transparent',
                color: activeCat === null ? '#fff' : 'var(--muted)',
                border: `1px solid ${activeCat === null ? 'var(--dark)' : 'var(--border)'}`,
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}>Tous</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
                  padding: '0.45rem 1.2rem', borderRadius: 25,
                  background: activeCat === cat.id ? 'var(--dark)' : 'transparent',
                  color: activeCat === cat.id ? '#fff' : 'var(--muted)',
                  border: `1px solid ${activeCat === cat.id ? 'var(--dark)' : 'var(--border)'}`,
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}>{cat.name}</button>
              ))}
            </div>
          )}

          {loading ? <div className="spinner" style={{ margin: '4rem auto' }} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.4rem' }}>
              {filtered.map(p => {
                const isAdded    = addedId === p.id;
                const isBest     = bestSellerIds.has(p.id);
                const isFav      = favoriteIds.has(p.id);
                const isToggling = togglingFav === p.id;
                return (
                  <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.25s, transform 0.25s', position: 'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 165, objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: 165, background: 'linear-gradient(135deg,var(--dark),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '3rem', opacity: 0.3 }}>🍽️</span>
                        </div>
                      )}
                      {/* Best Seller badge */}
                      {isBest && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#C9A84C,#F0D890)', color: '#0A0A0F', fontSize: '0.6rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(201,168,76,0.45)' }}>
                          ⭐ Best Seller
                        </div>
                      )}
                      {/* Favorite heart */}
                      <button onClick={() => handleToggleFav(p.id)} disabled={isToggling} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.2s', opacity: isToggling ? 0.6 : 1, backdropFilter: 'blur(4px)' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div style={{ padding: '1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', color: 'var(--dark)', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</h4>
                        <span style={{ fontWeight: 800, color: 'var(--burgundy)', fontSize: '0.92rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{parseFloat(p.price).toFixed(0)} MAD</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>
                      <button onClick={() => handleAddItem(p)} style={{
                        width: '100%', padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isAdded ? 'rgba(39,174,96,0.12)' : 'rgba(139,26,46,0.07)',
                        border: `1px solid ${isAdded ? 'rgba(39,174,96,0.35)' : 'rgba(139,26,46,0.2)'}`,
                        color: isAdded ? '#27AE60' : 'var(--burgundy)',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-body)', transition: 'all 0.25s',
                        letterSpacing: '0.04em',
                      }}>
                        {isAdded ? '✓ Ajouté au panier' : '+ Ajouter au panier'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
              Aucun produit dans cette catégorie
            </div>
          )}

          {/* Cart button */}
          {totalItems > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/panier" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2.5rem', fontSize: '0.95rem', textDecoration: 'none' }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Voir le panier ({totalItems} article{totalItems > 1 ? 's' : ''})
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══ RÉSERVATION ══ */}
      <section id="ch-resa" style={{ background: 'var(--cream)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to right,transparent,var(--gold))' }} />
              <span style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>Réserver</span>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to left,transparent,var(--gold))' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--dark)', marginBottom: '0.3rem' }}>Réservation</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Réservez votre table à Maison Velours</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            {resSent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(39,174,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.8rem' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>Réservation envoyée !</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Votre demande a été enregistrée. Vous recevrez une confirmation prochainement.</p>
                <button onClick={() => setResSent(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem 1.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
                  Nouvelle réservation
                </button>
              </div>
            ) : (
              <form onSubmit={handleResSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input className="form-control" required value={resForm.name} onChange={e => setResForm(f => ({ ...f, name: e.target.value }))} placeholder="Votre nom" />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input className="form-control" required value={resForm.phone} onChange={e => setResForm(f => ({ ...f, phone: e.target.value }))} placeholder="+212 6XX XXXXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" required value={resForm.email} onChange={e => setResForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Date</label>
                    <input className="form-control" type="date" required value={resForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setResForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Heure</label>
                    <input className="form-control" type="time" required value={resForm.time} onChange={e => setResForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Personnes</label>
                    <select className="form-control" value={resForm.guests} onChange={e => setResForm(f => ({ ...f, guests: parseInt(e.target.value) }))}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea className="form-control" rows={3} value={resForm.message} onChange={e => setResForm(f => ({ ...f, message: e.target.value }))} placeholder="Occasion spéciale, allergies, préférences…" />
                </div>
                <button type="submit" disabled={resSaving} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}>
                  {resSaving ? 'Envoi en cours…' : 'Confirmer la réservation'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══ MES COMMANDES ══ */}
      <section id="ch-orders" style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to right,transparent,var(--gold))' }} />
              <span style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>Historique</span>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to left,transparent,var(--gold))' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--dark)', marginBottom: '0.3rem' }}>Mes commandes</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Suivez l'état de vos commandes</p>
          </div>

          {loading ? <div className="spinner" style={{ margin: '4rem auto' }} /> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>🧾</div>
              <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '0.4rem' }}>Aucune commande</p>
              <p style={{ fontSize: '0.85rem' }}>Votre historique apparaîtra ici</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => {
                const s = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                return (
                  <div key={order.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.4rem 1.6rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.8rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: 'var(--dark)', fontSize: '0.92rem' }}>Commande #{order.id}</span>
                          <span style={{ padding: '0.15rem 0.6rem', borderRadius: 50, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                          <span>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          {order.order_type && <span style={{ textTransform: 'capitalize' }}>{order.order_type === 'delivery' ? 'Livraison' : order.order_type === 'dine_in' ? 'Sur place' : order.order_type}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                        <div style={{ fontWeight: 800, color: 'var(--burgundy)', fontSize: '1.05rem' }}>
                          {parseFloat(order.total_price || order.total || 0).toFixed(0)} MAD
                        </div>
                        <Link to={`/suivi-commande/${order.id}`} style={{ fontSize: '0.75rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                          Suivre →
                        </Link>
                        {order.items?.length > 0 && (
                          <button onClick={() => handleReorder(order)} style={{ background: 'rgba(139,26,46,0.08)', border: '1px solid rgba(139,26,46,0.2)', color: 'var(--burgundy)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,26,46,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,26,46,0.08)'}
                          >
                            🔄 Commander à nouveau
                          </button>
                        )}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {order.items.map((item, i) => (
                          <span key={i} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 20, padding: '0.18rem 0.65rem', fontSize: '0.74rem', color: 'var(--text)' }}>
                            {item.quantity}× {item.product_name || item.product}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
