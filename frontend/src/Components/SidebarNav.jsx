import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import { IoPersonCircleOutline } from 'react-icons/io5';

function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ myId, setMyId ] = useState(null);

  useEffect(() => {
    const getSession =async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMyId(user.id);
    };
    getSession();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', state: { openShelves: false } },
    { label: 'Shelves', path: '/dashboard', state: { openShelves: true } },
    { label: 'Friends', path: '/friends' },
    { label: 'Settings', path: '/settings' },
    { label: 'Notifications', path: '/notifications'},
  ];

  const goToMyProfile = () => {
    if (myId) navigate(`/profile/${myId}`);
  };

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
      <div>
        <div style={{ fontWeight: 700, marginBottom: '12px' }}>MENU</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isShelvesActive = item.label === 'Shelves' && location.pathname === '/dashboard' && location.state?.openShelves;
            const isActive = isShelvesActive || (location.pathname === item.path && item.label !== 'Shelves');

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path, { state: item.state ?? location.state })}
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
      </div>

      <div style={{
        borderTop: '1px solid #eee',
        paddingTop: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button
          onClick={goToMyProfile}
          title="My Profile"
          style={{ ...iconBtnStyle, width: '100%', padding: '10px' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <IoPersonCircleOutline
            size={40}
            color={location.pathname.includes(myId) && myId !== null ? '#007bff' : '#555'}
          />
        </button>
      </div>
    </aside>
  );
}

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  justifyContent: 'center',
  transition: 'transform 0.1s'
};

export default SidebarNav;

