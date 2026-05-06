import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip, ProductCell, ExpiryPill, StatusPill } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function Dashboard() {
  const trend = DATA.productionTrend;
  const maxKg = Math.max(...trend.map(t => t.kg), 1);

  const expiringLots = DATA.lots
    .filter(l => l.status === 'AVAILABLE' || l.status === 'QUARANTINE')
    .map(l => ({ ...l, days: fmt.daysToExpiry(l.expiryDate) }))
    .filter(l => l.days !== null && l.days <= 7)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const activeProd = DATA.productionOrders.filter(p => p.status === 'IN_PROGRESS' || p.status === 'DRAFT');

  const stats = [
    { tone: 'brand', icon: 'dollar',  label: 'Stock-on-hand value', value: '85.0M UZS', delta: '+12.4%',                dir: 'up'   },
    { tone: 'amber', icon: 'clock',   label: 'Lots expiring (7d)',   value: `${expiringLots.length} lots`, delta: '+2 since yesterday', dir: 'up'   },
    { tone: 'green', icon: 'factory', label: 'Active production',    value: `${activeProd.length} orders`, delta: 'On schedule',        dir: 'flat' },
    { tone: 'blue',  icon: 'invoice', label: 'Outstanding AR',       value: '12.5M UZS', delta: '-3.1% vs last week',   dir: 'down' },
  ];

  return (
    <AppShell activeRoute="#/dashboard" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        title={`Good morning, ${DATA.currentUser.fullName.split(' ')[0]}`}
        sub={`Here's what's happening at ${DATA.tenant.name} today — May 5, 2026.`}
        actions={<>
          <button className="btn btn--outline"><Icon name="download" /> Export</button>
          <button className="btn btn--primary"><Icon name="plus" /> New production order</button>
        </>}
      />

      <div className="stats">
        {stats.map((s, i) => (
          <div key={i} className={`stat stat--${s.tone}`}>
            <div className="stat__icon"><Icon name={s.icon} /></div>
            <div className="stat__label">{s.label}</div>
            <div className="stat__value">{s.value}</div>
            <span className={`stat__delta stat__delta--${s.dir}`}>
              {s.dir === 'up' ? <Icon name="trending_up" /> : s.dir === 'down' ? <Icon name="trending_down" /> : null}
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-3-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Production output (last 14 days)</h3>
              <div className="card__sub">Total kg of finished goods produced per day</div>
            </div>
            <div className="hstack">
              <Chip active>14d</Chip>
              <Chip>30d</Chip>
              <Chip>90d</Chip>
            </div>
          </div>
          <div className="card__body">
            <div className="bars">
              {trend.map((t, i) => (
                <div key={i} className="bars__col" title={`${t.day}: ${t.kg} kg`}>
                  <div className="bars__bar" style={{ height: `${(t.kg / maxKg) * 130}px` }} />
                  <span className="bars__label">{t.day.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card__footer">
            <div className="hstack" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Total: <strong className="num" style={{ color: 'var(--text)' }}>1,225 kg</strong></span>
              <span className="muted">Avg yield: <strong style={{ color: 'var(--text)' }}>95.4%</strong></span>
              <span className="muted">Best day: <strong style={{ color: 'var(--text)' }}>May 02 — 145 kg</strong></span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Activity</h3>
            <a href="#" className="muted">View all</a>
          </div>
          <div className="card__body card__body--flush">
            <div className="timeline" style={{ padding: '8px 16px 16px' }}>
              {DATA.feed.map((f, i) => (
                <div key={i} className="timeline__item">
                  <div className={`timeline__bullet timeline__bullet--${f.tone}`}><Icon name={f.icon} /></div>
                  <div className="timeline__title">{f.text}</div>
                  <div className="timeline__meta">{f.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Lots expiring this week</h3>
              <div className="card__sub">Take action before stock is written off</div>
            </div>
            <a className="btn btn--outline btn--sm" href="#/expiring"><Icon name="arrow_right" /> Open</a>
          </div>
          <div className="card__body card__body--flush">
            <table className="table">
              <thead>
                <tr><th>Lot</th><th>Product</th><th className="num">Qty</th><th>Expiry</th></tr>
              </thead>
              <tbody>
                {expiringLots.map(l => {
                  const p = DATA.products.find(x => x.id === l.productId);
                  return (
                    <tr key={l.id} onClick={() => (window.location.hash = `#/inventory/${l.id}`)}>
                      <td className="mono">{l.lotNumber}</td>
                      <td><ProductCell name={p.name} sku={p.sku} /></td>
                      <td className="num">{fmt.qty(l.currentQuantity, l.uom)}</td>
                      <td>
                        <ExpiryPill expiry={l.expiryDate} />{' '}
                        <span className="muted" style={{ marginLeft: 6 }}>{fmt.date(l.expiryDate)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Active production orders</h3>
              <div className="card__sub">Currently on the floor</div>
            </div>
            <a className="btn btn--outline btn--sm" href="#/production"><Icon name="arrow_right" /> Open</a>
          </div>
          <div className="card__body card__body--flush">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Recipe</th><th className="num">Planned</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activeProd.map(p => (
                  <tr key={p.id} onClick={() => (window.location.hash = `#/production/${p.id}`)}>
                    <td className="mono"><strong>{p.orderNumber}</strong></td>
                    <td>{p.recipeName}</td>
                    <td className="num">{fmt.qty(p.plannedOutputQuantity, 'KG')}</td>
                    <td><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
