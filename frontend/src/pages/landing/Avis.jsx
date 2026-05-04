import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94];

const REVIEWS = [
  {
    id: 1,
    name: 'Nadia B.',
    initials: 'NB',
    date: 'Mars 2025',
    stars: 5,
    color: '#8B1A2E',
    text: 'Une soirée absolument mémorable. L\'épaule d\'agneau était d\'une tendresse incomparable, et le service d\'une discrétion et d\'une attention rares. Maison Velours s\'impose comme l\'adresse incontournable de Casablanca.',
  },
  {
    id: 2,
    name: 'Youssef M.',
    initials: 'YM',
    date: 'Février 2025',
    stars: 5,
    color: '#1A3050',
    text: 'Le cadre est à couper le souffle — on se croirait dans un roman parisien des années 30. La cave à vins est exceptionnelle, le sommelier nous a guidés vers une bouteille parfaite pour notre repas. Un grand restaurant.',
  },
  {
    id: 3,
    name: 'Amina R.',
    initials: 'AR',
    date: 'Janvier 2025',
    stars: 5,
    color: '#2E2010',
    text: 'Le fondant au chocolat cœur velours… je n\'exagère pas en disant que c\'est le meilleur dessert que j\'ai mangé de ma vie. Mon mari et moi sommes déjà clients fidèles. La qualité est constante à chaque visite.',
  },
  {
    id: 4,
    name: 'Karim T.',
    initials: 'KT',
    date: 'Décembre 2024',
    stars: 5,
    color: '#0D3020',
    text: 'Nous avons fêté notre anniversaire de mariage chez Maison Velours. L\'équipe avait préparé une surprise magnifique. Un restaurant qui comprend ce que signifie vraiment l\'hospitalité. Nous reviendrons.',
  },
  {
    id: 5,
    name: 'Sofia E.',
    initials: 'SE',
    date: 'Novembre 2024',
    stars: 5,
    color: '#1A0820',
    text: 'Le bar à cocktails vaut à lui seul le déplacement. Le chef barman est un artiste. Les Saint-Jacques étaient parfaitement snackées, le risotto à la truffe… un équilibre remarquable. Une valeur sûre.',
  },
];

function Stars({ count }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= count ? '#C9A84C' : 'rgba(201,168,76,0.2)'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Avis() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(a => (a - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setActive(a => (a + 1) % REVIEWS.length);

  const review = REVIEWS[active];

  return (
    <section id="avis" style={{
      background: 'linear-gradient(180deg, #080810 0%, #05050A 100%)',
      padding: '9rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />

      {/* Fond ambiant */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 700,
        background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Témoignages
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', color: '#fff', marginBottom: '1rem' }}>
            Ce que disent nos clients
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.95rem', lineHeight: 1.75 }}>
            Des expériences authentiques, partagées par ceux qui nous ont fait confiance.
          </p>
        </motion.div>

        {/* Carrousel */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{    opacity: 0, x: -60 }}
              transition={{ duration: 0.45, ease }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 24,
                padding: '3.5rem',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Grand guillemet décoratif */}
              <div style={{
                position: 'absolute', top: -16, left: 28,
                fontFamily: 'var(--font-head)',
                fontSize: '9rem', lineHeight: 1,
                color: 'rgba(201,168,76,0.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}>"</div>

              {/* Étoiles */}
              <div style={{ marginBottom: '1.75rem' }}>
                <Stars count={review.stars} />
              </div>

              {/* Texte */}
              <p style={{
                fontFamily: 'var(--font-head)', fontStyle: 'italic',
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.75,
                marginBottom: '2.5rem',
                position: 'relative', zIndex: 1,
              }}>
                "{review.text}"
              </p>

              {/* Auteur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${review.color}, ${review.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                  flexShrink: 0,
                }}>
                  {review.initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                    {review.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: '0.15rem' }}>
                    {review.date} · Casablanca
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase',
                    border: '1px solid rgba(201,168,76,0.2)',
                    padding: '0.25rem 0.75rem', borderRadius: 20,
                  }}>
                    Client vérifié
                  </div>
                </div>
              </div>

              {/* Coin doré */}
              <div style={{
                position: 'absolute', bottom: 20, right: 28,
                width: 24, height: 24,
                borderBottom: '1.5px solid rgba(201,168,76,0.3)',
                borderRight: '1.5px solid rgba(201,168,76,0.3)',
                borderRadius: '0 0 3px 0',
              }} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(201,168,76,0.25)',
                background: 'rgba(201,168,76,0.06)',
                color: 'var(--gold)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </motion.button>

            {/* Indicateurs */}
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: i === active ? 28 : 8,
                height: 8, borderRadius: 4,
                background: i === active ? 'var(--gold)' : 'rgba(201,168,76,0.2)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }} />
            ))}

            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(201,168,76,0.25)',
                background: 'rgba(201,168,76,0.06)',
                color: 'var(--gold)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </motion.button>
          </div>

          {/* Note globale */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <Stars count={5} />
              <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>4.9</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>sur 5 · Plus de 280 avis</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
