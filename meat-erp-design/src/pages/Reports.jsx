import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip } from '../lib/ui.jsx';
import { DATA } from '../lib/data.js';

const REPORTS = [
  { key: 'inventory-valuation', title: 'Inventory valuation', desc: 'Total stock value by warehouse and product type.', icon: 'package',       tone: 'brand' },
  { key: 'yield',               title: 'Yield by recipe',     desc: 'Compare planned vs actual yields across production runs.', icon: 'trending_up', tone: 'green' },
  { key: 'expiry-aging',        title: 'Expiry aging',        desc: 'Lots bucketed by days to expiry — protect your stock.', icon: 'clock',      tone: 'amber' },
  { key: 'sales-margin',        title: 'Sales margin',        desc: 'Revenue, COGS and margin per customer or product.',     icon: 'dollar',     tone: 'blue'  },
  { key: 'traceability',        title: 'Traceability',        desc: 'Trace any lot backward to suppliers or forward to customers.', icon: 'trace', tone: 'purple' },
  { key: 'ar',                  title: 'Accounts receivable', desc: 'Outstanding invoices and aging buckets.',                icon: 'invoice',    tone: 'green' },
];

export default function Reports() {
  return (
    <AppShell activeRoute="#/reports" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Insights' }, { label: 'Reports' }]}
        title="Reports"
        sub="Inventory valuation, yield analysis, sales margin and expiry aging."
        actions={<button className="btn btn--outline"><Icon name="download" /> Export</button>}
      />

      <div className="grid-2">
        {REPORTS.map(r => (
          <a
            key={r.key}
            href={r.key === 'traceability' ? '#/traceability' : '#/reports'}
            className="card"
            style={{ display: 'block', padding: 0, textDecoration: 'none' }}
          >
            <div className="card__body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center',
                background: `var(--${r.tone}-50)`,
                color: `var(--${r.tone === 'brand' ? 'brand-600' : r.tone + '-700'})`,
              }}>
                <Icon name={r.icon} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 15, display: 'block' }}>{r.title}</strong>
                <span className="muted" style={{ fontSize: 13 }}>{r.desc}</span>
              </div>
              <Icon name="arrow_right" />
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card__header">
          <div>
            <h3 className="card__title">Yield by recipe — last 30 days</h3>
            <span className="card__sub">Average yield % per recipe, planned vs actual</span>
          </div>
          <div className="hstack">
            <Chip active>All recipes</Chip>
            <Chip>Beef Mince 80/20</Chip>
            <Chip>Lula Kebab</Chip>
          </div>
        </div>
        <div className="card__body card__body--flush">
          <table className="table">
            <thead>
              <tr>
                <th>Recipe</th><th className="num">Runs</th>
                <th className="num">Planned (kg)</th><th className="num">Actual (kg)</th>
                <th className="num">Avg yield</th><th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Beef Mince 80/20</strong> <span className="muted mono">RCP-MINCE-80</span></td>
                <td className="num">8</td>
                <td className="num">650.000</td>
                <td className="num">624.000</td>
                <td className="num"><span className="pill pill--green">96.0%</span></td>
                <td>
                  <div className="cell-progress">
                    <div className="bar"><span style={{ width: '96%' }} /></div>
                    <span className="pct">96%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Lula Kebab</strong> <span className="muted mono">RCP-LULA</span></td>
                <td className="num">3</td>
                <td className="num">240.000</td>
                <td className="num">225.000</td>
                <td className="num"><span className="pill pill--amber">93.8%</span></td>
                <td>
                  <div className="cell-progress">
                    <div className="bar"><span style={{ width: '94%', background: 'var(--amber-500)' }} /></div>
                    <span className="pct">94%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Pork Sausage</strong> <span className="muted mono">RCP-SAUSAGE</span></td>
                <td className="num">2</td>
                <td className="num">100.000</td>
                <td className="num">98.500</td>
                <td className="num"><span className="pill pill--green">98.5%</span></td>
                <td>
                  <div className="cell-progress">
                    <div className="bar"><span style={{ width: '98%' }} /></div>
                    <span className="pct">98%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
