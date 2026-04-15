const UserCard = ({ user }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        width: '300px'
    }}>
        <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        }}>
            {user.username?.charAt(0).toUpperCase()}
        </div>
        <strong>{user.username || 'Unknown user'}</strong>
        {user?.full_name && (
            <div style={{fontsize: '12px', color:'#666'}}>
                {user.full_name}
            </div>
        )}
    </div>
);

export default UserCard;