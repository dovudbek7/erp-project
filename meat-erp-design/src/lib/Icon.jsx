import React from 'react';

// Lucide-style stroke icons. Each value is the inner <path> markup.
const ICONS = {
  dashboard: <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 9h8V3h-8z" />,
  package: <>
    <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
  </>,
  truck: <>
    <path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0z" />
    <path d="M2 17V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v10M14 9h4l3 4v4M5 18h-2a1 1 0 0 1-1-1v-1M9 18h6" />
  </>,
  factory: <path d="M2 20h20M3 20V8l5 3V8l5 3V8l5 3v9M9 20v-4h2v4M14 20v-4h2v4" />,
  cart: <>
    <path d="M2 4h2l3 12h12l3-8H6" />
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
  </>,
  chart: <>
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 4 4 5-5" />
  </>,
  settings: <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
  users: <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  alert: <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
  clock: <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
  search: <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  chevron_left: <path d="M15 18 9 12l6-6" />,
  chevron_right: <path d="M9 18l6-6-6-6" />,
  chevron_down: <path d="m6 9 6 6 6-6" />,
  arrow_right: <path d="M5 12h14M12 5l7 7-7 7" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />,
  edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />,
  trash: <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  more_h: <>
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </>,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  warehouse: <>
    <path d="M22 8.35V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.35a2 2 0 0 1 1.26-1.86l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z" />
    <path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7" />
  </>,
  recipe: <path d="M4 4v16M4 4h13a3 3 0 0 1 3 3v13M4 12h12M8 8h6M8 16h6" />,
  trace: <>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M9 6h6M6 9v9a3 3 0 0 0 3 3h6" />
  </>,
  fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17h2a2.5 2.5 0 0 0 0-5c-1 0-2-.5-2-2 0-3 3-3 3-6 0-1.5-.5-3-2-3-2 0-2 2-2 4 0 2-2 3-2 5 0 1.4 0 2.5.5 4.5z" />,
  invoice: <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 14h6M9 18h4M9 10h1" />
  </>,
  dollar: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />,
  trending_up: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  trending_down: <path d="M3 7l6 6 4-4 8 8M14 17h7v-7" />,
  printer: <>
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v8H6z" />
  </>,
  refresh: <path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7l3-2.7M21 21v-5h-5" />,
  play: <polygon points="5,3 19,12 5,21" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="1" />,
  zap: <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />,
  calendar: <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
  eye: <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  history: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2" />,
};

export function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] || ICONS.package}
    </svg>
  );
}
