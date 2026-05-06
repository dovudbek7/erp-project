import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip, StatusPill, Pagination } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function Production() {
  const orders = DATA.productionOrders;
  return (
    <AppShell activeRoute="#/production" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Operations' }, { label: 'Production' }]}
        title="Production Orders"
        sub="Recipes scaled to a target output, then weighed and produced on the floor."
        actions={<>
          <button className="btn btn--outline"><Icon name="download" /> Export</button>
          <button className="btn btn--primary"><Icon name="plus" /> New production order</button>
        </>}
      />

      <div className="hstack gap-12" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip active>All</Chip>
        <Chip>Draft</Chip>
        <Chip>In progress</Chip>
        <Chip>Completed</Chip>
        <Chip>Cancelled</Chip>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search order number..." />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th><th>Recipe</th><th>Status</th>
              <th className="num">Planned</th><th className="num">Actual</th><th className="num">Yield</th>
              <th>Scheduled</th><th>Created by</th><th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} onClick={() => (window.location.hash = `#/production/${o.id}`)}>
                <td className="mono"><strong>{o.orderNumber}</strong></td>
                <td>{o.recipeName}</td>
                <td><StatusPill status={o.status} /></td>
                <td className="num">{fmt.qty(o.plannedOutputQuantity, 'KG')}</td>
                <td className="num">
                  {o.actualOutputQuantity ? fmt.qty(o.actualOutputQuantity, 'KG') : <span className="muted">—</span>}
                </td>
                <td className="num">
                  {o.yieldPercent ? <span className="pill pill--green">{o.yieldPercent}%</span> : <span className="muted">—</span>}
                </td>
                <td>{fmt.dateTime(o.scheduledFor)}</td>
                <td>{o.createdBy}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="icon-btn"><Icon name="more_h" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} pageSize={25} total={orders.length} />
      </div>
    </AppShell>
  );
}
