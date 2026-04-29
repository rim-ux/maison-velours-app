import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70&auto=format&fit=crop';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inCart = items.find((i) => i.id === product.id);

  const imgSrc = (!imgErr && product.image_url) ? product.image_url : PLACEHOLDER;

  return (
    <article
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.18)'
          : '0 2px 12px rgba(0,0,0,0.07)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card"
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        <img
          src={imgSrc}
          alt={product.name}
          style={{
            ...styles.img,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
          onError={() => setImgErr(true)}
        />
        {/* Overlay on hover */}
        <div style={{
          ...styles.imgOverlay,
          opacity: hovered ? 1 : 0,
        }} />
        {/* Unavailable banner */}
        {!product.available && (
          <div style={styles.unavailable}>Indisponible</div>
        )}
        {/* Cart indicator */}
        {inCart && (
          <div style={styles.cartBadge}>
            {inCart.quantity}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={styles.body}>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description && (
          <p style={styles.desc}>{product.description}</p>
        )}
        <div style={styles.footer}>
          <div>
            <span style={styles.price}>{parseFloat(product.price).toFixed(2)}</span>
            <span style={styles.currency}> MAD</span>
          </div>
          {product.available ? (
            <button
              onClick={() => addItem(product)}
              style={{
                ...styles.addBtn,
                background: inCart ? 'var(--success)' : 'var(--burgundy)',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {inCart ? (
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              )}
              {inCart ? `Ajouté (${inCart.quantity})` : 'Ajouter'}
            </button>
          ) : (
            <span style={styles.soldOut}>Épuisé</span>
          )}
        </div>
      </div>
    </article>
  );
}

const styles = {
  card: {
    display: 'flex', flexDirection: 'column',
    background: '#fff',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
    cursor: 'default',
  },
  imgWrap: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    background: 'var(--cream-dk)',
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
  },
  imgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(139,26,46,0.3) 0%, transparent 60%)',
    transition: 'opacity 0.35s ease',
  },
  unavailable: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '0.85rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  cartBadge: {
    position: 'absolute', top: 10, right: 10,
    background: 'var(--success)',
    color: '#fff',
    width: 26, height: 26,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  body: {
    padding: '1.1rem',
    flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  name: {
    fontFamily: 'var(--font-head)',
    fontSize: '1rem',
    color: 'var(--dark)',
    lineHeight: 1.3,
  },
  desc: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    flex: 1, lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.75rem',
  },
  price: { fontWeight: 800, color: 'var(--burgundy)', fontSize: '1.1rem', fontFamily: 'var(--font-head)' },
  currency: { fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontSize: '0.8rem', fontWeight: 600,
    border: 'none', cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(139,26,46,0.3)',
    fontFamily: 'var(--font-body)',
  },
  soldOut: {
    fontSize: '0.75rem', fontWeight: 700,
    color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
  },
};
