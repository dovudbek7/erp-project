import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip, StatusPill, Pagination } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function Purchase() {
  const pos = DATA.purchaseOrders;
  return (
    <AppShell activeRoute="#/purchase" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Operations' }, { label: 'Purchase Orders' }]}
        title="Purchase Orders"
        sub="Track supplier orders from draft through receiving."
        actions={<>
          <button className="btn btn--outline"><Icon name="download" /> Export</button>
          <button className="btn btn--primary"><Icon name="plus" /> New PO</button>
        </>}
      />

      <div className="hstack gap-12" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip active>All</Chip>
        <Chip>Draft</Chip>
        <Chip>Submitted</Chip>
        <Chip>Partial</Chip>
        <Chip>Received</Chip>
        <Chip>Cancelled</Chip>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search PO number or supplier..." />
          </div>
          <div className="table-toolbar__right">
            <button className="btn btn--outline btn--sm"><Icon name="filter" /> Filter</button>
            <button className="btn btn--outline btn--sm"><Icon name="settings" /> Columns</button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>PO Number</th><th>Supplier</th><th>Status</th>
              <th className="num">Lines</th><th>Order Date</th><th>Expected</th>
              <th className="num">Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pos.map(p => (
              <tr key={p.id} onClick={() => (window.location.hash = `#/purchase/${p.id}`)}>
                <td className="mono"><strong>{p.poNumber}</strong></td>
                <td>{p.supplier}</td>
                <td><StatusPill status={p.status} /></td>
                <td className="num">{p.linesCount}</td>
                <td>{fmt.date(p.orderDate)}</td>
                <td>{fmt.date(p.expectedDate)}</td>
                <td className="num"><strong>{fmt.money(p.totalAmount, p.currency)}</strong></td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="icon-btn"><Icon name="more_h" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={1} pageSize={25} total={pos.length} />
      </div>
    </AppShell>
  );
}
