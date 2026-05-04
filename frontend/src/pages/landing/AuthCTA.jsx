import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94];

function AuthCard({ icon, title, subtitle, description, links, delay, borderColor, glowColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease }}
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${borderColor}`,
        borderRadius: 24,
        padding: '3rem 2.5rem',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Glow d'ambiance */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: '50%',
        background: `radial-gradient(ellipse at top, ${glowColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Coin doré en haut à gauche */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        width: 24, height: 24,
        borderTop: `1.5px solid ${borderColor}`,
        borderLeft: `1.5px solid ${borderColor}`,
        borderRadius: '3px 0 0 0',
      }} />

      {/* Icône */}
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        border: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.75rem',
        background: `${glowColor}`,
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
      </div>

      {/* Contenu */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.6rem' }}>
          {subtitle}
        </p>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', color: '#fff', lineHeight: 1.25, marginBottom: '1.1rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, marginBottom: '2.5rem' }}>
          {description}
        </p>
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
        {links.map(({ label, to, primary }) => (
          <motion.div key={to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={to} style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.9rem 1.5rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              ...(primary
                ? {
                    background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 50%, #C9A84C 100%)',
                    color: '#0A0A0F',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                  }
                : {
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  })
            }}>
              {label}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AuthCTA() {
  return (
    <section id="auth-cta" style={{
      background: 'linear-gradient(180deg, #05050A 0%, #0B0615 100%)',
      padding: '9rem 1.5rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              Accès
            </span>
            <div style={{ height: 1, width: 52, background: 'linear-gradient(to left, transparent, var(--gold))', opacity: 0.55 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', color: '#fff', marginBottom: '1.1rem' }}>
            Rejoignez l'expérience
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
            Commandez en ligne, suivez vos livraisons et bénéficiez d'offres exclusives — ou gérez l'établissement depuis votre espace admin.
          </p>
        </motion.div>

        {/* Deux cartes */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <AuthCard
            icon="🍽️"
            subtitle="Espace Client"
            title="Commandez et savourez"
            description="Accédez à toute la carte, passez vos commandes (sur place, à emporter ou en livraison), suivez en temps réel et payez en ligne en toute sécurité avec Stripe."
            borderColor="rgba(201,168,76,0.15)"
            glowColor="rgba(201,168,76,0.06)"
            delay={0}
            links={[
              { label: "Créer un compte — c'est gratuit", to: '/register', primary: true },
              { label: 'Déjà client ? Se connecter',      to: '/login',    primary: false },
            ]}
          />
          <AuthCard
            icon="⚙️"
            subtitle="Espace Administration"
            title="Gérez l'établissement"
            description="Tableau de bord complet : gestion du menu, suivi des commandes en temps réel, gestion des tables, zones de livraison, statistiques et paiements."
            borderColor="rgba(139,26,46,0.25)"
            glowColor="rgba(139,26,46,0.08)"
            delay={0.15}
            links={[
              { label: 'Accès Administrateur', to: '/login', primary: true },
            ]}
          />
        </div>

        {/* Badges de confiance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '2rem',
            justifyContent: 'center', marginTop: '4rem',
          }}
        >
          {[
            { icon: '🔒', label: 'Paiement sécurisé Stripe' },
            { icon: '⚡', label: 'Commande en 2 minutes' },
            { icon: '📍', label: 'Livraison à Casablanca' },
            { icon: '🎁', label: 'Offres membres exclusives' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
