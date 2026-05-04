import React, { useEffect, useRef, useState } from 'react';
import { menuAPI } from '../../services/api';

const emptyProduct = { name: '', description: '', price: '', category: '', available: true, image_url: '' };

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'product' | 'category'
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(emptyProduct);
  const [catForm,    setCatForm]    = useState({ name: '', icon: '' });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [activeCat,  setActiveCat]  = useState(null);
  const [deleteError, setDeleteError] = useState('');

  /* ── Image state ── */
  const [imageMode,    setImageMode]    = useState('url');   // 'url' | 'file'
  const [imageFile,    setImageFile]    = useState(null);    // File object
  const [imagePreview, setImagePreview] = useState('');      // object URL for preview
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([menuAPI.getCategories(), menuAPI.getProducts({})])
      .then(([c, p]) => {
        setCategories(c.data);
        setProducts(p.data.results || p.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { applyFile(file); setImageMode('file'); }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) applyFile(file);
  };

  /* ── Modal open ── */
  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    resetImage();
    setImageMode('url');
    setError('');
    setModal('product');
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name:        p.name,
      description: p.description || '',
      price:       p.price,
      category:    p.category,
      available:   p.available,
      image_url:   p.image_url || '',
    });
    resetImage();
    setImageMode('url');
    setError('');
    setModal('product');
  };

  /* ── Save product ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let payload;

      if (imageFile) {
        // Send as multipart/form-data
        const fd = new FormData();
        fd.append('name',        form.name);
        fd.append('description', form.description);
        fd.append('price',       form.price);
        fd.append('category',    form.category);
        fd.append('available',   form.available);
        fd.append('image',       imageFile);
        // Clear old image_url when uploading a new file
        fd.append('image_url',   '');
        payload = fd;
      } else {
        payload = { ...form };
        if (!payload.image_url) delete payload.image_url;
      }

      if (editing) {
        await menuAPI.updateProduct(editing.id, payload);
      } else {
        await menuAPI.createProduct(payload);
      }
      setModal(null);
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? JSON.stringify(data) : (data || "Erreur lors de l'enregistrement"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleteError('');
    if (!window.confirm(`Confirmer la suppression de "${name}" ?`)) return;
    try {
      await menuAPI.deleteProduct(id);
      fetchData();
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setDeleteError("Accès refusé. Vérifiez que vous êtes connecté en tant qu'administrateur.");
      } else {
        setDeleteError('Erreur lors de la suppression (code ' + (status || 'inconnu') + ').');
      }
    }
  };

  const handleToggle = async (product) => {
    try {
      await menuAPI.updateProduct(product.id, { available: !product.available });
      fetchData();
    } catch (err) {}
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await menuAPI.createCategory(catForm);
      setModal(null);
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? JSON.stringify(data) : (data || 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = activeCat ? products.filter((p) => p.category === activeCat) : products;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion du Menu</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => { setCatForm({ name: '', icon: '' }); setError(''); setModal('category'); }}
          >
            Ajouter une catégorie
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            Ajouter un produit
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {deleteError}
          <button style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setDeleteError('')}>✕</button>
        </div>
      )}

      {/* Category tabs */}
      <div style={styles.catTabs}>
        <button className="btn btn-sm"
          style={activeCat === null ? styles.catActive : styles.catInactive}
          onClick={() => setActiveCat(null)}>
          Tous ({products.length})
        </button>
        {categories.map((c) => (
          <button key={c.id} className="btn btn-sm"
            style={activeCat === c.id ? styles.catActive : styles.catInactive}
            onClick={() => setActiveCat(c.id)}>
            {c.name} ({products.filter((p) => p.category === c.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Aucun produit
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} style={styles.thumb}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div style={{ ...styles.thumbPlaceholder, display: p.image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1.1rem' }}>
                          🍽️
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          {p.description && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', maxWidth: 220 }}>
                              {p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{p.category_name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--burgundy)' }}>
                      {parseFloat(p.price).toFixed(2)} MAD
                    </td>
                    <td>
                      <button onClick={() => handleToggle(p)}
                        className={`badge ${p.available ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none' }}>
                        {p.available ? 'Disponible' : 'Indisponible'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Product modal ── */}
      {modal === 'product' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                {/* ── Photo en haut, cliquable ── */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                  {/* Vignette cliquable */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      title="Cliquer pour changer la photo"
                      style={{
                        width: 100, height: 100, borderRadius: 10, overflow: 'hidden',
                        border: dragOver ? '2px dashed var(--burgundy)' : '2px dashed var(--border)',
                        background: 'var(--cream)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.2s',
                        position: 'relative',
                      }}
                    >
                      {(imageFile ? imagePreview : form.image_url) ? (
                        <img
                          src={imageFile ? imagePreview : form.image_url}
                          alt="Aperçu"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>🍽️</span>
                      )}
                      {/* Overlay caméra */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.42)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.18s',
                        borderRadius: 8,
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, marginTop: '0.25rem', letterSpacing: '0.04em' }}>
                          CHANGER
                        </span>
                      </div>
                    </div>
                    {/* Badge si fichier sélectionné */}
                    {imageFile && (
                      <button type="button" onClick={() => resetImage()} title="Retirer"
                        style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#E74C3C', color: '#fff', border: '2px solid #fff', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Infos + bouton choisir */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark)' }}>
                      {imageFile ? imageFile.name : (form.image_url ? 'Photo depuis URL' : 'Aucune photo')}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                      Cliquez sur la vignette ou glissez-déposez une image.<br/>JPG, PNG, WebP — max 5 Mo
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--burgundy)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        Choisir un fichier
                      </button>
                      <button type="button"
                        onClick={() => setImageMode(imageMode === 'url' ? 'file' : 'url')}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
                        🔗 Via URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Champ URL si mode URL actif */}
                {imageMode === 'url' && (
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <input className="form-control" type="text"
                      placeholder="https://images.unsplash.com/…"
                      value={form.image_url}
                      onChange={(e) => { setForm({ ...form, image_url: e.target.value }); resetImage(); }} />
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => { handleFileChange(e); setImageMode('file'); }} />

                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Prix (MAD) *</label>
                    <input className="form-control" type="number" step="0.01" min="0" value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Catégorie *</label>
                    <select className="form-control" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Choisir une catégorie</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                  Disponible à la vente
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category modal ── */}
      {modal === 'category' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvelle catégorie</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveCat}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-control" value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title:            { fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: 'var(--dark)' },
  catTabs:          { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  catActive:        { background: 'var(--burgundy)', color: 'var(--white)', border: '2px solid var(--burgundy)' },
  catInactive:      { background: 'var(--white)', color: 'var(--text)', border: '2px solid var(--border)' },
  thumb:            { width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 },
  thumbPlaceholder: { width: 44, height: 44, borderRadius: 6, background: 'var(--cream-dk)', flexShrink: 0 },
};
