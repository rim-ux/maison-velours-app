import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reservationsAPI, menuAPI, clientsAPI } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';

const HERO = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format&fit=crop';

const STATUS_MAP = {
  pending:   { label: 'En attente', color: '#F39C12', bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.3)' },
  confirmed: { label: 'Confirmée',  color: '#27AE60', bg: 'rgba(39,174,96,0.1)',  border: 'rgba(39,174,96,0.3)'  },
  cancelled: { label: 'Annulée',    color: '#E74C3C', bg: 'rgba(231,76,60,0.1)',  border: 'rgba(231,76,60,0.3)'  },
};

const EMPTY_PROD = { name: '', description: '', price: '', category: '', available: true, image_url: '' };

export default function AdminHome() {
  const { user } = useAuth();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [products,     setProducts]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [resFilter,   setResFilter]   = useState('all');
  const [editClient,  setEditClient]  = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddProd, setShowAddProd] = useState(false);
  const [prodForm,    setProdForm]    = useState(EMPTY_PROD);
  const [saving,      setSaving]      = useState(false);

  /* ── Image upload state ── */
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageMode,    setImageMode]    = useState('url'); // 'url' | 'file'
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(location.state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.state]);

  useEffect(() => {
    Promise.all([
      reservationsAPI.list(),
      menuAPI.getProducts(),
      menuAPI.getCategories(),
      clientsAPI.list(),
    ]).then(([res, prods, cats, users]) => {
      setReservations(res.data.results   || res.data);
      setProducts(    prods.data.results || prods.data);
      setCategories(  cats.data.results  || cats.data);
      const all = users.data.results || users.data;
      setClients(all.filter(u => u.role === 'client'));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* ── Reservation actions ── */
  const updateResStatus = async (id, status) => {
    try {
      await reservationsAPI.update(id, { status });
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    } catch {}
  };

  /* ── Client edit ── */
  const saveClient = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await clientsAPI.update(editClient.id, {
        first_name: editClient.first_name,
        last_name:  editClient.last_name,
        email:      editClient.email,
        phone:      editClient.phone,
        address:    editClient.address,
      });
      setClients(cs => cs.map(c => c.id === editClient.id ? editClient : c));
      setEditClient(null);
    } catch {}
    setSaving(false);
  };

  /* ── Image helpers ── */
  const resetImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
  };
  const applyFile = (file) => {
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageMode('file');
  };

  /* ── Product edit / add ── */
  const openEditProduct = (p) => {
    setProdForm({ name: p.name, description: p.description || '', price: p.price, category: p.category, available: p.available, image_url: p.image_url || '' });
    resetImage();
    setImageMode('url');
    setEditProduct(p);
    setShowAddProd(false);
  };

  const openAddProduct = () => {
    setProdForm({ ...EMPTY_PROD, category: categories[0]?.id || '' });
    resetImage();
    setImageMode('url');
    setEditProduct(null);
    setShowAddProd(true);
  };

  const closeProductModal = () => { setEditProduct(null); setShowAddProd(false); resetImage(); };

  const saveProduct = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      let payload;
      if (imageFile) {
        const fd = new FormData();
        fd.append('name',        prodForm.name);
        fd.append('description', prodForm.description);
        fd.append('price',       parseFloat(prodForm.price));
        fd.append('category',    parseInt(prodForm.category));
        fd.append('available',   prodForm.available);
        fd.append('image',       imageFile);
        fd.append('image_url',   '');
        payload = fd;
      } else {
        payload = { ...prodForm, price: parseFloat(prodForm.price), category: parseInt(prodForm.category) };
        if (!payload.image_url) delete payload.image_url;
      }
      if (editProduct) {
        const { data } = await menuAPI.updateProduct(editProduct.id, payload);
        setProducts(ps => ps.map(p => p.id === editProduct.id ? data : p));
        setEditProduct(null);
      } else {
        const { data } = await menuAPI.createProduct(payload);
        setProducts(ps => [data, ...ps]);
        setShowAddProd(false);
      }
      resetImage();
    } catch {}
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await menuAPI.deleteProduct(id);
      setProducts(ps => ps.filter(p => p.id !== id));
    } catch {}
  };

  const filteredRes = resFilter === 'all' ? reservations : reservations.filter(r => r.status === resFilter);
  const pending = reservations.filter(r => r.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F0', fontFamily: 'var(--font-body)' }}>

      <AdminNavbar />

      {/* ══════════════ WELCOME HEADER ══════════════ */}
      <div id="admin-hero" style={{ paddingTop: 64 }}>
        {/* Bannière photo compacte */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img src={HERO} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,16,0.85) 0%, rgba(8,8,16,0.5) 60%, rgba(8,8,16,0.3) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', padding: '0 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
            <div>
              <div style={{ fontSize: '0.58rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.5rem' }}>Administration</div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: '0.3rem' }}>
                Bienvenue,{' '}
                <span style={{ background: 'linear-gradient(135deg,#C9A84C,#F0D890)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {user?.first_name || user?.username}
                </span>
              </h1>
              <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
                Maison Velours — Casablanca
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'var(--dark)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem', display: 'flex', gap: 0 }}>
            {[
              { val: pending,             label: 'En attente',   color: '#F39C12', border: true },
              { val: reservations.length, label: 'Réservations', color: '#fff',    border: true },
              { val: products.length,     label: 'Produits',     color: 'var(--gold)', border: true },
              { val: clients.length,      label: 'Clients',      color: '#7AC994', border: false },
            ].map(({ val, label, color, border }) => (
              <div key={label} style={{ padding: '1rem 2rem', borderRight: border ? '1px solid rgba(255,255,255,0.07)' : 'none', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1 }}>{val}</span>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ RÉSERVATIONS ══════════════ */}
      <section id="admin-reservations" style={{ background: '#fff', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--dark)', marginBottom: '0.2rem' }}>Réservations</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{pending} en attente de confirmation</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { key: 'all',       label: 'Toutes'      },
                { key: 'pending',   label: 'En attente'  },
                { key: 'confirmed', label: 'Confirmées'  },
                { key: 'cancelled', label: 'Annulées'    },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setResFilter(key)} style={{
                  padding: '0.42rem 1.1rem', borderRadius: 20,
                  background: resFilter === key ? 'var(--dark)' : 'transparent',
                  color: resFilter === key ? '#fff' : 'var(--muted)',
                  border: `1px solid ${resFilter === key ? 'var(--dark)' : 'var(--border)'}`,
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {loading ? <div className="spinner" /> : filteredRes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              Aucune réservation dans cette catégorie
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredRes.map(r => {
                const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
                return (
                  <div key={r.id} style={{
                    background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    padding: '1.4rem 1.5rem', boxShadow: 'var(--shadow-sm)',
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: 'var(--dark)', fontSize: '0.98rem' }}>{r.name}</span>
                        <span style={{ padding: '0.18rem 0.65rem', borderRadius: 50, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text)' }}>
                        <span>📅 {new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                        <span>🕐 {r.time?.slice(0, 5)}</span>
                        <span>👥 {r.guests} personne{r.guests > 1 ? 's' : ''}</span>
                        {r.email && <span>✉️ {r.email}</span>}
                        {r.phone && <span>📞 {r.phone}</span>}
                      </div>
                      {r.message && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>"{r.message}"</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {r.status !== 'confirmed' && (
                        <button onClick={() => updateResStatus(r.id, 'confirmed')} style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          ✓ Confirmer
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => updateResStatus(r.id, 'cancelled')} style={{ background: 'rgba(231,76,60,0.07)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          ✕ Annuler
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ MENU & PRODUITS ══════════════ */}
      <section id="admin-menu" style={{ background: 'var(--cream)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--dark)', marginBottom: '0.2rem' }}>Menu & Produits</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{products.length} produits au total</p>
            </div>
            <button onClick={openAddProduct} className="btn btn-primary">+ Ajouter un produit</button>
          </div>

          {loading ? <div className="spinner" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
              {products.map(p => {
                const cat = categories.find(c => c.id === p.category);
                return (
                  <div key={p.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 155, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: 155, background: 'linear-gradient(135deg,var(--dark),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2.5rem', opacity: 0.35 }}>🍽️</span>
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.92rem', color: 'var(--dark)', fontWeight: 600 }}>{p.name}</h4>
                        <span style={{ fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.88rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{parseFloat(p.price).toFixed(0)} MAD</span>
                      </div>
                      {cat && <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>{cat.name}</div>}
                      <p style={{ fontSize: '0.77rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditProduct(p)} style={{ flex: 1, padding: '0.42rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139,26,46,0.06)', border: '1px solid rgba(139,26,46,0.15)', color: 'var(--burgundy)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deleteProduct(p.id)} style={{ padding: '0.42rem 0.7rem', borderRadius: 'var(--radius-sm)', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.15)', color: '#E74C3C', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ CLIENTS ══════════════ */}
      <section id="admin-clients" style={{ background: '#fff', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--dark)', marginBottom: '0.2rem' }}>Clients</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{clients.length} comptes clients enregistrés</p>
          </div>

          {loading ? <div className="spinner" /> : clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              Aucun client enregistré
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {clients.map(c => (
                <div key={c.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,var(--burgundy),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {(c.first_name?.[0] || c.username[0]).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>
                      {c.first_name} {c.last_name}
                      <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.78rem', marginLeft: '0.5rem' }}>@{c.username}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {c.email   && <span>✉️ {c.email}</span>}
                      {c.phone   && <span>📞 {c.phone}</span>}
                      {c.address && <span>📍 {c.address}</span>}
                    </div>
                  </div>
                  <button onClick={() => setEditClient({ ...c })} style={{ padding: '0.42rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139,26,46,0.06)', border: '1px solid rgba(139,26,46,0.15)', color: 'var(--burgundy)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                    ✏️ Modifier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ CLIENT EDIT MODAL ══════════════ */}
      {editClient && (
        <div style={S.backdrop} onClick={() => setEditClient(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <h3 style={S.modalTitle}>Modifier le client</h3>
              <button onClick={() => setEditClient(null)} style={S.closeBtn}>✕</button>
            </div>
            <form onSubmit={saveClient}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prénom</label>
                  <input className="form-control" value={editClient.first_name || ''} onChange={e => setEditClient(ec => ({ ...ec, first_name: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Nom</label>
                  <input className="form-control" value={editClient.last_name || ''} onChange={e => setEditClient(ec => ({ ...ec, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={editClient.email || ''} onChange={e => setEditClient(ec => ({ ...ec, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input className="form-control" value={editClient.phone || ''} onChange={e => setEditClient(ec => ({ ...ec, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <textarea className="form-control" rows={2} value={editClient.address || ''} onChange={e => setEditClient(ec => ({ ...ec, address: e.target.value }))} />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ PRODUCT MODAL ══════════════ */}
      {(editProduct || showAddProd) && (
        <div style={S.backdrop} onClick={closeProductModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <h3 style={S.modalTitle}>{editProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
              <button onClick={closeProductModal} style={S.closeBtn}>✕</button>
            </div>
            <form onSubmit={saveProduct}>

              {/* ── Photo ── */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                {/* Vignette cliquable */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) applyFile(f); }}
                    title="Cliquer pour changer la photo"
                    style={{ width: 96, height: 96, borderRadius: 10, overflow: 'hidden', border: `2px dashed ${dragOver ? 'var(--burgundy)' : 'var(--border)'}`, background: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'border-color 0.2s' }}
                  >
                    {(imageFile ? imagePreview : prodForm.image_url)
                      ? <img src={imageFile ? imagePreview : prodForm.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      : <span style={{ fontSize: '2rem' }}>🍽️</span>
                    }
                    {/* Overlay caméra */}
                    <div
                      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.18s', borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 700, marginTop: '0.2rem', letterSpacing: '0.05em' }}>CHANGER</span>
                    </div>
                  </div>
                  {imageFile && (
                    <button type="button" onClick={resetImage} title="Retirer"
                      style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#E74C3C', color: '#fff', border: '2px solid #fff', fontSize: '0.58rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Boutons + URL */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>
                    {imageFile ? imageFile.name : (prodForm.image_url ? 'Photo via URL' : 'Aucune photo')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--burgundy)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      Choisir un fichier
                    </button>
                    <button type="button" onClick={() => setImageMode(m => m === 'url' ? 'file' : 'url')}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.35rem 0.7rem', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
                      🔗 Via URL
                    </button>
                  </div>
                  {imageMode === 'url' && (
                    <input className="form-control" type="text" placeholder="https://…" value={prodForm.image_url}
                      onChange={e => { setProdForm(f => ({ ...f, image_url: e.target.value })); resetImage(); }}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }} />
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) applyFile(f); e.target.value = ''; }} />

              <div className="form-group">
                <label>Nom du produit</label>
                <input className="form-control" required value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix (MAD)</label>
                  <input className="form-control" type="number" step="0.01" min="0" required value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Catégorie</label>
                  <select className="form-control" required value={prodForm.category} onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">— Choisir —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="prod-available" checked={prodForm.available} onChange={e => setProdForm(f => ({ ...f, available: e.target.checked }))} />
                <label htmlFor="prod-available" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Disponible à la commande</label>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {saving ? 'Enregistrement…' : editProduct ? 'Modifier le produit' : 'Ajouter le produit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
  },
  modal: {
    background: '#fff', borderRadius: 'var(--radius)',
    width: '100%', maxWidth: 520,
    maxHeight: '90vh', overflowY: 'auto',
    padding: '2rem',
    boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
  },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  modalTitle: { fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: 'var(--dark)' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--muted)', padding: '0.2rem' },
};
