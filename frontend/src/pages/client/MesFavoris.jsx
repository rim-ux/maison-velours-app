import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../../services/api';
import { useCart }  from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function MesFavoris() {
  const { addItem }  = useCart();
  const toast        = useToast();
  const navigate     = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [addedId,  setAddedId]  = useState(null);
  const [removing, setRemoving] = useState(null);

  const load = () => {
    setLoading(true);
    favoritesAPI.products()
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = (p) => {
    addItem(p);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
    toast.push(`${p.name} ajouté au panier`, { icon: '🛒' });
  };

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await favoritesAPI.toggle(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.push('Retiré des favoris', { icon: '🤍' });
    } catch {}
    setRemoving(null);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={s.title}>❤️ Mes Favoris</h1>
          {!loading && <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: 0 }}>{products.length} produit{products.length !== 1 ? 's' : ''} sauvegardé{products.length !== 1 ? 's' : ''}</p>}
        </div>
        <Link to="/accueil" className="btn btn-outline btn-sm">← Retour au menu</Link>
      </div>

      {loading ? (
        <div className="spinner" style={{ marginTop: 80 }} />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🤍</div>
          <h3>Aucun favori</h3>
          <p>Parcourez le menu et cliquez sur 🤍 pour sauvegarder vos plats préférés.</p>
          <Link to="/accueil" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Découvrir le menu</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
          {products.map(p => {
            const isAdded   = addedId === p.id;
            const isRemoving = removing === p.id;
            return (
              <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.22s, box-shadow 0.22s', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Image */}
                <div style={{ position: 'relative' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg,var(--cream-dk),var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🍽️</div>
                  }
                  {/* Remove from favorites */}
                  <button onClick={() => handleRemove(p.id)} disabled={isRemoving} title="Retirer des favoris"
                    style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: isRemoving ? 0.5 : 1, backdropFilter: 'blur(4px)', transition: 'transform 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ❤️
                  </button>
                </div>

                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', color: 'var(--dark)', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</h4>
                    <span style={{ fontWeight: 800, color: 'var(--burgundy)', fontSize: '0.9rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{parseFloat(p.price).toFixed(0)} MAD</span>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: '0.77rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '0.85rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.description}
                    </p>
                  )}
                  {p.category_name && (
                    <span style={{ display: 'inline-block', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                      {p.category_name}
                    </span>
                  )}
                  <button onClick={() => handleAdd(p)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: isAdded ? 'rgba(39,174,96,0.12)' : 'rgba(139,26,46,0.07)', border: `1px solid ${isAdded ? 'rgba(39,174,96,0.35)' : 'rgba(139,26,46,0.2)'}`, color: isAdded ? '#27AE60' : 'var(--burgundy)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.22s' }}>
                    {isAdded ? '✓ Ajouté au panier' : '+ Ajouter au panier'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Go to cart CTA */}
      {products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/panier')} style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Voir le panier
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  title: { fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--dark)', margin: 0 },
};
