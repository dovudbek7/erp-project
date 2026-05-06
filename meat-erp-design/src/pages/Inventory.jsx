import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { AppShell, PageHead, Chip, ProductCell, ExpiryPill, StatusPill, Pagination } from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

export default function Inventory() {
  const lots = DATA.lots.map(l => ({
    ...l,
    product: DATA.products.find(x => x.id === l.productId),
    warehouse: DATA.warehouses.find(x => x.id === l.warehouseId),
    days: fmt.daysToExpiry(l.expiryDate),
  }));

  return (
    <AppShell activeRoute="#/inventory" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Inventory' }, { label: 'Lots' }]}
        title="Lots"
        sub="All inventory batches with cost and expiry tracking."
        actions={<>
          <button className="btn btn--outline"><Icon name="filter" /> Filters · 2</button>
          <button className="btn btn--outline"><Icon name="download" /> Export CSV</button>
          <button className="btn btn--primary"><Icon name="plus" /> Adjust stock</button>
        </>}
      />

      <div className="hstack gap-12" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip active>All statuses</Chip>
        <Chip>Available</Chip>
        <Chip>Quarantine</Chip>
        <Chip>Expired</Chip>
        <span style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <Chip active>All warehouses</Chip>
        <Chip>CS-A</Chip>
        <Chip>FG-A</Chip>
        <Chip>PROD-1</Chip>
        <span style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <Chip active closable>Has stock</Chip>
        <Chip active closable>Expiring &lt; 14d</Chip>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search lot number or supplier reference..." />
          </div>
          <div className="table-toolbar__right">
            <button className="btn btn--ghost btn--sm"><Icon name="refresh" /></button>
            <button className="btn btn--outline btn--sm"><Icon name="settings" /> Columns</button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" /></th>
              <th>Lot Number</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th className="num">Current Qty</th>
              <th className="num">Unit Cost</th>
              <th>Expiry</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id} onClick={() => (window.location.hash = `#/inventory/${l.id}`)}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td className="mono"><strong>{l.lotNumber}</strong></td>
                <td><ProductCell name={l.product.name} sku={l.product.sku} /></td>
                <td><span className="muted mono">{l.warehouse.code}</span> · {l.warehouse.name}</td>
                <td><StatusPill status={l.status} /></td>
                <td className="num">{fmt.qty(l.currentQuantity, l.uom)}</td>
                <td className="num">{fmt.money(l.unitCost, l.currency)} <span className="muted">/{l.uom}</span></td>
                <td>
                  <ExpiryPill expiry={l.expiryDate} />
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{fmt.date(l.expiryDate)}</div>
                </td>
                <td><span className="pill pill--slate">{l.source}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="icon-btn"><Icon name="more_h" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={1} pageSize={25} total={lots.length} />
      </div>
    </AppShell>
  );
}
