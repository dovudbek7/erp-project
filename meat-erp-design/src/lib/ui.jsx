import React from 'react';
import { Icon } from './Icon.jsx';
import { fmt, PILLS } from './data.js';

// ============================================================
// Status pills
// ============================================================
export function StatusPill({ status }) {
  const meta = PILLS[status] || { tone: 'slate', label: status };
  return (
    <span className={`pill pill--${meta.tone}`}>
      <span className="dot" />{meta.label}
    </span>
  );
}

export function ExpiryPill({ expiry }) {
  const d = fmt.daysToExpiry(expiry);
  if (d === null) return <span className="muted">—</span>;
  if (d < 0)   return <span className="pill pill--red">EXPIRED</span>;
  if (d <= 14) return <span className="pill pill--amber">{d}d left</span>;
  return <span className="muted num">{d}d</span>;
}

// ============================================================
// Cell helpers
// ============================================================
export function ProductCell({ name, sku }) {
  const initial = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="cell-prod">
      <div className="avatar avatar--sm">{initial}</div>
      <div>
        <strong>{name}</strong>
        {sku ? <div className="cell-prod__sku">{sku}</div> : null}
      </div>
    </div>
  );
}

export function ProgressCell({ received, ordered }) {
  const r = parseFloat(received), o = parseFloat(ordered);
  const pct = o > 0 ? Math.min(100, Math.round((r / o) * 100)) : 0;
  return (
    <div className="cell-progress">
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
      <span className="pct">{pct}%</span>
    </div>
  );
}

// ============================================================
// Pagination
// ============================================================
export function Pagination({ page = 1, pageSize = 25, total = 0 }) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(total, page * pageSize);
  const pages = Array.from({ length: last }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <span>Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong></span>
      <div className="pagination__pages">
        <button className="page-btn" aria-label="Previous"><Icon name="chevron_left" /></button>
        {pages.map(p => (
          <button key={p} className={`page-btn ${p === page ? 'is-active' : ''}`}>{p}</button>
        ))}
        <button className="page-btn" aria-label="Next"><Icon name="chevron_right" /></button>
      </div>
    </div>
  );
}

// ============================================================
// Chip
// ============================================================
export function Chip({ children, active = false, closable = false, onClick }) {
  return (
    <button className={`chip ${active ? 'is-active' : ''}`} onClick={onClick}>
      {children}
      {closable ? <span className="x"><Icon name="x" /></span> : null}
    </button>
  );
}

