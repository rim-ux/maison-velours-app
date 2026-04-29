import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.brand}>
          <span style={styles.logoIcon}>🍷</span>
          <div>
            <div style={styles.logoName}>Maison Velours</div>
            <div style={styles.logoSub}>Restaurant Gastronomique</div>
          </div>
        </div>
        <div style={styles.info}>
          <p>📍 123 Avenue Mohamed V, Casablanca</p>
          <p>📞 +212 5 22 00 00 00</p>
          <p>⏰ Lun–Sam : 12h00 – 23h00</p>
        </div>
        <div style={styles.copyright}>
          <p>© 2024 Maison Velours. Tous droits réservés.</p>
          <p style={{ color: 'var(--gold)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
            Réalisé par HIDDANE Rim &amp; ABOULKACEM Karima — EMSI
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: 'var(--dark)', color: 'rgba(255,255,255,0.7)', marginTop: 'auto' },
  inner: {
    display: 'flex', flexWrap: 'wrap',
    justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '2rem', padding: '2.5rem 1.5rem',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoIcon: { fontSize: '2rem' },
  logoName: { fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--white)', fontWeight: 700 },
  logoSub: { fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  info: { display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' },
  copyright: { fontSize: '0.8rem', textAlign: 'right' },
};
