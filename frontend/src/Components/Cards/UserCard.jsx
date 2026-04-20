const UserCard = ({ user }) => {
  if (!user) return null;
  const avatarSrc = user.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${user.username || 'User'}`;

  return (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        width: '300px'
    }}>
        <img 
            src={avatarSrc} 
            alt={user.username}
            style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover', // Ensures the image doesn't stretch
                backgroundColor: '#f0f0f0', // Slight background while loading
                border: '1px solid #eee'
            }}
            // Error handling: if the image fails to load, swap to initials
            onError={(e) => {
                e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`;
            }}
        />
        
        <strong>{user.username || 'Unknown user'}</strong>
        {user?.full_name && (
            <div style={{fontsize: '12px', color:'#666'}}>
                {user.full_name}
            </div>
        )}
    </div>
  );
};

export default UserCard;