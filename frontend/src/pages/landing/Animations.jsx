import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94];

/*
  REELS — remplacez les URLs par vos vraies photos.
  Format recommandé : portrait 9:16 ou carré 1:1, min 600px de large.
  Placez vos images dans public/images/animations/ et mettez le chemin ici.
*/
const REELS = [
  {
    id: 1,
    src: 'https://www.laverite.ma/static/uploads/2023/12/Le-Centre-national-de-Tarab-al-Ala-fleuron-dune-expression-artistique-authentique.jpg',
    fallback: 'linear-gradient(160deg, #1a0d20 0%, #3d1a30 40%, #1a0d20 100%)',
    title: 'Andalousia classique',
    subtitle: 'Vendredi & Samedi soir',
    tag: 'Live',
    icon: '🎻',
    accent: '#C9A84C',
  },
  {
    id: 2,
    src: 'https://musicchapel.org/wp-content/uploads/2025/06/04-09-highlights-25-26.jpg',
    fallback: 'linear-gradient(160deg, #080d1a 0%, #1a2540 40%, #080d1a 100%)',
    title: 'Piano live',
    subtitle: 'Tous les soirs · 20h',
    tag: 'Chaque soir',
    icon: '🎹',
    accent: '#8B9EC9',
  },
  {
    id: 3,
    src: 'https://cdn-s-www.dna.fr/images/2D63BF69-E392-4FC1-A92E-1E0F1FA6CE8A/NW_raw/les-danseuses-de-bellydance-passion-ont-donne-leur-spectacle-bellywood-le-samedi-17-juin-au-dome-de-mutzig-photo-dna-bo-ma-les-danseuses-de-bellydance-passion-ont-fait-etal-de-leur-maitrise-de-la-danse-du-ventre-lors-du-spectacle-bellywood-photo-dna-boris-marois-1687111071.jpg',
    fallback: 'linear-gradient(160deg, #1a0808 0%, #3d1010 40%, #1a0808 100%)',
    title: 'Danse orientale',
    subtitle: 'Samedi & Dimanche · 21h',
    tag: 'Weekend',
    icon: '💃',
    accent: '#C97A8B',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80&auto=format&fit=crop',
    fallback: 'linear-gradient(160deg, #081a10 0%, #123d20 40%, #081a10 100%)',
    title: 'Jazz & Soul',
    subtitle: 'Jeudi — soirée spéciale',
    tag: 'Spécial',
    icon: '🎷',
    accent: '#7AC994',
  },
  {
    id: 5,
    src: 'https://f2.hespress.com/wp-content/uploads/2019/10/4d989afbdeebb62c640b98375162f866-e1570372385348.jpg',
    fallback: 'linear-gradient(160deg, #1a1208 0%, #3d2a10 40%, #1a1208 100%)',
    title: 'Ambiance Velours ',
    subtitle: 'Une expérience unique',
    tag: 'Signature',
    icon: '✨',
    accent: '#C9A84C',
  },
];

function ReelCard({ reel, index, isActive, onClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease }}
      onClick={() => onClick(reel)}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: isActive ? 260 : 180,
        height: isActive ? 420 : 300,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isActive
          ? `0 32px 80px rgba(0,0,0,0.7), 0 0 0 2px ${reel.accent}55`
          : '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: reel.fallback,
      }} />

      {/* Photo */}
      {!imgError && (
        <motion.img
          src={reel.src}
          alt={reel.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          animate={{ scale: isActive ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.4s',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* Placeholder icon when no photo */}
      {(imgError || !imgLoaded) && (
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: isActive ? '4rem' : '2.5rem',
          opacity: 0.6,
          transition: 'font-size 0.4s',
        }}>
          {reel.icon}
        </div>
      )}

      {/* Tag */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: reel.accent,
        color: '#000',
        fontSize: '0.6rem', fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '0.25rem 0.6rem', borderRadius: 50,
      }}>
        {reel.tag}
      </div>

      {/* Play / expand indicator */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        {isActive ? (
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        )}
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '1.25rem 1rem 1rem',
      }}>
        <div style={{
          fontSize: isActive ? '1rem' : '0.78rem',
          fontFamily: 'var(--font-head)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.3, marginBottom: '0.3rem',
          transition: 'font-size 0.4s',
        }}>
          {reel.title}
        </div>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}
            >
              {reel.subtitle}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Colored bar */}
        <div style={{
          height: 2, borderRadius: 1,
          background: reel.accent,
          marginTop: '0.6rem',
          width: isActive ? '60%' : '30%',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </motion.div>
  );
}

