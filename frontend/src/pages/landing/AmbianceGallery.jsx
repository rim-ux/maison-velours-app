import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94];

const CELLS = [
  {
    key: 'main',
    label: 'La Salle Principale',
    sub: 'Une scène entre ombre et lumière, pensée pour les grands moments',
    grad: 'linear-gradient(160deg, #1C0510 0%, #420D22 45%, #200810 100%)',
    glow: 'rgba(139,26,46,0.5)',
    className: 'bento-main',
  },
{
  key: 'bar',
  label: 'Le Bar à Cocktails',
  sub: "Mixologie d'exception par notre barman exécutif", 
  grad: 'linear-gradient(145deg, #0D1828 0%, #1A3050 50%, #0A1520 100%)',
  glow: 'rgba(50,100,190,0.35)',
  className: 'bento-bar',
},
  {
    key: 'cave',
    label: 'Notre Cave',
    sub: '600 références soigneusement sélectionnées',
    grad: 'linear-gradient(145deg, #130E05 0%, #2E2010 50%, #1A1408 100%)',
    glow: 'rgba(201,168,76,0.3)',
    className: 'bento-cave',
  },
  {
    key: 'terrasse',
    label: 'La Terrasse',
    sub: 'Dîner sous les étoiles de Casablanca',
    grad: 'linear-gradient(145deg, #0A1525 0%, #152035 50%, #0C1828 100%)',
    glow: 'rgba(40,80,160,0.25)',
    className: 'bento-terrasse',
  },
  {
    key: 'accueil',
    label: 'L\'Accueil',
    sub: 'Un service discret et attentionné',
    grad: 'linear-gradient(145deg, #1A0810 0%, #380E1E 50%, #1C0810 100%)',
    glow: 'rgba(139,26,46,0.25)',
    className: 'bento-accueil',
  },
  {
    key: 'detail',
    label: 'Les Détails qui font la différence',
    sub: 'De la fleur fraîche à la vaisselle signée — chaque détail est pensé',
    grad: 'linear-gradient(160deg, #120D08 0%, #2A1C0F 50%, #1A1008 100%)',
    glow: 'rgba(201,168,76,0.22)',
    className: 'bento-detail',
  },
];

function BentoCell({ cell, index }) {
  const isMain = cell.key === 'main';
  const isDetail = cell.key === 'detail';

  return (
    <motion.div
      className={`bento-cell ${cell.className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease }}
      whileHover={{ scale: 1.018, transition: { duration: 0.3 } }}
      style={{
        background: cell.grad,
        borderRadius: 18,
        padding: isDetail ? '2rem 2.5rem' : '2.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)',
        cursor: 'default',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '70%', height: '70%',
        background: `radial-gradient(ellipse at center, ${cell.glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Large cell: decorative circle */}
      {isMain && (
        <>
          <div style={{
            position: 'absolute', top: '25%', right: '-8%',
            width: 240, height: 240, borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.08)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '35%', right: '5%',
            width: 120, height: 120, borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.06)',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Gold corner accent */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        width: 28, height: 28,
        borderTop: '1.5px solid rgba(201,168,76,0.35)',
        borderLeft: '1.5px solid rgba(201,168,76,0.35)',
        borderRadius: '3px 0 0 0',
        pointerEvents: 'none',
      }} />

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-head)',
          fontSize: isMain ? '1.8rem' : '1.1rem',
          color: '#fff',
          lineHeight: 1.25,
          marginBottom: '0.5rem',
        }}>
          {cell.label}
        </h3>
        <p style={{
          fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.6, maxWidth: isMain ? 280 : 'none',
        }}>
          {cell.sub}
        </p>
      </div>
    </motion.div>
  );
}

