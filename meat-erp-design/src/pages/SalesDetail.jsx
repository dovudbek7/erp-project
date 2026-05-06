import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, StatusPill, ExpiryPill, ProductCell, Lifecycle } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function SalesDetail({ params }) {
  const id = params?.[0];
  const o = DATA.salesOrders.find(s => s.id === id) || DATA.salesOrders[0];
  const fgLots = DATA.lots.filter(l => l.productId === 'prod-fg-1' && l.status === 'AVAILABLE');

  return (
    <AppShell activeRoute="#/sales" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Commercial' }, { label: 'Sales Orders', href: '#/sales' }, { label: o.orderNumber }]}
        title={o.orderNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="printer" /> Print</button>
          <button className="btn btn--outline"><Icon name="edit" /> Edit</button>
          <button className="btn btn--primary"><Icon name="check" /> Confirm allocation</button>
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{o.customer}</h2>
            <StatusPill status={o.customerType} />
            <StatusPill status={o.status} />
          </div>
          <div className="detail-head__sub">
            Order date {fmt.date(o.orderDate)} · Promised {fmt.date(o.promisedDate)}
          </div>
          <div className="detail-meta">
            <div className="detail-meta__item">
              <div className="detail-meta__label">Subtotal</div>
              <div className="detail-meta__value">{fmt.money(o.subtotal, o.currency)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Tax (12%)</div>
              <div className="detail-meta__value">{fmt.money(o.taxAmount, o.currency)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Total</div>
              <div className="detail-meta__value">{fmt.money(o.totalAmount, o.currency)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Margin</div>
              <div className="detail-meta__value">
                {o.grossMargin
                  ? fmt.money(o.grossMargin, o.currency)
                  : <span className="muted">— pending delivery</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prod-grid">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Order lines · allocation</h3>
            <span className="card__sub">FIFO suggested — operator can override per line.</span>
          </div>
          <div className="card__body card__body--flush">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th><th className="num">Qty</th>
                  <th className="num">Unit price</th><th>Allocated lot</th>
                  <th className="num">Line total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><ProductCell name="Beef Mince 80/20 1kg" sku="MINCE-80-1KG" /></td>
                  <td className="num">20.000 KG</td>
                  <td className="num">{fmt.money('92500.00', 'UZS')}</td>
                  <td>
                    <span className="lot-chip"><Icon name="package" /> MINCE-2026-05-001 · 20.0kg</span>
                  </td>
                  <td className="num"><strong>{fmt.money('1850000.00', 'UZS')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card__footer">
            <div className="hstack" style={{ justifyContent: 'flex-end', gap: 24 }}>
              <span className="muted">Subtotal: <strong style={{ color: 'var(--text)' }}>{fmt.money(o.subtotal, o.currency)}</strong></span>
              <span className="muted">Tax: <strong style={{ color: 'var(--text)' }}>{fmt.money(o.taxAmount, o.currency)}</strong></span>
              <span>Total: <strong style={{ fontSize: 16 }}>{fmt.money(o.totalAmount, o.currency)}</strong></span>
            </div>
          </div>
        </div>

        <div className="suggest">
          <div className="suggest__title">
            <Icon name="zap" /> Available finished-goods lots
          </div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
            Allocations are soft-locked until delivery.
          </div>
          {fgLots.map(l => (
            <div key={l.id} className="suggest__lot">
              <div className="suggest__lot-head">
                <span className="suggest__lot-num">{l.lotNumber}</span>
                <ExpiryPill expiry={l.expiryDate} />
              </div>
              <div className="suggest__lot-meta">
                <span>Avail: <strong style={{ color: 'var(--text)' }}>{fmt.qty(l.currentQuantity, l.uom)}</strong></span>
                <span>Cost: {fmt.money(l.unitCost, l.currency)}/kg</span>
              </div>
              <div className="suggest__lot-actions">
                <span className="muted" style={{ fontSize: 11.5 }}>
                  Wh: <span className="mono">FG-A</span>
                </span>
                <button className="btn btn--outline btn--sm"><Icon name="check" /> Allocate</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card__header"><h3 className="card__title">Lifecycle</h3></div>
        <div className="card__body">
          <Lifecycle steps={['DRAFT', 'CONFIRMED', 'PICKED', 'DELIVERED', 'INVOICED']} current={o.status} />
        </div>
      </div>
    </AppShell>
  );
}
