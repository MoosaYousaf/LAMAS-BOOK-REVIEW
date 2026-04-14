import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Keep this limited to non-auth flows (no signup/reset pages).
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Friends', path: '/friends' },
  ];

  return (
    <aside
      style={{
        width: '200px',
        minHeight: '100vh',
        borderRight: '1px solid #ccc',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '12px' }}>MENU</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path, { state: location.state })}
              style={{
                padding: '8px 10px',
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default SidebarNav;

