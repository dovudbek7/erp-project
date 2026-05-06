import { useEffect, useState } from 'react';

import Login            from './pages/Login.jsx';
import Dashboard        from './pages/Dashboard.jsx';
import Inventory        from './pages/Inventory.jsx';
import LotDetail        from './pages/LotDetail.jsx';
import Expiring         from './pages/Expiring.jsx';
import Purchase         from './pages/Purchase.jsx';
import PurchaseDetail   from './pages/PurchaseDetail.jsx';
import Production       from './pages/Production.jsx';
import ProductionDetail from './pages/ProductionDetail.jsx';
import Sales            from './pages/Sales.jsx';
import SalesDetail      from './pages/SalesDetail.jsx';
import Reports          from './pages/Reports.jsx';
import Traceability     from './pages/Traceability.jsx';
import { Warehouses, Products, Recipes, Customers, Invoices, NotFound } from './pages/Stubs.jsx';

// Hash-based router. Each entry: regex → component (receives match groups in `params`).
const ROUTES = [
  { pattern: /^#\/?$/,                          C: Dashboard },
  { pattern: /^#\/login$/,                      C: Login },
  { pattern: /^#\/dashboard$/,                  C: Dashboard },

  { pattern: /^#\/inventory$/,                  C: Inventory },
  { pattern: /^#\/inventory\/([\w-]+)/,         C: LotDetail },
  { pattern: /^#\/expiring$/,                   C: Expiring },

  { pattern: /^#\/warehouses$/,                 C: Warehouses },
  { pattern: /^#\/products$/,                   C: Products },

  { pattern: /^#\/purchase$/,                   C: Purchase },
  { pattern: /^#\/purchase\/([\w-]+)$/,         C: PurchaseDetail },

  { pattern: /^#\/production$/,                 C: Production },
  { pattern: /^#\/production\/([\w-]+)$/,       C: ProductionDetail },
  { pattern: /^#\/recipes$/,                    C: Recipes },

  { pattern: /^#\/sales$/,                      C: Sales },
  { pattern: /^#\/sales\/([\w-]+)$/,            C: SalesDetail },
  { pattern: /^#\/customers$/,                  C: Customers },
  { pattern: /^#\/invoices$/,                   C: Invoices },

  { pattern: /^#\/reports$/,                    C: Reports },
  { pattern: /^#\/traceability$/,               C: Traceability },
];

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/dashboard');
  useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/dashboard';
    const onChange = () => {
      setHash(window.location.hash || '#/dashboard');
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();

  for (const r of ROUTES) {
    const m = hash.match(r.pattern);
    if (m) {
      const Page = r.C;
      return <Page params={m.slice(1)} route={hash} />;
    }
  }

  return <NotFound route={hash} />;
}
