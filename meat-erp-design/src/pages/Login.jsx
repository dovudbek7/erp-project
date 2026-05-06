import React from 'react';
import { Icon } from '../lib/Icon.jsx';
import { StatusPill } from '../lib/ui.jsx';
import { DATA } from '../lib/data.js';

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.hash = '#/dashboard';
  };

  return (
    <div className="login">
      <div className="login__hero">
        <div className="login__hero-brand">
          <div className="sidebar__logo"><Icon name="fire" /></div>
          <div>
            <strong>Andijan Meat Co</strong>
            <span>Meat ERP · v1.0</span>
          </div>
        </div>

        <div className="login__hero-content">
          <h1>From the cold storage<br />to the cash register.</h1>
          <p>
            Track every kilo of raw meat, every batch of mince, every kebab that
            leaves the door — with full lot traceability and rolled-up cost.
          </p>
          <div className="login__hero-stats">
            <div className="login__hero-stat"><strong>8</strong><span>Active lots</span></div>
            <div className="login__hero-stat"><strong>3</strong><span>Production orders</span></div>
            <div className="login__hero-stat"><strong>96%</strong><span>Avg yield</span></div>
          </div>
        </div>

        <div className="login__hero-foot">© 2026 Andijan Meat Processing LLC · Andijan, Uzbekistan</div>
      </div>

      <div className="login__form-side">
        <form className="login__form" onSubmit={handleSubmit}>
          <h2>Sign in to your tenant</h2>
          <p className="lead">Enter your credentials to continue.</p>

          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" type="email" defaultValue="prod@andijan-meat.uz" />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input className="input" type="password" defaultValue="••••••••" />
          </div>

          <label className="checkbox" style={{ marginTop: 14 }}>
            <input type="checkbox" /> Remember this device for 7 days
          </label>

          <button className="btn btn--primary btn--lg" type="submit">
            <Icon name="arrow_right" /> Sign in
          </button>

          <div className="demo-users">
            <strong>Demo accounts</strong>
            {DATA.users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span><code>{u.email}</code></span>
                <StatusPill status={u.role} />
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
