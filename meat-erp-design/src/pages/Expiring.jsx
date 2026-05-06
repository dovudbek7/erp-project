import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, ProductCell, ExpiryPill } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

const BUCKETS = [
  { key: 'expired', label: 'Already expired', tone: 'red',   filter: l => l.days < 0 },
  { key: '0-7',     label: '0–7 days',         tone: 'amber', filter: l => l.days >= 0 && l.days <= 7 },
  { key: '8-14',    label: '8–14 days',        tone: 'amber', filter: l => l.days >= 8 && l.days <= 14 },
];

export default function Expiring() {
  const lots = DATA.lots
    .map(l => ({
      ...l,
      product: DATA.products.find(x => x.id === l.productId),
      warehouse: DATA.warehouses.find(x => x.id === l.warehouseId),
      days: fmt.daysToExpiry(l.expiryDate),
    }))
    .filter(l => l.days !== null && l.days <= 14)
    .sort((a, b) => a.days - b.days);

  return (
    <AppShell activeRoute="#/expiring" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Inventory' }, { label: 'Expiring soon' }]}
        title="Expiring soon"
        sub="Lots within 14 days of their expiry date — group, write-off, or move to discount."
        actions={<button className="btn btn--outline"><Icon name="download" /> Export</button>}
      />

      <div className="vstack gap-20">
        {BUCKETS.map(b => {
          const items = lots.filter(b.filter);
          if (!items.length) return null;
          return (
            <div key={b.key} className="card">
              <div className="card__header">
                <div className="hstack">
                  <span className={`pill pill--${b.tone}`}>{b.label}</span>
                  <span className="muted">{items.length} lot{items.length === 1 ? '' : 's'}</span>
                </div>
                <div className="hstack">
                  <button className="btn btn--outline btn--sm"><Icon name="check" /> Select all</button>
                  <button className="btn btn--danger btn--sm"><Icon name="trash" /> Write off selected</button>
                </div>
              </div>
              <div className="card__body card__body--flush">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Lot</th><th>Product</th><th>Warehouse</th>
                      <th className="num">Qty</th><th className="num">Value</th><th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(l => (
                      <tr key={l.id} onClick={() => (window.location.hash = `#/inventory/${l.id}`)}>
                        <td className="mono">{l.lotNumber}</td>
                        <td><ProductCell name={l.product.name} sku={l.product.sku} /></td>
                        <td><span className="mono muted">{l.warehouse.code}</span></td>
                        <td className="num">{fmt.qty(l.currentQuantity, l.uom)}</td>
                        <td className="num">{fmt.money(parseFloat(l.unitCost) * parseFloat(l.currentQuantity), l.currency)}</td>
                        <td>
                          <ExpiryPill expiry={l.expiryDate} />{' '}
                          <span className="muted" style={{ marginLeft: 6 }}>{fmt.date(l.expiryDate)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