// ============================================================
// Page head
// ============================================================
export function PageHead({ crumbs, title, sub, actions }) {
  return (
    <div className="page-head">
      <div className="page-head__left">
        {crumbs?.length ? (
          <div className="page-head__crumbs">
            {crumbs.map((c, i) => i === crumbs.length - 1
              ? <span key={i}>{c.label}</span>
              : <React.Fragment key={i}>
                  <a href={c.href || '#'}>{c.label}</a>
                  <span className="sep">/</span>
                </React.Fragment>
            )}
          </div>
        ) : null}
        <h1 className="page-head__title">{title}</h1>
        {sub ? <div className="page-head__sub">{sub}</div> : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </div>
  );
}

// ============================================================
// Sidebar
// ============================================================
const NAV = [
  { group: 'Overview', items: [
    { route: '#/dashboard', icon: 'dashboard', label: 'Dashboard' },
  ]},
  { group: 'Inventory', items: [
    { route: '#/inventory',  icon: 'package',   label: 'Lots',           badge: '8' },
    { route: '#/expiring',   icon: 'clock',     label: 'Expiring soon',  badge: '3' },
    { route: '#/warehouses', icon: 'warehouse', label: 'Warehouses' },
    { route: '#/products',   icon: 'package',   label: 'Products' },
  ]},
  { group: 'Operations', items: [
    { route: '#/purchase',   icon: 'truck',   label: 'Purchase Orders' },
    { route: '#/production', icon: 'factory', label: 'Production',      badge: '1' },
    { route: '#/recipes',    icon: 'recipe',  label: 'Recipes' },
  ]},
  { group: 'Commercial', items: [
    { route: '#/sales',     icon: 'cart',    label: 'Sales Orders' },
    { route: '#/customers', icon: 'users',   label: 'Customers' },
    { route: '#/invoices',  icon: 'invoice', label: 'Invoices' },
  ]},
  { group: 'Insights', items: [
    { route: '#/reports',      icon: 'chart', label: 'Reports' },
    { route: '#/traceability', icon: 'trace', label: 'Traceability' },
  ]},
];

export function Sidebar({ activeRoute, tenant, currentUser }) {
  const isActive = (r) => activeRoute === r || activeRoute.startsWith(r + '/');
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo"><Icon name="fire" /></div>
        <div className="sidebar__brand-text">
          <strong>{tenant.name}</strong>
          <span>Meat ERP</span>
        </div>
      </div>
      <nav className="sidebar__nav">
        {NAV.map(group => (
          <div key={group.group} className="sidebar__group">
            <div className="sidebar__group-title">{group.group}</div>
            {group.items.map(it => (
              <a key={it.route} className={`sidebar__item ${isActive(it.route) ? 'is-active' : ''}`} href={it.route}>
                <Icon name={it.icon} /><span>{it.label}</span>
                {it.badge ? <span className="sidebar__badge">{it.badge}</span> : null}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar__user">
        <div className="avatar">{currentUser.initials}</div>
        <div className="sidebar__user-meta">
          <strong>{currentUser.fullName}</strong>
          <span>{PILLS[currentUser.role].label}</span>
        </div>
        <a className="icon-btn" href="#/login" title="Log out"><Icon name="logout" /></a>
      </div>
    </aside>
  );
}

// ============================================================
// Topbar
// ============================================================
export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <Icon name="search" />
        <input placeholder="Search lots, orders, customers — try 'BEEF-2026'" />
      </div>
      <div className="topbar__actions">
        <button className="icon-btn" title="Today"><Icon name="calendar" /></button>
        <button className="icon-btn" title="Refresh"><Icon name="refresh" /></button>
        <button className="icon-btn" title="Notifications"><Icon name="bell" /></button>
        <button className="btn btn--primary btn--sm"><Icon name="plus" /> New</button>
      </div>
    </header>
  );
}

// ============================================================
// App shell
// ============================================================
export function AppShell({ activeRoute, tenant, currentUser, children }) {
  return (
    <div className="app">
      <Sidebar activeRoute={activeRoute} tenant={tenant} currentUser={currentUser} />
      <div className="main">
        <Topbar />
        <main className="page">{children}</main>
      </div>
    </div>
  );
}

// ============================================================
// Empty / Lifecycle
// ============================================================
export function Empty({ icon = 'package', title, message }) {
  return (
    <div className="empty">
      <div className="icon-wrap"><Icon name={icon} /></div>
      <h4>{title}</h4>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

export function Lifecycle({ steps, current }) {
  const idx = steps.indexOf(current);
  return (
    <div className="hstack" style={{ gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i, arr) => {
        const reached = i < idx;
        const isCurrent = i === idx;
        const meta = PILLS[s] || { label: s };
        return (
          <React.Fragment key={s}>
            <div className="hstack" style={{ gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: isCurrent ? 'var(--brand-500)' : reached ? 'var(--green-500)' : 'var(--slate-150)',
                color: reached || isCurrent ? '#fff' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 700,
              }}>{i + 1}</div>
              <span style={{
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent ? 'var(--brand-500)' : reached ? 'var(--text)' : 'var(--text-muted)',
              }}>{meta.label}</span>
            </div>
            {i < arr.length - 1 ? (
              <div style={{
                width: 40, height: 2, margin: '0 6px',
                background: reached ? 'var(--green-500)' : 'var(--slate-150)',
              }} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
