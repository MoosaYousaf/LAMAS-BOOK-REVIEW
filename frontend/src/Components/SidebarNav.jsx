import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
// [PERF FIX #1] Import useUser hook to read user data from global context
// instead of making redundant auth + Profiles fetches on every mount.
import { useUser } from '../Context/UserContext';
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

  // [PERF FIX #1] Removed redundant auth fetch — user data now comes from
  // UserContext which fetches once at app level. See src/Context/UserContext.js.
  // Previously this component had its own useEffect that called:
  // - supabase.auth.getUser()
  // - supabase.from('Profiles').select(...)
  // Both calls are now eliminated, reducing network requests by 2 per page navigation.
  const { userProfile } = useUser();

  // [PERF FIX #1] Derive values from context instead of local state.
  const myId = userProfile?.id || null;
  const avatarUrl = userProfile?.avatar_url || null;
  const username = userProfile?.username || '';

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
