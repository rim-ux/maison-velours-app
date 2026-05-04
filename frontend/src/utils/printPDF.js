const BRAND = `
  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #8B1A2E;">
    <div style="font-size:28px;font-weight:800;color:#8B1A2E;letter-spacing:0.04em;margin-bottom:4px;">MAISON VELOURS</div>
    <div style="font-size:11px;color:#999;letter-spacing:0.25em;text-transform:uppercase;">Restaurant Gastronomique · Casablanca</div>
  </div>`;

const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#222;background:#fff;padding:32px 40px;font-size:13px;}
  table{width:100%;border-collapse:collapse;margin-top:12px;}
  th{background:#8B1A2E;color:#fff;padding:8px 12px;text-align:left;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;}
  td{padding:7px 12px;border-bottom:1px solid #eee;}
  tr:last-child td{border-bottom:none;}
  .gold{color:#C9A84C;}
  .muted{color:#888;font-size:11px;}
  .bold{font-weight:700;}
  .right{text-align:right;}
  .section-title{font-size:13px;font-weight:700;color:#8B1A2E;letter-spacing:0.08em;text-transform:uppercase;margin:24px 0 10px;}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;}
  .row:last-child{border-bottom:none;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .kpi{border:1px solid #eee;border-top:3px solid #8B1A2E;border-radius:6px;padding:12px 14px;}
  .kpi-val{font-size:20px;font-weight:800;color:#8B1A2E;}
  .kpi-lbl{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px;}
  .footer{text-align:center;margin-top:32px;padding-top:18px;border-top:1px solid #eee;font-size:11px;color:#aaa;}
  @media print{body{padding:16px 24px;}@page{margin:1cm;}}`;

function openPrint(title, body) {
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${BASE_CSS}</style></head><body>${BRAND}${body}<script>window.onload=function(){window.print();}<\/script></body></html>`);
  win.document.close();
}

/* ── Statistics PDF ── */
export function printStatsPDF({ overview, topProducts, dailyRev, byType, days }) {
  const now = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const kpis = `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val">${overview?.orders?.today ?? 0}</div><div class="kpi-lbl">Commandes aujourd'hui</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#F39C12">${overview?.orders?.pending ?? 0}</div><div class="kpi-lbl">En attente</div></div>
      <div class="kpi"><div class="kpi-val gold">${parseFloat(overview?.revenue?.today ?? 0).toFixed(0)} MAD</div><div class="kpi-lbl">CA aujourd'hui</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#27AE60">${parseFloat(overview?.revenue?.month ?? 0).toFixed(0)} MAD</div><div class="kpi-lbl">CA ${days} jours</div></div>
    </div>`;

  const revRows = dailyRev.map(d =>
    `<tr><td>${d.date}</td><td class="right bold gold">${parseFloat(d.revenue ?? 0).toFixed(2)} MAD</td><td class="right">${d.orders ?? 0}</td></tr>`
  ).join('');

  const typeRows = byType.map(d =>
    `<tr><td>${d.name}</td><td class="right bold">${d.count}</td></tr>`
  ).join('');

  const topRows = topProducts.map((p, i) =>
    `<tr><td><span style="color:#8B1A2E;font-weight:700">#${i + 1}</span> ${p.product__name}</td><td class="muted">${p.product__category__name ?? ''}</td><td class="right bold">${p.total_quantity} ventes</td><td class="right gold bold">${parseFloat(p.total_revenue ?? 0).toFixed(2)} MAD</td></tr>`
  ).join('');

  const body = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div><div style="font-size:18px;font-weight:700;color:#222;">Rapport de statistiques</div><div class="muted" style="margin-top:4px;">Période : ${days} derniers jours</div></div>
      <div style="text-align:right;"><div class="muted">Généré le</div><div style="font-weight:600;font-size:12px;">${now}</div></div>
    </div>
    <div class="section-title">Indicateurs clés</div>
    ${kpis}
    <div class="section-title">Chiffre d'affaires & commandes par jour</div>
    <table><thead><tr><th>Date</th><th class="right">CA (MAD)</th><th class="right">Commandes</th></tr></thead><tbody>${revRows || '<tr><td colspan="3" style="color:#aaa;text-align:center;padding:16px">Aucune donnée</td></tr>'}</tbody></table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
      <div>
        <div class="section-title" style="margin-top:0">Commandes par type</div>
        <table><thead><tr><th>Type</th><th class="right">Nb</th></tr></thead><tbody>${typeRows || '<tr><td colspan="2" style="color:#aaa;text-align:center;padding:16px">Aucune donnée</td></tr>'}</tbody></table>
      </div>
      <div>
        <div class="section-title" style="margin-top:0">Top produits</div>
        <table><thead><tr><th>Produit</th><th>Catégorie</th><th class="right">Ventes</th><th class="right">CA</th></tr></thead><tbody>${topRows || '<tr><td colspan="4" style="color:#aaa;text-align:center;padding:16px">Aucune donnée</td></tr>'}</tbody></table>
      </div>
    </div>
    <div class="footer">Maison Velours — Document confidentiel — ${now}</div>`;

  openPrint('Statistiques — Maison Velours', body);
}

/* ── Order Receipt PDF ── */
export function printReceiptPDF(order) {
  const date = new Date(order.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const METHOD_LABELS = { especes: 'Espèces', carte: 'Carte en main', en_ligne: 'Carte bancaire (Stripe)' };

  const itemRows = (order.items || []).map(item =>
    `<tr><td>${item.product_name}</td><td class="right">${item.quantity}</td><td class="right bold">${parseFloat(item.subtotal ?? 0).toFixed(2)} MAD</td></tr>`
  ).join('');

  const body = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div><div style="font-size:18px;font-weight:700;color:#222;">Reçu de paiement</div><div class="muted" style="margin-top:4px;">Commande #${order.id}</div></div>
      <div style="text-align:right;"><div class="muted">Date</div><div style="font-weight:600;font-size:12px;">${date}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      <div style="background:#fafafa;border:1px solid #eee;border-radius:6px;padding:12px 14px;">
        <div class="muted" style="margin-bottom:6px;">Type de commande</div>
        <div style="font-weight:700;">${order.type_display || order.order_type || '—'}</div>
        ${order.table_number ? `<div class="muted" style="margin-top:4px;">Table N° ${order.table_number}</div>` : ''}
        ${order.delivery_address ? `<div class="muted" style="margin-top:4px;">${order.delivery_address}</div>` : ''}
      </div>
      <div style="background:#fafafa;border:1px solid #eee;border-radius:6px;padding:12px 14px;">
        <div class="muted" style="margin-bottom:6px;">Statut</div>
        <div style="font-weight:700;color:#27AE60;">${order.status_display || order.status || '—'}</div>
        ${order.zone_name ? `<div class="muted" style="margin-top:4px;">Zone : ${order.zone_name}</div>` : ''}
      </div>
    </div>

    <div class="section-title">Détail de la commande</div>
    <table>
      <thead><tr><th>Produit</th><th class="right">Qté</th><th class="right">Montant</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="margin-top:16px;padding:14px 16px;background:#fafafa;border:1px solid #eee;border-radius:6px;">
      <div class="row"><span>Sous-total</span><span class="bold">${parseFloat(order.total ?? 0).toFixed(2)} MAD</span></div>
      <div class="row" style="font-size:14px;font-weight:700;padding:10px 0 0;border-bottom:none;">
        <span>Total payé</span>
        <span style="color:#8B1A2E;font-size:16px;">${parseFloat(order.total ?? 0).toFixed(2)} MAD</span>
      </div>
    </div>

    <div style="margin-top:24px;padding:12px 14px;border:1px solid #eee;border-radius:6px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">💳</span>
      <div><div class="muted">Mode de paiement</div><div style="font-weight:600;margin-top:2px;">${METHOD_LABELS[order.payment_method] || 'Non précisé'}</div></div>
    </div>

    <div class="footer" style="margin-top:28px;">
      Merci de votre confiance — Maison Velours, Casablanca<br/>
      Ce document tient lieu de reçu officiel · Commande #${order.id}
    </div>`;

  openPrint(`Reçu #${order.id} — Maison Velours`, body);
}
