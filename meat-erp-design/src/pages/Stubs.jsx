import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import {
  AppShell, PageHead, Chip, Pagination, ProductCell, StatusPill, Empty,
} from '../lib/ui.jsx';
import { DATA, fmt } from '../lib/data.js';

// Generic list shell used by the simple CRUD-style pages below.
function StubList({ activeRoute, title, sub, rows, columns }) {
  return (
    <AppShell activeRoute={activeRoute} tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: title }]}
        title={title}
        sub={sub}
        actions={<button className="btn btn--primary"><Icon name="plus" /> Add</button>}
      />
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search..." />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key} className={c.cls || ''}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id || r.code}>
                {columns.map(c => (
                  <td key={c.key} className={c.cls || ''}>
                    {c.render ? c.render(r) : (r[c.key] ?? '—')}
                  </td>
                ))}
                <td><button className="icon-btn"><Icon name="more_h" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} pageSize={25} total={rows.length} />
      </div>
    </AppShell>
  );
}

// =========================================================
export function Warehouses() {
  return (
    <StubList
      activeRoute="#/warehouses"
      title="Warehouses"
      sub="Manage your storage locations."
      rows={DATA.warehouses}
      columns={[
        { key: 'code', label: 'Code', cls: 'mono' },
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type', render: w => <StatusPill status={w.type} /> },
      ]}
    />
  );
}

// =========================================================
export function Products() {
  return (
    <StubList
      activeRoute="#/products"
      title="Products"
      sub="Raw materials and finished goods catalogue."
      rows={DATA.products}
      columns={[
        { key: 'sku', label: 'SKU', cls: 'mono' },
        { key: 'name', label: 'Name', render: p => <ProductCell name={p.name} sku={p.sku} /> },
        { key: 'type', label: 'Type', render: p => (
          <span className={`pill pill--${p.type === 'FINISHED_GOOD' ? 'green' : 'slate'}`}>
            {p.type.replace('_', ' ')}
          </span>
        ) },
        { key: 'category', label: 'Category' },
        { key: 'uom', label: 'UOM' },
        { key: 'shelfLifeDays', label: 'Shelf life (days)', cls: 'num' },
      ]}
    />
  );
}

// =========================================================
export function Recipes() {
  return (
    <StubList
      activeRoute="#/recipes"
      title="Recipes"
      sub="Bill of materials for each finished good."
      rows={DATA.recipes}
      columns={[
        { key: 'code', label: 'Code', cls: 'mono' },
        { key: 'name', label: 'Name', render: r => <strong>{r.name}</strong> },
        { key: 'version', label: 'Version', render: r => <span className="pill pill--slate">v{r.version}</span> },
        { key: 'outputQuantity', label: 'Output (kg)', cls: 'num' },
        { key: 'expectedYieldPercent', label: 'Expected yield', cls: 'num',
          render: r => <span className="pill pill--green">{r.expectedYieldPercent}%</span> },
        { key: 'isActive', label: 'Active',
          render: r => r.isActive
            ? <span className="pill pill--green"><Icon name="check" /> Active</span>
            : <span className="pill pill--slate">Inactive</span> },
      ]}
    />
  );
}

// =========================================================
export function Customers() {
  return (
    <StubList
      activeRoute="#/customers"
      title="Customers"
      sub="Retailers, restaurants, wholesalers and distributors."
      rows={DATA.customers}
      columns={[
        { key: 'code', label: 'Code', cls: 'mono' },
        { key: 'name', label: 'Name', render: c => <strong>{c.name}</strong> },
        { key: 'type', label: 'Type', render: c => <StatusPill status={c.type} /> },
        { key: 'paymentTermsDays', label: 'Payment terms', cls: 'num',
          render: c => `${c.paymentTermsDays} days` },
      ]}
    />
  );
}

// =========================================================
export function Invoices() {
  const invoices = DATA.salesOrders.map((s, i) => ({
    id: s.id,
    invoiceNumber: 'INV-' + s.orderNumber.replace('SO-', ''),
    customer: s.customer,
    salesOrder: s.orderNumber,
    issueDate: s.orderDate,
    dueDate: s.promisedDate,
    total: s.totalAmount,
    paid: i === 1 ? s.totalAmount : i === 0 ? '500000.00' : '0.00',
    status: i === 1 ? 'PAID' : i === 0 ? 'PARTIALLY_PAID' : 'ISSUED',
  }));

  return (
    <AppShell activeRoute="#/invoices" tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead
        crumbs={[{ label: 'Commercial' }, { label: 'Invoices' }]}
        title="Invoices"
        sub="Issued invoices and payment status."
        actions={<button className="btn btn--primary"><Icon name="plus" /> New invoice</button>}
      />

      <div className="hstack gap-12" style={{ marginBottom: 14 }}>
        <Chip active>All</Chip>
        <Chip>Issued</Chip>
        <Chip>Partially paid</Chip>
        <Chip>Paid</Chip>
        <Chip>Overdue</Chip>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th><th>Customer</th><th>Sales order</th>
              <th>Issued</th><th>Due</th>
              <th className="num">Total</th><th className="num">Paid</th>
              <th className="num">Outstanding</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const out = parseFloat(inv.total) - parseFloat(inv.paid);
              const tone = inv.status === 'PAID' ? 'green'
                         : inv.status === 'PARTIALLY_PAID' ? 'amber'
                         : 'blue';
              return (
                <tr key={inv.id}>
                  <td className="mono"><strong>{inv.invoiceNumber}</strong></td>
                  <td>{inv.customer}</td>
                  <td className="mono"><a href="#" className="muted">{inv.salesOrder}</a></td>
                  <td>{fmt.date(inv.issueDate)}</td>
                  <td>{fmt.date(inv.dueDate)}</td>
                  <td className="num"><strong>{fmt.money(inv.total, 'UZS')}</strong></td>
                  <td className="num">{fmt.money(inv.paid, 'UZS')}</td>
                  <td className="num">{out > 0 ? fmt.money(out, 'UZS') : <span className="muted">—</span>}</td>
                  <td><span className={`pill pill--${tone}`}>{inv.status.replace('_', ' ')}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

// =========================================================
export function NotFound({ route }) {
  return (
    <AppShell activeRoute={route} tenant={DATA.tenant} currentUser={DATA.currentUser}>
      <PageHead title="Not found" sub={`No route matches ${route}`} />
      <div className="card">
        <Empty
          icon="alert"
          title="This page does not exist yet"
          message={<>Try the <a href="#/dashboard">dashboard</a>.</>}
        />
      </div>
    </AppShell>
  );
}
