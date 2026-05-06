import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip, StatusPill, Pagination } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function Sales() {
  const orders = DATA.salesOrders;
  return (
    <AppShell activeRoute="#/sales" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Commercial' }, { label: 'Sales Orders' }]}
        title="Sales Orders"
        sub="From quote to cash — track allocation, picking, delivery and invoicing."
        actions={<>
          <button className="btn btn--outline"><Icon name="download" /> Export</button>
          <button className="btn btn--primary"><Icon name="plus" /> New sales order</button>
        </>}
      />

      <div className="hstack gap-12" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip active>All</Chip>
        <Chip>Draft</Chip>
        <Chip>Confirmed</Chip>
        <Chip>Picked</Chip>
        <Chip>Delivered</Chip>
        <Chip>Invoiced</Chip>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search SO number or customer..." />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>SO Number</th><th>Customer</th><th>Type</th><th>Status</th>
              <th className="num">Lines</th><th>Order date</th><th>Promised</th>
              <th className="num">Total</th><th className="num">Margin</th><th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} onClick={() => (window.location.hash = `#/sales/${o.id}`)}>
                <td className="mono"><strong>{o.orderNumber}</strong></td>
                <td>{o.customer}</td>
                <td><StatusPill status={o.customerType} /></td>
                <td><StatusPill status={o.status} /></td>
                <td className="num">{o.linesCount}</td>
                <td>{fmt.date(o.orderDate)}</td>
                <td>{fmt.date(o.promisedDate)}</td>
                <td className="num"><strong>{fmt.money(o.totalAmount, o.currency)}</strong></td>
                <td className="num">
                  {o.grossMargin
                    ? <span className="pill pill--green">+{fmt.money(o.grossMargin, o.currency)}</span>
                    : <span className="muted">—</span>}
                </td>
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
