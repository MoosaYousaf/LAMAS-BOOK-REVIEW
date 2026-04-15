import React from 'react';

const UserPersonalDataCard = ({ profile, isOwnProfile, followStatus, onFollowAction }) => {

    const getButtonContent = () => {
        if (followStatus === 'accepted') return { text: 'Unfollow', color: '#e0e0e0', textColor: '#333' };
        if (followStatus === 'pending') return { text: 'Requested', color: '#f0f0f0', textColor: '#666' };
        return { text: 'Follow', color: '#007bff', textColor: '#fff' };
    }

    const buttonStyles = getButtonContent();

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            paddingBottom: '25px',
            borderBottom: '1px solid #eee'
        }}>
            {/* Profile Picture*/ }
            <img
                src={profile?.avatar_url || 'https://via.placeholder.com/120'}
                alt="Profile"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
            />

            <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 5px 0' }}>{profile?.username}</h2>
                <p style={{ color: '#666', margin: '0 0 15px 0' }}>{profile?.bio}</p>
                
                <div style={{ display: 'flex', gap: '25px' }}>
                    <span><strong>{profile?.follower_count || 0}</strong> Followers</span>
                    <span><strong>{profile?.following_count || 0}</strong> Following</span>
                </div>
            </div>

            {/* Show follow button ONLY if it's not your own profile */}
            {!isOwnProfile && (
                <button 
                    onClick={onFollowAction}
                    style={{
                        padding: '10px 25px',
                        borderRadius: '20px',
                        border: '1px solid #ddd',
                        backgroundColor: buttonStyles.color,
                        color: buttonStyles.textColor,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: '110px'
                    }}
                >
                    {buttonStyles.text}
                </button>
            )}
        </div>
    );
};

export default UserPersonalDataCard;