import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import { IoPersonCircleOutline } from 'react-icons/io5';

function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ myId, setMyId ] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMyId(user.id);
    };
    getSession();
  }, []);

  // "Shelves" removed from here
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
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
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  padding: '8px 10px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 400,
                  textAlign: 'left'
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
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button
          onClick={goToMyProfile}
          title="My Profile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', transition: 'transform 0.2s' }}
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

export default SidebarNav;