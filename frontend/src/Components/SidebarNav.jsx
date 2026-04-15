import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import { IoPersonCircleOutline, IoNotificationsCircle } from 'react-icons/io5';

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

  // Keep this limited to non-auth flows (no signup/reset pages).
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Friends', path: '/friends' },
  ];

  const goToMyProfile = () => {
    if (myId) navigate(`/profile/${myId}`);
  }

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


      {/* Top Section: Main Menu */}
      <div>
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
      </div>

      {/* Personal Notification & Account Button */}
      <div style={{ 
        borderTop: '1px solid #eee', 
        paddingTop: '15px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '10px' 
      }}>

        {/* Notifications Button */}
        <button
          onClick={() => navigate('/notifications')}
          title="Notifications"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            justifyContent: 'center',
            transition: 'transform 0.1s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <IoNotificationsCircle 
            size={32} 
            color={location.pathname === '/notifications' ? '#007bff' : '#555'} 
          />
        </button>

        {/* Profile Button */}
        <button
          onClick={goToMyProfile}
          title="My Profile"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
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

