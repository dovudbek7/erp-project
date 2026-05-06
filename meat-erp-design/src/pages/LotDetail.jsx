import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, StatusPill, ExpiryPill } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

const MOVEMENT_ICON = {
  RECEIPT: 'truck', PRODUCTION_INPUT: 'minus', PRODUCTION_OUTPUT: 'plus',
  SALE: 'cart', ADJUSTMENT: 'edit', WRITE_OFF: 'trash', TRANSFER_IN: 'arrow_right', TRANSFER_OUT: 'arrow_right',
};
const MOVEMENT_TONE = {
  RECEIPT: 'green', PRODUCTION_INPUT: 'amber', PRODUCTION_OUTPUT: 'green',
  SALE: 'blue', ADJUSTMENT: 'slate', WRITE_OFF: 'red', TRANSFER_IN: 'slate', TRANSFER_OUT: 'slate',
};

export default function LotDetail({ params }) {
  const id = params?.[0];
  const lot = DATA.lots.find(l => l.id === id) || DATA.lots[0];
  const product = DATA.products.find(x => x.id === lot.productId);
  const warehouse = DATA.warehouses.find(x => x.id === lot.warehouseId);
  const movements = DATA.movements;
  const consumed = parseFloat(lot.initialQuantity) - parseFloat(lot.currentQuantity);
  const remainingPct = (parseFloat(lot.currentQuantity) / parseFloat(lot.initialQuantity)) * 100;
  const totalValue = parseFloat(lot.unitCost) * parseFloat(lot.currentQuantity);

  return (
    <AppShell activeRoute="#/inventory" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[
          { label: 'Inventory', href: '#/inventory' },
          { label: 'Lots',      href: '#/inventory' },
          { label: lot.lotNumber },
        ]}
        title={lot.lotNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="printer" /> Print label</button>
          <button className="btn btn--outline"><Icon name="edit" /> Adjust quantity</button>
          <button className="btn btn--danger"><Icon name="trash" /> Write off</button>
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{product.name}</h2>
            <StatusPill status={lot.status} />
            <ExpiryPill expiry={lot.expiryDate} />
          </div>
          <div className="detail-head__sub">
            {product.sku} · {warehouse.name} (<span className="mono">{warehouse.code}</span>) · Source: {lot.source}
          </div>

          <div className="detail-meta">
            <div className="detail-meta__item">
              <div className="detail-meta__label">Current Qty</div>
              <div className="detail-meta__value">{fmt.qty(lot.currentQuantity, lot.uom)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Initial Qty</div>
              <div className="detail-meta__value detail-meta__value--soft">{fmt.qty(lot.initialQuantity, lot.uom)}</div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Unit Cost</div>
              <div className="detail-meta__value">
                {fmt.money(lot.unitCost, lot.currency)}
                <span className="muted" style={{ fontWeight: 500, fontSize: 12 }}> /{lot.uom}</span>
              </div>
            </div>
            <div className="detail-meta__item">
              <div className="detail-meta__label">Total Value</div>
              <div className="detail-meta__value">{fmt.money(totalValue, lot.currency)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <a className="tabs__item is-active" href={`#/inventory/${lot.id}`}><Icon name="eye" /> Overview</a>
        <a className="tabs__item" href={`#/inventory/${lot.id}/movements`}>
          <Icon name="history" /> Movements <span className="count">{movements.length}</span>
        </a>
        <a className="tabs__item" href={`#/inventory/${lot.id}/trace`}><Icon name="trace" /> Traceability</a>
      </div>

      <div className="grid-3-2">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Stock movements</h3>
            <span className="card__sub">Newest first · {movements.length} entries</span>
          </div>
          <div className="card__body card__body--flush">
            <div className="timeline" style={{ padding: '8px 16px 16px' }}>
              {movements.slice().reverse().map(m => {
                const isIn = parseFloat(m.quantity) >= 0;
                return (
                  <div key={m.id} className="timeline__item">
                    <div className={`timeline__bullet timeline__bullet--${MOVEMENT_TONE[m.type] || 'slate'}`}>
                      <Icon name={MOVEMENT_ICON[m.type] || 'package'} />
                    </div>
                    <div className="hstack" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="timeline__title">{m.type.replace(/_/g, ' ')}</div>
                        <div className="timeline__meta">
                          {fmt.dateTime(m.performedAt)} · {m.performedBy} · Ref:{' '}
                          <a href="#" className="mono">{m.referenceId}</a>
                        </div>
                        {m.notes ? <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>{m.notes}</div> : null}
                      </div>
                      <div className="text-right">
                        <div className={`timeline__amount timeline__amount--${isIn ? 'in' : 'out'}`}>
                          {m.quantity} {lot.uom}
                        </div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          @ {fmt.money(m.unitCost, lot.currency)}/{lot.uom}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="vstack gap-20">
          <div className="card">
            <div className="card__header"><h3 className="card__title">Lot details</h3></div>
            <div className="card__body">
              <dl className="cumul">
                <div className="cumul__row"><dt>Production date</dt><dd>{fmt.date(lot.productionDate)}</dd></div>
                <div className="cumul__row"><dt>Expiry date</dt><dd>{fmt.date(lot.expiryDate)}</dd></div>
                <div className="cumul__row"><dt>Received at</dt><dd>{fmt.date(lot.receivedAt)}</dd></div>
                <div className="cumul__row"><dt>Supplier ref.</dt>
                  <dd className="mono" style={{ fontSize: 12.5 }}>{lot.supplierLotRef || '—'}</dd>
                </div>
                <div className="cumul__row"><dt>Currency</dt><dd>{lot.currency}</dd></div>
                <div className="cumul__row"><dt>Parent lots</dt><dd>{(lot.parentLotIds || []).length}</dd></div>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h3 className="card__title">Quantity remaining</h3></div>
            <div className="card__body">
              <div className="cumul__bar">
                <div className="cumul__bar-label">
                  <span>{fmt.qty(lot.currentQuantity, lot.uom)} of {fmt.qty(lot.initialQuantity, lot.uom)}</span>
                  <span>{Math.round(remainingPct)}%</span>
                </div>
                <div className="cumul__bar-track">
                  <div className="cumul__bar-fill" style={{ width: `${remainingPct}%` }} />
                </div>
              </div>
              <div className="muted" style={{ marginTop: 14, fontSize: 12.5 }}>
                Consumed {fmt.qty(consumed, lot.uom)} across{' '}
                {movements.filter(m => parseFloat(m.quantity) < 0).length} movements.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