export default function AmbianceGallery() {
  return (
    <section id="ambiance" style={{
      background: '#05050A', padding: '9rem 1.5rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease }}
          style={{ textAlign: 'center', marginBottom: '4.5rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Notre Espace
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.1rem, 5vw, 3.6rem)',
            color: '#fff', marginBottom: '1.1rem',
          }}>
            L'Atmosphère Maison Velours
          </h2>
          <p style={{
            fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)',
            maxWidth: 500, margin: '0 auto', lineHeight: 1.75,
          }}>
            Chaque recoin a été pensé pour offrir une expérience sensorielle unique —
            entre ombre et lumière, velours et or.
          </p>
        </motion.div>

        {/* ── Cartes de présentation ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          {/* Carte 1 : La Salle */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
            style={{
              height: 420,
              borderRadius: 20,
              background: 'linear-gradient(160deg, #1C0510 0%, #420D22 45%, #200810 100%)',
              border: '1px solid rgba(201,168,76,0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2.5rem',
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', top: '20%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%', height: '60%',
              background: 'radial-gradient(ellipse at center, rgba(139,26,46,0.5) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            {/* Decorative arcs */}
            {[300, 440].map(sz => (
              <div key={sz} style={{
                position: 'absolute', top: '22%', right: '-12%',
                width: sz, height: sz, borderRadius: '50%',
                border: '1px solid rgba(201,168,76,0.07)',
                pointerEvents: 'none',
              }} />
            ))}
            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: 22, left: 22,
              width: 28, height: 28,
              borderTop: '1.5px solid rgba(201,168,76,0.4)',
              borderLeft: '1.5px solid rgba(201,168,76,0.4)',
              borderRadius: '3px 0 0 0',
            }} />
            <div style={{
              position: 'absolute', bottom: 22, right: 22,
              width: 28, height: 28,
              borderBottom: '1.5px solid rgba(201,168,76,0.4)',
              borderRight: '1.5px solid rgba(201,168,76,0.4)',
              borderRadius: '0 0 3px 0',
            }} />
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{
                display: 'block',
                fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'var(--gold)', fontWeight: 700, marginBottom: '0.85rem',
              }}>
                Notre Espace
              </span>
              <h3 style={{
                fontFamily: 'var(--font-head)', fontSize: '2rem',
                color: '#fff', lineHeight: 1.2, marginBottom: '0.75rem',
              }}>
                La Salle
              </h3>
              <p style={{
                fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7, maxWidth: 320,
              }}>
                Une scène entre ombre et lumière, pensée pour les grands moments. Velours, or mat et bois noble composent un décor intemporel.
              </p>
            </div>
          </motion.div>

          {/* Carte 2 : Notre Ambiance — effet Ken Burns */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            style={{
              height: 420,
              borderRadius: 20,
              border: '1px solid rgba(201,168,76,0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2.5rem',
            }}
          >
            {/* Ken Burns animated background */}
            <motion.div
              animate={{ scale: [1, 1.14], x: ['0%', '-4%'], y: ['0%', '-3%'] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: '-12%',
                backgroundImage: `url('/images/ambiance-restaurant.jpg'),
                  linear-gradient(145deg, #0D1828 0%, #1A3050 40%, #2A1830 70%, #0A1520 100%)`,
                backgroundSize: 'cover, 100% 100%',
                backgroundPosition: 'center, center',
                backgroundRepeat: 'no-repeat, no-repeat',
              }}
            />
            {/* Dark gradient overlay for legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(5,5,15,0.92) 0%, rgba(5,5,15,0.55) 50%, rgba(5,5,15,0.2) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: 22, left: 22,
              width: 28, height: 28,
              borderTop: '1.5px solid rgba(201,168,76,0.4)',
              borderLeft: '1.5px solid rgba(201,168,76,0.4)',
              borderRadius: '3px 0 0 0',
            }} />
            <div style={{
              position: 'absolute', bottom: 22, right: 22,
              width: 28, height: 28,
              borderBottom: '1.5px solid rgba(201,168,76,0.4)',
              borderRight: '1.5px solid rgba(201,168,76,0.4)',
              borderRadius: '0 0 3px 0',
            }} />
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{
                display: 'block',
                fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'var(--gold)', fontWeight: 700, marginBottom: '0.85rem',
              }}>
                L'Atmosphère
              </span>
              <h3 style={{
                fontFamily: 'var(--font-head)', fontSize: '2rem',
                color: '#fff', lineHeight: 1.2, marginBottom: '0.75rem',
              }}>
                Notre Ambiance
              </h3>
              <p style={{
                fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7, maxWidth: 320,
              }}>
                Entre ombre et lumière, velours et or — chaque soir, une atmosphère unique façonnée pour l'excellence.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {CELLS.map((cell, i) => <BentoCell key={cell.key} cell={cell} index={i} />)}
        </div>
      </div>
    </section>
  );
}
