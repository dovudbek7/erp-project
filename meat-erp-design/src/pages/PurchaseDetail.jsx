import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, StatusPill, ProductCell, ProgressCell } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function PurchaseDetail({ params }) {
  const id = params?.[0];
  const po = DATA.purchaseOrders.find(p => p.id === id) || DATA.purchaseOrders[0];
  const lines = po.lines || DATA.purchaseOrders[0].lines;
  const canReceive = po.status === 'SUBMITTED' || po.status === 'PARTIALLY_RECEIVED';
  const openLines = lines.filter(l => parseFloat(l.receivedQty) < parseFloat(l.orderedQty));

  return (
    <AppShell activeRoute="#/purchase" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[
          { label: 'Operations' },
          { label: 'Purchase Orders', href: '#/purchase' },
          { label: po.poNumber },
        ]}
        title={po.poNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="printer" /> Print</button>
          <button className="btn btn--outline"><Icon name="edit" /> Edit</button>
          {canReceive ? <button className="btn btn--primary"><Icon name="truck" /> Receive goods</button> : null}
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{po.supplier}</h2>
            <StatusPill status={po.status} />
          </div>
          <div className="detail-head__sub">
            Order date {fmt.date(po.orderDate)} · Expected {fmt.date(po.expectedDate)}
          </div>
          <div className="detail-meta">
            <div className="detail-meta__item">
              <div className="detail-meta__label">Subtotal</div>
              <div className="detail-meta__value">{fmt.money(po.totalAmount, po.currency)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Lines</div>
              <div className="detail-meta__value">{po.linesCount}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Currency</div>
              <div className="detail-meta__value">{po.currency}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Created by</div>
              <div className="detail-meta__value detail-meta__value--soft">Madina T.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Order lines</h3>
          {canReceive ? (
            <button className="btn btn--primary btn--sm"><Icon name="truck" /> Receive remaining</button>
          ) : null}
        </div>
        <div className="card__body card__body--flush">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Ordered</th>
                <th className="num">Received</th>
                <th>Progress</th>
                <th className="num">Unit Price</th>
                <th className="num">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td><ProductCell name={l.name} /></td>
                  <td className="num">{fmt.qty(l.orderedQty, l.uom)}</td>
                  <td className="num">{fmt.qty(l.receivedQty, l.uom)}</td>
                  <td><ProgressCell received={l.receivedQty} ordered={l.orderedQty} /></td>
                  <td className="num">{fmt.money(l.unitPrice, po.currency)}</td>
                  <td className="num"><strong>{fmt.money(l.lineTotal, po.currency)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card__footer">
          <div className="hstack" style={{ justifyContent: 'space-between' }}>
            <span className="muted">{po.linesCount} lines</span>
            <div className="hstack gap-20">
              <span className="muted">Subtotal: <strong style={{ color: 'var(--text)' }}>{fmt.money(po.totalAmount, po.currency)}</strong></span>
              <span className="muted">Tax: <strong style={{ color: 'var(--text)' }}>{fmt.money(0, po.currency)}</strong></span>
              <span>Total: <strong style={{ fontSize: 16 }}>{fmt.money(po.totalAmount, po.currency)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {canReceive ? (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card__header">
            <h3 className="card__title">Receive goods · open lines</h3>
            <span className="card__sub">Capture supplier lot ref, production / expiry date and unit cost.</span>
          </div>
          <div className="card__body">
            {openLines.map((l, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div className="hstack" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                  <strong>{l.name}</strong>
                  <span className="muted">
                    Remaining:{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {fmt.qty(parseFloat(l.orderedQty) - parseFloat(l.receivedQty), l.uom)}
                    </strong>
                  </span>
                </div>
                <div className="form-grid form-grid--3">
                  <div className="field">
                    <label className="field__label">Quantity received</label>
                    <div className="input-group">
                      <input className="input" defaultValue={(parseFloat(l.orderedQty) - parseFloat(l.receivedQty)).toFixed(3)} />
                      <span className="input-group__suffix">{l.uom}</span>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field__label">Unit cost</label>
                    <div className="input-group">
                      <input className="input" defaultValue={l.unitPrice} />
                      <span className="input-group__suffix">UZS/{l.uom}</span>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field__label">Supplier lot ref.</label>
                    <input className="input" placeholder="LOT-..." />
                  </div>
                  <div className="field">
                    <label className="field__label">Production date</label>
                    <input className="input" type="date" defaultValue="2026-05-05" />
                  </div>
                  <div className="field">
                    <label className="field__label">Expiry date</label>
                    <input className="input" type="date" defaultValue="2026-05-12" />
                    <span className="field__hint">Auto-suggested from product shelf life (7 days).</span>
                  </div>
                  <div className="field">
                    <label className="field__label">Warehouse</label>
                    <select className="select" defaultValue="CS-A">
                      <option>CS-A · Cold Storage A</option>
                      <option>FG-A · Finished Goods Cold A</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="hstack" style={{ justifyContent: 'space-between', marginTop: 8 }}>
              <div className="muted">
                Total received value:{' '}
                <strong style={{ color: 'var(--text)' }}>{fmt.money(po.totalAmount, po.currency)}</strong>
              </div>
              <div className="hstack">
                <button className="btn btn--outline">Save for later</button>
                <button className="btn btn--primary"><Icon name="check" /> Confirm receipt</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
