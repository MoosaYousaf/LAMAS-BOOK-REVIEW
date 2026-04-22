// UserCard — displays a user's avatar, username, and optional full name.
// Used in the Friends/community search results list.
// If the user has no uploaded avatar, falls back to a DiceBear initials avatar
// generated from their username so there's always something to show.

import '../../Styles/variables.css';
import '../../Styles/Components/ShelvesManager.css';

const UserCard = ({ user }) => {
    if (!user) return null;
    // Generate a deterministic placeholder avatar from the username when no photo exists
    const avatarSrc = user.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${user.username || 'User'}`;

    return (
        <div className="user-card">
            <img
                src={avatarSrc}
                alt={user.username}
                className="user-card__avatar"
                onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`; }}
            />
            <div>
                <div className="user-card__name">{user.username || 'Unknown user'}</div>
                {user?.full_name && (
                    <div className="user-card__full-name">{user.full_name}</div>
                )}
            </div>
        </div>
    );
};

export default UserCard;
