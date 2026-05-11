import React, { useState } from 'react';
import { motion } from 'framer-motion';

import LandingNavbar from './LandingNavbar';
import Hero          from './Hero';
import MenuPreview   from './MenuPreview';
import Animations    from './Animations';
import Avis          from './Avis';

import './Home.css';

const ease = [0.25, 0.46, 0.45, 0.94];

/* ── Section: About Us / Notre Histoire (chef story) ── */
function AboutUs() {
  return (
    <section id="histoire" style={{
      background: 'linear-gradient(180deg, #0B0615 0%, #100820 100%)',
      padding: '9rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, var(--burgundy) 25%, var(--gold) 50%, var(--burgundy) 75%, transparent)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(139,26,46,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}
        className="histoire-grid"
      >
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ height: 1, width: 40, background: 'var(--gold)', opacity: 0.55 }} />
            <span style={{ fontSize: '0.66rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              About Us
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2rem, 4vw, 3.1rem)',
            color: '#ffffff', lineHeight: 1.2, marginBottom: '2rem',
          }}>
            Born from passion,<br />
            <span style={{ color: 'var(--gold)' }}>forged by excellence</span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.52)', lineHeight: 1.85, fontSize: '0.97rem', marginBottom: '1.5rem' }}>
            Founded in 2019 in the heart of Casablanca's Gauthier district, Maison Velours was born from
            the meeting of a bold culinary vision and a deep love for Moroccan hospitality.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.52)', lineHeight: 1.85, fontSize: '0.97rem', marginBottom: '2.5rem' }}>
            Our executive chef, trained in the finest kitchens of Europe, chose to return to Casablanca
            to create a restaurant that embodies both classical refinement and the generosity of Moroccan gastronomy.
          </p>

        </motion.div>

        {/* Right: chef quote card */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: 22, padding: '3rem 2.5rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -24, left: 32,
              fontFamily: 'var(--font-head)', fontSize: '8rem', lineHeight: 1,
              color: 'rgba(201,168,76,0.12)', userSelect: 'none',
            }}>"</div>

            <p style={{
              fontFamily: 'var(--font-head)', fontStyle: 'italic',
              fontSize: '1.2rem', color: '#ffffff',
              lineHeight: 1.7, marginBottom: '2rem', position: 'relative', zIndex: 1,
            }}>
              Cooking is giving pleasure to those who welcome us.
              At Maison Velours, every evening is a premiere.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800, color: '#fff',
              }}>KA</div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
                  Karim Alaoui
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Executive Chef & Founder
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', gap: '2rem',
              marginTop: '2.5rem', paddingTop: '2rem',
              borderTop: '1px solid rgba(201,168,76,0.1)',
            }}>
              {[
                { val: '2019', label: 'Opening' },
                { val: '4.9★', label: 'Avg rating' },
                { val: '12+', label: 'Signature dishes' },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 700 }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Contact / Footer ── */
function ContactFooter() {
  return (
    <footer id="contact" style={{
      background: '#030308', padding: '6rem 1.5rem 3rem',
      position: 'relative', borderTop: '1px solid rgba(201,168,76,0.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem', marginBottom: '4rem',
        }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 9,
                background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dk))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em',
              }}>MV</div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>Maison Velours</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Restaurant Gastronomique</div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.75 }}>
              The art of the table in the heart of Casablanca — a culinary experience crafted in every detail.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease }}>
            <h4 style={{ fontFamily: 'var(--font-head)', color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Hours</h4>
            {[
              { j: 'Tuesday — Friday', h: '7:30pm — 11:00pm' },
              { j: 'Saturday — Sunday', h: '7:00pm — 11:30pm' },
              { j: 'Monday', h: 'Closed' },
            ].map(({ j, h }) => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.52)' }}>{j}</span>
                <span style={{ fontSize: '0.85rem', color: h === 'Closed' ? 'rgba(231,76,60,0.8)' : '#ffffff', fontWeight: 500 }}>{h}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2, ease }}>
            <h4 style={{ fontFamily: 'var(--font-head)', color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Contact</h4>
            {[
              { icon: '📍', text: '47 Boulevard Anfa, Gauthier, Casablanca' },
              { icon: '📞', text: '+212 5 22 XX XX XX' },
              { icon: '✉️', text: 'contact@maisonvelours.ma' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3, ease }}>
            <h4 style={{ fontFamily: 'var(--font-head)', color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Navigation</h4>
            {[
              { label: 'Menu', id: 'menu-preview' },
              { label: 'About Us', id: 'histoire' },
              { label: 'Animations', id: 'animations' },
            ].map(({ label, id }) => (
              <button key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', color: 'rgba(255,255,255,0.52)',
                  fontFamily: 'var(--font-body)', padding: '0.35rem 0',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.52)')}
              >{label}</button>
            ))}
          </motion.div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: '2rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.52)' }}>
            © {new Date().getFullYear()} Maison Velours — All rights reserved
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ height: 1, width: 32, background: 'rgba(201,168,76,0.25)' }} />
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)' }}>
              L'Art de la Table
            </span>
            <div style={{ height: 1, width: 32, background: 'rgba(201,168,76,0.25)' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Notre Emplacement ── */
function MapSection() {
  const [copied, setCopied] = useState(false);
  const address = '47 Boulevard Anfa, Gauthier, Casablanca 20000, Maroc';

  const copy = () => {
    navigator.clipboard?.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const INFO = [
    { icon: '📍', title: 'Adresse', value: address },
    { icon: '🕐', title: 'Horaires', value: 'Mar – Ven : 19h30 – 23h00\nSam – Dim : 19h00 – 23h30\nLundi : Fermé' },
    { icon: '📞', title: 'Réservations', value: '+212 5 22 XX XX XX' },
    { icon: '✉️', title: 'Email', value: 'contact@maisonvelours.ma' },
  ];

  return (
    <section id="emplacement" style={{
      background: '#030308', padding: '7rem 1.5rem',
      borderTop: '1px solid rgba(201,168,76,0.08)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(ellipse, rgba(139,26,46,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ height: 1, width: 40, background: 'var(--gold)', opacity: 0.4 }} />
            <span style={{ fontSize: '0.64rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>Nous trouver</span>
            <div style={{ height: 1, width: 40, background: 'var(--gold)', opacity: 0.4 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', lineHeight: 1.2 }}>
            Notre <span style={{ color: 'var(--gold)' }}>emplacement</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.92rem', marginTop: '0.6rem' }}>
            Au cœur du quartier Gauthier, Casablanca
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}
          className="map-grid"
        >
          {/* Google Maps iframe */}
          <div style={{
            borderRadius: 18, overflow: 'hidden',
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            height: 400,
          }}>
            <iframe
              title="Maison Velours"
              src="https://maps.google.com/maps?q=Quartier+Gauthier+Casablanca+Maroc&output=embed&z=15"
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 18, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {INFO.map(({ icon, title, value }) => (
              <div key={title} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', marginTop: '0.05rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{title}</p>
                  <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{value}</p>
                </div>
              </div>
            ))}

            <button onClick={copy} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.55rem', background: copied ? 'rgba(39,174,96,0.12)' : 'rgba(201,168,76,0.1)', border: `1px solid ${copied ? 'rgba(39,174,96,0.3)' : 'rgba(201,168,76,0.2)'}`, color: copied ? '#6fcf97' : 'var(--gold)', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
              <span>{copied ? '✓' : '📋'}</span>
              {copied ? 'Adresse copiée !' : 'Copier l\'adresse'}
            </button>

            <a href="https://maps.google.com?q=47+Boulevard+Anfa+Gauthier+Casablanca" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', color: '#7ab4f5', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(66,133,244,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(66,133,244,0.1)'}
            >
              <span>🗺️</span> Ouvrir dans Google Maps
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .map-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ── Home page ── */
export default function Home() {
  return (
    <div className="landing-page" style={{ background: '#080810' }}>
      <LandingNavbar />
      <Hero />
      <MenuPreview />
      <AboutUs />
      <Animations />
      <Avis />
      <MapSection />
      <ContactFooter />
    </div>
  );
}
