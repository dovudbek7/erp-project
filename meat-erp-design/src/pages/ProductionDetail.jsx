import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, StatusPill, ExpiryPill, ProductCell } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function ProductionDetail({ params }) {
  const id = params?.[0];
  const o = DATA.productionOrders.find(p => p.id === id) || DATA.productionOrders[1];
  if (o.status === 'IN_PROGRESS') return <InProgress order={o} />;
  if (o.status === 'COMPLETED')   return <Completed order={o} />;
  return <Draft order={o} />;
}

// =========================================================
// DRAFT
// =========================================================
function Draft({ order: o }) {
  const recipe = DATA.recipes.find(r => r.id === o.recipeId);
  const scale = parseFloat(o.plannedOutputQuantity) / parseFloat(recipe.outputQuantity);

  return (
    <AppShell activeRoute="#/production" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Operations' }, { label: 'Production', href: '#/production' }, { label: o.orderNumber }]}
        title={o.orderNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="edit" /> Edit</button>
          <button className="btn btn--danger"><Icon name="trash" /> Delete</button>
          <button className="btn btn--primary btn--lg"><Icon name="play" /> Start production</button>
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{recipe.name}</h2>
            <StatusPill status={o.status} />
            <span className="pill pill--slate">{recipe.code} · v{recipe.version}</span>
          </div>
          <div className="detail-head__sub">
            Scheduled for {fmt.dateTime(o.scheduledFor)} · Production Floor 1
          </div>

          <div className="detail-meta">
            <Meta label="Planned output" value={fmt.qty(o.plannedOutputQuantity, 'KG')} />
            <Meta label="Expected yield" value={`${recipe.expectedYieldPercent}%`} />
            <Meta label="Recipe scale" value={`×${scale.toFixed(2)}`} />
            <Meta label="Created by" value={o.createdBy} soft />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Planned consumption</h3>
            <span className="card__sub">Auto-computed from recipe × {scale.toFixed(2)}</span>
          </div>
        </div>
        <div className="card__body card__body--flush">
          <table className="table">
            <thead>
              <tr>
                <th>Ingredient</th><th>Recipe per {recipe.outputQuantity}kg</th>
                <th className="num">Planned qty</th><th>UOM</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((i, idx) => {
                const planned = (parseFloat(i.quantity) * scale).toFixed(3);
                return (
                  <tr key={idx}>
                    <td><ProductCell name={i.name} /></td>
                    <td><span className="muted num">{i.quantity}</span></td>
                    <td className="num"><strong>{planned}</strong></td>
                    <td>{i.uom}</td>
                    <td><span className="muted">{i.isOptional ? 'Optional' : 'Required'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// =========================================================
// IN_PROGRESS — the killer screen
// =========================================================
function InProgress({ order: o }) {
  const recipe = DATA.recipes.find(r => r.id === o.recipeId);
  const inputs = o.inputs;

  let totalActualMass = 0;
  let totalCost = 0;
  inputs.forEach(i => {
    if (i.actualQuantity !== null) {
      const cat = (DATA.products.find(p => p.id === i.product.id) || {}).category;
      if (['Beef', 'Pork', 'Lamb'].includes(cat)) totalActualMass += parseFloat(i.actualQuantity);
      i.consumedLots.forEach(c => { totalCost += parseFloat(c.quantity) * parseFloat(c.unitCost); });
    }
  });

  const beefLots = DATA.lots
    .filter(l => l.productId === 'prod-001' && l.status === 'AVAILABLE')
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  return (
    <AppShell activeRoute="#/production" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Operations' }, { label: 'Production', href: '#/production' }, { label: o.orderNumber }]}
        title={o.orderNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="stop" /> Pause</button>
          <button className="btn btn--danger"><Icon name="x" /> Cancel</button>
          <button className="btn btn--primary btn--lg"><Icon name="check" /> Complete production</button>
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{recipe.name}</h2>
            <StatusPill status={o.status} />
            <span className="elapsed"><span className="dot" />{fmt.elapsed(o.startedAt)} elapsed</span>
          </div>
          <div className="detail-head__sub">
            Started {fmt.dateTime(o.startedAt)} by {o.createdBy} · Production Floor 1
          </div>

          <div className="detail-meta">
            <Meta label="Planned output" value={fmt.qty(o.plannedOutputQuantity, 'KG')} />
            <Meta label="Inputs consumed" value={`${totalActualMass.toFixed(3)} kg`} />
            <Meta label="Running cost"   value={fmt.money(totalCost, 'UZS')} />
            <Meta label="Recipe"         value={`${recipe.code} v${recipe.version}`} soft />
          </div>
        </div>
      </div>

      <div className="prod-grid">
        <div className="vstack gap-20">
          <div className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Ingredient consumption</h3>
                <span className="card__sub">Tap an actual quantity to see lot suggestions · auto-saves on blur.</span>
              </div>
              <div className="hstack">
                <span className="pill pill--green"><span className="dot" />Auto-save on</span>
                <button className="icon-btn"><Icon name="refresh" /></button>
              </div>
            </div>
            <div className="card__body card__body--flush">
              {inputs.map((i, idx) => {
                const planned = parseFloat(i.plannedQuantity);
                const actual  = i.actualQuantity !== null ? parseFloat(i.actualQuantity) : null;
                const variancePct = actual !== null && planned > 0 ? ((actual - planned) / planned) * 100 : null;
                const tone = variancePct === null ? '' : Math.abs(variancePct) > 10 ? 'bad' : Math.abs(variancePct) > 5 ? 'warn' : 'ok';
                const focused = idx === 0;
                return (
                  <div key={idx} className="input-row" style={focused ? { background: 'var(--brand-50)' } : undefined}>
                    <div className="input-row__product">
                      <strong>{i.product.name}</strong>
                      <span>{i.product.sku}</span>
                    </div>
                    <div className="input-row__planned">
                      Planned: <strong style={{ color: 'var(--text)' }}>{fmt.qty(i.plannedQuantity, 'KG')}</strong>
                    </div>
                    <div className="input-row__actual">
                      <div className="input-group">
                        <input className="input" defaultValue={i.actualQuantity || ''} placeholder="0.000" autoFocus={focused} />
                        <span className="input-group__suffix">KG</span>
                      </div>
                      {variancePct !== null ? (
                        <div style={{ marginTop: 4, textAlign: 'right' }}>
                          <span className={`variance variance--${tone}`}>
                            {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}% vs plan
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="input-row__lots">
                      {i.consumedLots.length ? (
                        i.consumedLots.map((c, k) => (
                          <span key={k} className="lot-chip">
                            <Icon name="package" /> {c.lotNumber} · {parseFloat(c.quantity).toFixed(3)}kg
                          </span>
                        ))
                      ) : (
                        <span className="muted">No lots yet — focus the input to suggest</span>
                      )}
                    </div>
                    <div>
                      {actual !== null
                        ? <span className="pill pill--green"><Icon name="check" /> Saved</span>
                        : <span className="pill pill--slate">Pending</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="vstack gap-20">
          <div className="suggest">
            <div className="suggest__title">
              <Icon name="zap" /> FIFO suggestions for{' '}
              <span className="mono" style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--text-muted)' }}>BEEF-TRIM-80</span>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
              Need <strong style={{ color: 'var(--text)' }}>14.500 kg</strong> more · sorted by oldest expiry
            </div>

            {beefLots.map(l => (
              <div key={l.id} className="suggest__lot">
                <div className="suggest__lot-head">
                  <span className="suggest__lot-num">{l.lotNumber}</span>
                  <ExpiryPill expiry={l.expiryDate} />
                </div>
                <div className="suggest__lot-meta">
                  <span>Avail: <strong style={{ color: 'var(--text)' }}>{fmt.qty(l.currentQuantity, l.uom)}</strong></span>
                  <span>Exp: {fmt.date(l.expiryDate)}</span>
                  <span>Wh: <span className="mono">CS-A</span></span>
                </div>
                <div className="suggest__lot-actions">
                  <span className="suggest__lot-cost">{fmt.money(l.unitCost, l.currency)}/{l.uom}</span>
                  <button className="btn btn--primary btn--sm"><Icon name="plus" /> Use 14.500 kg</button>
                </div>
              </div>
            ))}

            <div className="muted" style={{ fontSize: 11.5, marginTop: 8, textAlign: 'center' }}>
              Override sources are logged to the order notes.
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h3 className="card__title">Running totals</h3></div>
            <div className="card__body">
              <dl className="cumul">
                <Row dt="Inputs consumed" dd={`${totalActualMass.toFixed(3)} kg`} />
                <Row dt="Total input cost" dd={fmt.money(totalCost, 'UZS')} />
                <Row dt="Projected output" dd={`${(totalActualMass * 0.96).toFixed(2)} kg`} />
                <Row dt="Projected unit cost" dd={`${fmt.money(totalCost / Math.max(totalActualMass * 0.96, 1), 'UZS')} / kg`} />
              </dl>

              <div className="divider" />

              <div className="cumul__bar">
                <div className="cumul__bar-label">
                  <span>Lot consumption · BEEF-TRIM-2026-05-001</span>
                  <span>28%</span>
                </div>
                <div className="cumul__bar-track"><div className="cumul__bar-fill" style={{ width: '28%' }} /></div>
              </div>

              <div className="cumul__bar" style={{ marginTop: 10 }}>
                <div className="cumul__bar-label">
                  <span>Lot consumption · BEEF-FAT-2026-05-001</span>
                  <span>15%</span>
                </div>
                <div className="cumul__bar-track"><div className="cumul__bar-fill" style={{ width: '15%' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// =========================================================
// COMPLETED
// =========================================================
function Completed({ order: o }) {
  const recipe = DATA.recipes.find(r => r.id === o.recipeId);
  const outputLot = DATA.lots.find(l => l.id === o.outputLotId);
  const drifts = [-0.04, 0.02, -0.01, 0.0];

  return (
    <AppShell activeRoute="#/production" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Operations' }, { label: 'Production', href: '#/production' }, { label: o.orderNumber }]}
        title={o.orderNumber}
        actions={<>
          <button className="btn btn--outline"><Icon name="printer" /> Print</button>
          <button className="btn btn--outline"><Icon name="history" /> View movements</button>
          <a className="btn btn--primary" href="#/traceability"><Icon name="trace" /> View traceability</a>
        </>}
      />

      <div className="detail-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="detail-head__title-row">
            <h2 className="detail-head__title">{recipe.name}</h2>
            <StatusPill status={o.status} />
          </div>
          <div className="detail-head__sub">
            Completed {fmt.dateTime(o.completedAt)} by {o.completedBy}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat stat--green">
          <div className="stat__icon"><Icon name="trending_up" /></div>
          <div className="stat__label">Yield</div>
          <div className="stat__value">{o.yieldPercent}%</div>
          <span className="muted">
            {fmt.qty(o.plannedOutputQuantity, 'KG')} planned → {fmt.qty(o.actualOutputQuantity, 'KG')} actual
          </span>
        </div>
        <div className="stat stat--brand">
          <div className="stat__icon"><Icon name="dollar" /></div>
          <div className="stat__label">Cost</div>
          <div className="stat__value">{fmt.money(o.unitOutputCost, 'UZS')} / kg</div>
          <span className="muted">Total input cost {fmt.money(o.totalInputCost, 'UZS')}</span>
        </div>
        <div className="stat stat--blue">
          <div className="stat__icon"><Icon name="package" /></div>
          <div className="stat__label">Output lot</div>
          <div className="stat__value" style={{ fontSize: 18 }}>{outputLot ? outputLot.lotNumber : '—'}</div>
          {outputLot ? (
            <a href={`#/inventory/${outputLot.id}`} className="muted">
              View lot <Icon name="arrow_right" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Planned vs actual</h3>
          <span className="card__sub">Variance highlighted</span>
        </div>
        <div className="card__body card__body--flush">
          <table className="table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th className="num">Planned</th>
                <th className="num">Actual</th>
                <th>Variance</th>
                <th>Lots consumed</th>
                <th className="num">Cost</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, idx) => {
                const planned = (parseFloat(ing.quantity) * (parseFloat(o.plannedOutputQuantity) / parseFloat(recipe.outputQuantity))).toFixed(3);
                const drift = drifts[idx] || 0;
                const actual = (parseFloat(planned) * (1 + drift)).toFixed(3);
                const variancePct = ((parseFloat(actual) - parseFloat(planned)) / parseFloat(planned)) * 100;
                const tone = Math.abs(variancePct) > 5 ? 'warn' : 'ok';
                const cost = parseFloat(actual) * 65000;
                return (
                  <tr key={idx}>
                    <td><ProductCell name={ing.name} /></td>
                    <td className="num">{planned}</td>
                    <td className="num"><strong>{actual}</strong></td>
                    <td>
                      <span className={`variance variance--${tone}`}>
                        {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td><span className="lot-chip"><Icon name="package" /> BEEF-TRIM-2026-05-001</span></td>
                    <td className="num">{fmt.money(cost, 'UZS')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ----- helpers -----
function Meta({ label, value, soft }) {
  return (
    <div className="detail-meta__item">
      <div className="detail-meta__label">{label}</div>
      <div className={`detail-meta__value ${soft ? 'detail-meta__value--soft' : ''}`}>{value}</div>
    </div>
  );
}
function Row({ dt, dd }) {
  return (
    <div className="cumul__row">
      <dt>{dt}</dt>
      <dd>{dd}</dd>
    </div>
  );
}
