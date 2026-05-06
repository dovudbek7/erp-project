import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

const SUPPLIERS_IN_BATCH = [
  { code: 'SX', name: 'Sultanov Xojadod LLC', kg: 75 },
  { code: 'AB', name: 'Andijan Beef Farm',     kg: 15 },
  { code: 'TS', name: 'Tashkent Spice Co',     kg: 1  },
];

export default function Traceability() {
  return (
    <AppShell activeRoute="#/traceability" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Insights' }, { label: 'Traceability' }]}
        title="Traceability"
        sub="If a recall happens, this is the screen that maps every kilo back to its source."
      />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__body">
          <div className="form-grid form-grid--3">
            <div className="field">
              <label className="field__label">Lot</label>
              <select className="select"><option>MINCE-2026-05-001 · Beef Mince 80/20</option></select>
            </div>
            <div className="field">
              <label className="field__label">Direction</label>
              <select className="select">
                <option>Backward — where it came from</option>
                <option>Forward — where it went</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label">Depth</label>
              <select className="select"><option>5 levels</option></select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3-2">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Backward traceability tree</h3>
            <span className="card__sub">Click any lot to drill down</span>
          </div>
          <div className="card__body">
            <div className="tree">
              <div className="tree__node">
                <div className="tree__line">
                  <span className="pill pill--green"><span className="dot" />FINISHED</span>
                  <span className="lot-num">MINCE-2026-05-001</span>
                  <span className="muted">Beef Mince 80/20</span>
                  <span className="qty">72.000 KG</span>
                </div>
                <div className="tree__children">
                  <ParentNode tone="blue" tag="RAW" lot="BEEF-TRIM-2026-05-001" name="Beef Trim 80/20 — Sultanov Xojadod" qty="60.000 KG used" />
                  <ParentNode tone="blue" tag="RAW" lot="BEEF-CHUCK-2026-05-001" name="Beef Chuck — Andijan Beef Farm" qty="15.000 KG used" />
                  <ParentNode tone="blue" tag="RAW" lot="BEEF-FAT-2026-05-001" name="Beef Fat Trim — Sultanov Xojadod" qty="15.000 KG used" />
                  <ParentNode tone="slate" tag="SPICE" lot="SALT-2026-Q2" name="Salt — Tashkent Spice Co" qty="0.600 KG used" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vstack gap-20">
          <div className="card">
            <div className="card__header"><h3 className="card__title">Summary</h3></div>
            <div className="card__body">
              <dl className="cumul">
                <Row dt="Output lot"        dd={<span className="mono" style={{ fontSize: 12.5 }}>MINCE-2026-05-001</span>} />
                <Row dt="Parent lots"       dd="4" />
                <Row dt="Suppliers involved" dd="3" />
                <Row dt="Earliest receipt"  dd={fmt.date('2026-04-05')} />
                <Row dt="Production order"  dd={<span className="mono" style={{ fontSize: 12.5 }}>PRD-2026-0001</span>} />
                <Row dt="Total parent cost" dd={fmt.money(4875000, 'UZS')} />
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h3 className="card__title">Suppliers in this batch</h3></div>
            <div className="card__body card__body--flush">
              {SUPPLIERS_IN_BATCH.map(s => (
                <div key={s.code} className="hstack" style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-soft)',
                  justifyContent: 'space-between',
                }}>
                  <div className="hstack">
                    <div className="avatar avatar--sm">{s.code}</div>
                    <strong style={{ fontSize: 13 }}>{s.name}</strong>
                  </div>
                  <span className="num muted">{s.kg}.000 kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ParentNode({ tone, tag, lot, name, qty }) {
  return (
    <div className="tree__node">
      <div className="tree__line">
        <span className={`pill pill--${tone}`}><span className="dot" />{tag}</span>
        <span className="lot-num">{lot}</span>
        <span className="muted">{name}</span>
        <span className="qty">{qty}</span>
      </div>
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
