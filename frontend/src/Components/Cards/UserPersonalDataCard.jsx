import '../../Styles/variables.css';
import '../../Styles/Pages/ProfilePage.css';

const UserPersonalDataCard = ({ profile, isOwnProfile, followStatus, onFollowAction, onFollowersClick, onFollowingClick }) => {

    const getFollowBtn = () => {
        if (followStatus === 'accepted') return { text: 'Unfollow', cls: 'updc__follow-btn--following' };
        if (followStatus === 'pending') return { text: 'Requested', cls: 'updc__follow-btn--pending' };
        return { text: 'Follow', cls: 'updc__follow-btn--follow' };
    };

    const { text, cls } = getFollowBtn();
    const avatarSrc = profile?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${profile?.username || 'user'}`;

    return (
        <div className="updc">
            <img
                src={avatarSrc}
                alt="Profile"
                className="updc__avatar"
                onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${profile?.username}`; }}
            />

            <div className="updc__info">
                <h2 className="updc__username">{profile?.username}</h2>
                {profile?.bio && <p className="updc__bio">{profile.bio}</p>}

                <div className="updc__counts">
                    <button type="button" onClick={onFollowersClick} className="updc__count-btn">
                        <strong>{profile?.follower_count || 0}</strong> Followers
                    </button>
                    <button type="button" onClick={onFollowingClick} className="updc__count-btn">
                        <strong>{profile?.following_count || 0}</strong> Following
                    </button>
                </div>
            </div>

            {!isOwnProfile && (
                <button
                    onClick={onFollowAction}
                    className={`updc__follow-btn ${cls}`}
                    disabled={followStatus === 'pending'}
                >
                    {text}
                </button>
            )}
        </div>
    );
};

export default UserPersonalDataCard;
