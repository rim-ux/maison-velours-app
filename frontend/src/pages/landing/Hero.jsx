import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94];

const PARTICLES = [
  { size: 3, left: 12, top: 22, delay: 0,   dur: 5 },
  { size: 2, left: 79, top: 38, delay: 1.3, dur: 4 },
  { size: 4, left: 35, top: 68, delay: 0.6, dur: 6 },
  { size: 2, left: 58, top: 15, delay: 2.1, dur: 4.5 },
  { size: 3, left: 90, top: 55, delay: 0.9, dur: 5.5 },
  { size: 2, left: 22, top: 82, delay: 1.7, dur: 3.8 },
  { size: 3, left: 65, top: 78, delay: 3.0, dur: 5 },
  { size: 2, left: 47, top: 44, delay: 0.4, dur: 6.5 },
  { size: 4, left: 8,  top: 60, delay: 2.5, dur: 4 },
  { size: 2, left: 88, top: 20, delay: 1.1, dur: 5.2 },
];

export default function Hero() {
  const { scrollY } = useScroll();

  // Parallax: background moves at 30 % du scroll, créant la profondeur
  const bgY = useTransform(scrollY, [0, 700], ['0%', '28%']);
  // Légère opacité sur le contenu qui disparaît en scrollant
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const contentY       = useTransform(scrollY, [0, 400], ['0%', '-12%']);

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: '#080810',
    }}>
      {/* ── Parallax background photo ── */}
      {/* Pour ajouter une vraie photo : placez hero-restaurant.jpg dans public/images/ */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-20%',
          y: bgY,
          backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format&fit=crop'), linear-gradient(160deg,
            #1C0510 0%, #3D0E20 12%, #200810 28%,
            #0D1828 48%, #1A3050 68%, #100820 85%, #050508 100%)`,
          backgroundSize: 'cover, 100% 100%',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
          willChange: 'transform',
        }}
      />

      {/* ── Overlay sombre dégradé (lisibilité + thème) ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          linear-gradient(180deg, rgba(8,8,16,0.65) 0%, rgba(8,8,16,0.45) 40%, rgba(8,8,16,0.75) 100%),
          radial-gradient(ellipse 70% 60% at 65% 35%, rgba(139,26,46,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 20% 80%, rgba(201,168,76,0.08) 0%, transparent 55%)
        `,
      }} />

      {/* ── Grille de texture subtile ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(to right, rgba(201,168,76,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(201,168,76,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }} />

      {/* ── Particules dorées ── */}
      {PARTICLES.map((p, i) => (
        <motion.div key={i}
          animate={{ y: [0, -14, 0], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'rgba(201,168,76,0.75)',
            left: `${p.left}%`, top: `${p.top}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Cercles décoratifs ── */}
      {[520, 720].map(size => (
        <div key={size} style={{
          position: 'absolute',
          width: size, height: size, borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.06)',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Contenu principal ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        transition={{ ease }}
      >
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: 820 }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.75rem' }}
          >
            <div style={{ height: 1, width: 56, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.65 }} />
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Casablanca · Restaurant Gastronomique
            </span>
            <div style={{ height: 1, width: 56, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.65 }} />
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.18, ease }}
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(3.2rem, 9vw, 7rem)',
              fontWeight: 700, lineHeight: 1.08,
              color: '#fff', marginBottom: '1.5rem',
              textShadow: '0 4px 60px rgba(0,0,0,0.7)',
            }}
          >
            Maison{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Velours
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.38, ease }}
            style={{
              fontFamily: 'var(--font-head)', fontStyle: 'italic',
              fontSize: 'clamp(1.05rem, 2.5vw, 1.55rem)',
              color: 'rgba(255,255,255,0.72)',
              marginBottom: '3.25rem', lineHeight: 1.55,
            }}
          >
            Elevating everyday cravings into extraordinary experiences.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.58, ease }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              onClick={() => document.getElementById('auth-cta')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05, boxShadow: '0 16px 48px rgba(201,168,76,0.55)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                color: '#0A0A0F',
                padding: '1rem 2.75rem', borderRadius: 10,
                fontSize: '0.88rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 6px 28px rgba(201,168,76,0.38)',
              }}
            >
              Commander / Se connecter
            </motion.button>

            <motion.button
              onClick={() => document.getElementById('menu-preview')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.6)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent', color: '#fff',
                padding: '1rem 2.75rem', borderRadius: 10,
                fontSize: '0.88rem', fontWeight: 500,
                letterSpacing: '0.05em',
                border: '1px solid rgba(255,255,255,0.28)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              Découvrir la carte
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Indicateur de défilement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        style={{
          position: 'absolute', bottom: '2.5rem',
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        }}
      >
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
          Défiler
        </span>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(201,168,76,0.8), transparent)', transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  );
}
