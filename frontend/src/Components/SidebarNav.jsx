import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import {
  MdDashboard,
  MdPeople,
  MdSettings,
  MdNotifications,
  MdLogout,
  MdPerson
} from 'react-icons/md';
import '../Styles/variables.css';
import '../Styles/Components/SidebarNav.css';

function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [myId, setMyId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMyId(user.id);
        const { data: profile } = await supabase
          .from('Profiles')
          .select('avatar_url, username')
          .eq('id', user.id)
          .single();
        if (profile) {
          setAvatarUrl(profile.avatar_url);
          setUsername(profile.username);
        }
      }
    };
    getSession();
  }, []);

  const navItems = [
    { label: 'Dashboard',     path: '/dashboard',    icon: <MdDashboard /> },
    { label: 'Community',     path: '/friends',       icon: <MdPeople /> },
    { label: 'Settings',      path: '/settings',      icon: <MdSettings /> },
    { label: 'Alerts',        path: '/notifications', icon: <MdNotifications /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>L<br/>B<br/>R</div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__bottom">
        <button
          onClick={() => myId && navigate(`/profile/${myId}`)}
          className="sidebar__profile-btn"
          title="My Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="sidebar__avatar" />
          ) : (
            <span className="sidebar__nav-icon"><MdPerson /></span>
          )}
          <span className="sidebar__nav-label">Profile</span>
        </button>

        <button onClick={handleLogout} className="sidebar__logout-btn" title="Logout">
          <span className="sidebar__nav-icon"><MdLogout /></span>
          <span className="sidebar__nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;