/* ── Lightbox ── */
function Lightbox({ reel, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.35, ease }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 460,
          aspectRatio: '9/16',
          borderRadius: 24,
          overflow: 'hidden',
          background: reel.fallback,
          boxShadow: `0 48px 120px rgba(0,0,0,0.85), 0 0 0 2px ${reel.accent}44`,
        }}
      >
        {!imgError && (
          <img
            src={reel.src}
            alt={reel.title}
            onError={() => setImgError(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {imgError && (
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '6rem', opacity: 0.5,
          }}>{reel.icon}</div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.88) 100%)',
        }} />

        {/* Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.75rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: reel.accent, color: '#000',
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '0.25rem 0.65rem', borderRadius: 50,
            marginBottom: '0.75rem',
          }}>
            {reel.icon} {reel.tag}
          </div>
          <h3 style={{ fontFamily: 'var(--font-head)', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {reel.title}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{reel.subtitle}</p>
        </div>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>✕</button>
      </motion.div>
    </motion.div>
  );
}

export default function Animations() {
  const [activeId,   setActiveId]   = useState(REELS[0].id);
  const [lightbox,   setLightbox]   = useState(null);
  const stripRef = useRef(null);

  const handleClick = (reel) => {
    if (activeId === reel.id) {
      setLightbox(reel);
    } else {
      setActiveId(reel.id);
    }
  };

  // Horizontal drag-scroll on the strip
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const down  = (e) => { isDown = true; startX = (e.pageX || e.touches?.[0]?.pageX) - el.offsetLeft; scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const leave = () => { isDown = false; el.style.cursor = 'grab'; };
    const move  = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x    = (e.pageX || e.touches?.[0]?.pageX) - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('mouseup', leave);
    el.addEventListener('mousemove', move);
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchend', leave);
    el.addEventListener('touchmove', move, { passive: false });
    return () => {
      el.removeEventListener('mousedown', down);
      el.removeEventListener('mouseleave', leave);
      el.removeEventListener('mouseup', leave);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchend', leave);
      el.removeEventListener('touchmove', move);
    };
  }, []);

  return (
    <section id="animations" style={{
      background: 'linear-gradient(180deg, #0B0615 0%, #080810 100%)',
      padding: '9rem 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top divider */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 500,
        background: 'radial-gradient(ellipse at center, rgba(139,26,46,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Section header */}
      <div style={{ padding: '0 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease }}
          style={{ textAlign: 'center', marginBottom: '3.5rem', maxWidth: 600, margin: '0 auto 3.5rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to right, transparent, var(--gold))', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Live Performances
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.1rem, 5vw, 3.6rem)',
            color: '#fff', marginBottom: '1.1rem',
          }}>
            La Scène de{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Maison Velours
            </span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
            Cliquez sur un reel pour agrandir · Glissez pour explorer
          </p>
        </motion.div>
      </div>

      {/* Reels strip */}
      <div
        ref={stripRef}
        style={{
          display: 'flex',
          gap: '1rem',
          paddingLeft: 'max(1.5rem, calc((100vw - 1200px) / 2))',
          paddingRight: 'max(1.5rem, calc((100vw - 1200px) / 2))',
          paddingBottom: '1rem',
          overflowX: 'auto',
          alignItems: 'center',
          cursor: 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`.animations-strip::-webkit-scrollbar { display: none; }`}</style>
        {REELS.map((reel, i) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            index={i}
            isActive={activeId === reel.id}
            onClick={handleClick}
          />
        ))}
      </div>


      {/* Info cards */}
      <div style={{ maxWidth: 1200, margin: '3rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {REELS.map((reel, i) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
              onClick={() => setActiveId(reel.id)}
              style={{
                background: activeId === reel.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${activeId === reel.id ? reel.accent + '55' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14, padding: '1.1rem 1.25rem',
                cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{reel.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  {reel.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                  {reel.subtitle}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox reel={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </section>
  );
}
