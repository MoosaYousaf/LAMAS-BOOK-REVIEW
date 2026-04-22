// UserPersonalDataCard — the profile header card showing avatar, username, bio,
// and follower/following counts. Shown at the top of any user's profile page.
//
// Props:
//   profile        — the user's Profiles row from Supabase
//   isOwnProfile   — hides the follow button when viewing your own page
//   followStatus   — 'accepted' | 'pending' | null, controls the follow button label
//   onFollowAction — called when the follow/unfollow button is clicked
//   onFollowersClick / onFollowingClick — open the followers/following modal

import '../../Styles/variables.css';
import '../../Styles/Pages/ProfilePage.css';

const UserPersonalDataCard = ({ profile, isOwnProfile, followStatus, onFollowAction, onFollowersClick, onFollowingClick }) => {

    // Derives the button label and style class from the current follow relationship.
    // 'pending' means a follow request was sent but not yet accepted (private account).
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
