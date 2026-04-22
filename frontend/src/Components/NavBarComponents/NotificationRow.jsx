// NotificationRow — a single row in the Notifications page for a follow event.
// Each row represents one person who followed (or requested to follow) the current user.
// The actions available depend on the relationship state:
//
//   status = 'pending':
//     The follower wants to follow a private account.
//     Buttons: Accept (sets status → 'accepted') | Decline (deletes the row).
//
//   status = 'accepted', isAlreadyFollowingBack = false:
//     The current user is not yet following back.
//     Button: Follow Back (inserts a new Followers row, respecting the follower's own privacy).
//
//   status = 'accepted', isAlreadyFollowingBack = true:
//     Mutual follow. Shows a "Mutual" badge and an Unfollow option.
//
// `refresh` is called after every action to re-fetch the notification list.
// `onOpenProfile` navigates to the follower's profile page when their avatar/name is clicked.

import { supabase } from '../../Services/supabaseClient';
import '../../Styles/variables.css';
import '../../Styles/Components/ShelvesManager.css';
import '../../Styles/theme.css';

const NotificationRow = ({ notification, refresh, onOpenProfile }) => {
    const { follower_id, status, username, avatar_url, isAlreadyFollowingBack } = notification;

    const handleAccept = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('Followers').update({ status: 'accepted' })
            .eq('follower_id', follower_id).eq('following_id', user.id);
        refresh();
    };

    const handleDecline = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('Followers').delete()
            .eq('follower_id', follower_id).eq('following_id', user.id);
        refresh();
    };

    const handleFollowBack = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('Profiles').select('is_private').eq('id', follower_id).single();
        const newStatus = profile?.is_private ? 'pending' : 'accepted';
        await supabase.from('Followers').insert([{ follower_id: user.id, following_id: follower_id, status: newStatus }]);
        refresh();
    };

    const handleUnfollow = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('Followers').delete()
            .eq('follower_id', user.id).eq('following_id', follower_id);
        refresh();
    };

    return (
        <div className="nr">
            <div className="nr__left" onClick={() => onOpenProfile?.(follower_id)}>
                <img
                    src={avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${username}`}
                    alt="pfp"
                    className="nr__avatar"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`; }}
                />
                <div className="nr__text">
                    <strong>{username}</strong>
                    {status === 'pending' ? ' requested to follow you' : ' followed you'}
                </div>
            </div>

            <div className="nr__actions">
                {status === 'pending' && (
                    <>
                        <button onClick={handleAccept} className="btn btn-success" style={{ padding: '7px 16px', fontSize: '12px' }}>Accept</button>
                        <button onClick={handleDecline} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: '16px' }}>✕</button>
                    </>
                )}
                {status === 'accepted' && !isAlreadyFollowingBack && (
                    <button onClick={handleFollowBack} className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: '12px' }}>Follow Back</button>
                )}
                {status === 'accepted' && isAlreadyFollowingBack && (
                    <>
                        <span className="nr__mutual">Mutual</span>
                        <button onClick={handleUnfollow} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '11px' }}>Unfollow</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationRow;
