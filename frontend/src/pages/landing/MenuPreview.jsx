import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuAPI } from '../../services/api';

const ease = [0.25, 0.46, 0.45, 0.94];

// Données de secours si l'API ne retourne rien
const FALLBACK_DISHES = [
  {
    id: 1,
    name: "Saint-Jacques poêlées, beurre noisette",
    description: "Noix de Saint-Jacques de Bretagne snackées en beurre noisette au citron vert, risotto crémeux à la truffe blanche.",
    price: "280",
    image_url: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=600&q=80&auto=format&fit=crop',
    tag: "Entrée Signature",
    fallbackGrad: 'linear-gradient(160deg, #0D1828 0%, #1A2E48 50%, #0A1520 100%)',
    accentColor: '#7FA8C8',
  },
  {
    id: 2,
    name: "L'Épaule d'agneau confite 12h",
    description: "Agneau du Moyen Atlas confit lentement dans ses herbes aromatiques, jus réduit au romarin, purée de carottes safranées.",
    price: "320",
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format&fit=crop',
    tag: "Plat Signature",
    fallbackGrad: 'linear-gradient(160deg, #200D08 0%, #4A2010 50%, #2A1208 100%)',
    accentColor: '#D4834A',
  },
  {
    id: 3,
    name: "Fondant au chocolat cœur velours",
    description: "Coulant au chocolat noir grand cru 72 %, cœur de ganache fleur de sel, quenelle de glace vanille Bourbon.",
    price: "145",
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop',
    tag: "Dessert Signature",
    fallbackGrad: 'linear-gradient(160deg, #180C05 0%, #362010 50%, #160A04 100%)',
    accentColor: '#A0643A',
  },
];

function DishImage({ dish, onHover, onLeave }) {
  const hasImage = !!dish.image_url;

  return (
    <motion.div
      onMouseEnter={() => onHover(dish)}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.35, ease }}
      style={{
        width: 168, height: 168,
        borderRadius: '50%',
        background: hasImage
          ? `url(${dish.image_url}) center / cover no-repeat`
          : (dish.fallbackGrad || 'linear-gradient(135deg,#1a1020,#3d1a2e)'),
        border: `2.5px solid ${(dish.accentColor || 'rgba(201,168,76,0.3)')}50`,
        boxShadow: `0 0 48px ${(dish.accentColor || 'rgba(201,168,76,0.15)')}30, inset 0 0 32px rgba(0,0,0,0.4)`,
        marginBottom: '2.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        cursor: hasImage ? 'zoom-in' : 'default',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Rim interne */}
      <div style={{
        position: 'absolute', inset: 12, borderRadius: '50%',
        border: `1px solid ${(dish.accentColor || 'rgba(201,168,76,0.2)')}40`,
        pointerEvents: 'none',
      }} />
      {/* Glow centre */}
      {!hasImage && (
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `radial-gradient(circle, ${dish.accentColor || '#C9A84C'}25 0%, transparent 70%)`,
        }} />
      )}
    </motion.div>
  );
}

function DishCard({ dish, index, onHover, onLeave }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, delay: index * 0.14, ease }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(201,168,76,0.11)',
        borderRadius: 22,
        padding: '2.5rem 2rem 2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Trait doré en haut */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: `linear-gradient(90deg, transparent, ${dish.accentColor || 'var(--gold)'}60, transparent)`,
      }} />

      <DishImage dish={dish} onHover={onHover} onLeave={onLeave} />

      <span style={{ fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.75rem' }}>
        {dish.tag || (dish.category?.name) || 'Signature'}
      </span>

      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.22rem', color: '#fff', lineHeight: 1.3, marginBottom: '1rem' }}>
        {dish.name}
      </h3>

      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, marginBottom: '2rem', flex: 1 }}>
        {dish.description}
      </p>

      <div style={{ borderTop: '1px solid rgba(201,168,76,0.14)', paddingTop: '1.5rem', width: '100%' }}>
        <span style={{
          fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #C9A84C, #F0D890)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {parseFloat(dish.price).toFixed(0)} MAD
        </span>
      </div>

      {/* Fond ambiant */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${dish.accentColor || 'rgba(201,168,76,0.08)'}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </motion.article>
  );
}

export default function MenuPreview() {
  const [dishes, setDishes]       = useState(FALLBACK_DISHES);
  const [hoveredDish, setHovered] = useState(null);

  useEffect(() => {
    menuAPI.getProducts({ available: true })
      .then(({ data }) => {
        const list = (data.results || data).slice(0, 3);
        if (list.length > 0) {
          // Enrichir avec les couleurs d'accent fallback
          const enriched = list.map((p, i) => ({
            ...p,
            tag:          FALLBACK_DISHES[i]?.tag || 'Signature',
            fallbackGrad: FALLBACK_DISHES[i]?.fallbackGrad,
            accentColor:  FALLBACK_DISHES[i]?.accentColor,
          }));
          setDishes(enriched);
        }
      })
      .catch(() => {/* Silencieux — on garde les données de secours */});
  }, []);

  return (
    <section id="menu-preview" style={{
      background: '#080810', padding: '9rem 1.5rem',
      position: 'relative', overflow: 'visible',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
        opacity: 0.85,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease }}
          style={{ textAlign: 'center', marginBottom: '5.5rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              La Carte
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', color: '#fff', marginBottom: '1.1rem' }}>
            Nos Plats Signatures
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.48)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
            Chaque assiette raconte une histoire — façonnée par notre chef et les meilleurs producteurs du Maroc et d'Europe.
            <br />
            <em style={{ fontSize: '0.8rem', color: 'rgba(201,168,76,0.6)' }}>Passez le curseur sur une photo pour l'agrandir.</em>
          </p>
        </motion.div>

        {/* Grille de cartes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {dishes.map((dish, i) => (
            <DishCard
              key={dish.id}
              dish={dish}
              index={i}
              onHover={setHovered}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>

      </div>

      {/* ── Lightbox zoom au hover ── */}
      <AnimatePresence>
        {hoveredDish && hoveredDish.image_url && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.65, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              style={{
                width: 460, height: 460,
                borderRadius: 24,
                backgroundImage: `url(${hoveredDish.image_url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                boxShadow: '0 48px 120px rgba(0,0,0,0.85)',
                border: '2px solid rgba(201,168,76,0.25)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Légende du plat */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                padding: '2rem 1.5rem 1.5rem',
              }}>
                <p style={{ fontFamily: 'var(--font-head)', color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                  {hoveredDish.name}
                </p>
                <p style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 700 }}>
                  {parseFloat(hoveredDish.price).toFixed(0)} MAD
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
