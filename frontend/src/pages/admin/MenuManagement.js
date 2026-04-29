import React, { useEffect, useState } from 'react';
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

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setError('');
    setModal('product');
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      available: p.available,
      image_url: p.image_url || '',
    });
    setError('');
    setModal('product');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.image_url) delete payload.image_url;
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
        setDeleteError('Acces refuse. Verifiez que vous etes connecte en tant qu\'administrateur.');
      } else {
        setDeleteError('Erreur lors de la suppression (code ' + (status || 'inconnu') + ').');
      }
    }
  };

  const handleToggle = async (product) => {
    try {
      await menuAPI.updateProduct(product.id, { available: !product.available });
      fetchData();
    } catch (err) {
      // silent — user will see no change
    }
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
            Ajouter une categorie
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            Ajouter un produit
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {deleteError}
          <button
            style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setDeleteError('')}
          >
            x
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div style={styles.catTabs}>
        <button
          className="btn btn-sm"
          style={activeCat === null ? styles.catActive : styles.catInactive}
          onClick={() => setActiveCat(null)}
        >
          Tous ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className="btn btn-sm"
            style={activeCat === c.id ? styles.catActive : styles.catInactive}
            onClick={() => setActiveCat(c.id)}
          >
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
                  <th>Categorie</th>
                  <th>Prix</th>
                  <th>Disponibilite</th>
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
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={styles.thumb}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        <div
                          style={{
                            ...styles.thumbPlaceholder,
                            display: p.image_url ? 'none' : 'block',
                          }}
                        />
                        <div>
                          <strong>{p.name}</strong>
                          {p.description && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', maxWidth: 220 }}>
                              {p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}
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
                      <button
                        onClick={() => handleToggle(p)}
                        className={`badge ${p.available ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {p.available ? 'Disponible' : 'Indisponible'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(p)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product modal */}
      {modal === 'product' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>x</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Prix (MAD) *</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Categorie *</label>
                    <select
                      className="form-control"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">Choisir une categorie</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL de l'image</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                  {form.image_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={form.image_url}
                        alt="Apercu"
                        style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  />
                  Disponible a la vente
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category modal */}
      {modal === 'category' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvelle categorie</h3>
              <button className="modal-close" onClick={() => setModal(null)}>x</button>
            </div>
            <form onSubmit={handleSaveCat}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    className="form-control"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  Creer
                </button>
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
