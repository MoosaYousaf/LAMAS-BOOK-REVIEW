import React from 'react';
import { supabase } from '../../Services/supabaseClient';

const NotificationRow = ({ notification, refresh, onOpenProfile }) => {
    // Destructure avatar_url which we added to the fetch in the previous step
    const { follower_id, status, username, avatar_url, isAlreadyFollowingBack } = notification;

    const handleAccept = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('Followers')
            .update({ status: 'accepted' })
            .eq('follower_id', follower_id)
            .eq('following_id', user.id);

        refresh();
    };

    const handleDecline = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('Followers')
            .delete()
            .eq('follower_id', follower_id)
            .eq('following_id', user.id);

        refresh();
    };

    const handleFollowBack = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('Profiles')
            .select('is_private')
            .eq('id', follower_id)
            .single();

        const newStatus = profile?.is_private ? 'pending' : 'accepted';

        await supabase.from('Followers').insert([{
            follower_id: user.id,
            following_id: follower_id,
            status: newStatus
        }]);

        refresh();
    };

    const handleUnfollow = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('Followers')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', follower_id);

        refresh();
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 15px',
            borderBottom: '1px solid #eee'
        }}>
            <div 
                onClick={() => onOpenProfile?.(follower_id)}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: 'pointer',
                    flex: 1 
                }}
            >
                <img 
                    src={avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${username}`} 
                    alt="pfp"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #f0f0f0'
                    }}
                    onError={(e) => {
                        e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
                    }}
                />
                <div style={{ fontSize: '14px', color: '#333' }}>
                    <strong style={{ color: '#000' }}>{username}</strong> 
                    {status === 'pending' ? ' requested to follow you' : ' followed you'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {status === 'pending' && (
                    <>
                        <button onClick={handleAccept} style={btnStyle.accept}>Accept</button>
                        <button onClick={handleDecline} style={btnStyle.decline}>✕</button>
                    </>
                )}
                {status === 'accepted' && !isAlreadyFollowingBack && (
                    <button onClick={handleFollowBack} style={btnStyle.followBack}>Follow Back</button>
                )}
                {status === 'accepted' && isAlreadyFollowingBack && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#888', fontSize: '12px', fontWeight: '500' }}>Mutual</span>
                        <button onClick={handleUnfollow} style={btnStyle.unfollow}>Unfollow</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const btnStyle = {
    accept: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    decline: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px', padding: '0 10px' },
    followBack: { border: '1px solid #007bff', color: '#007bff', background: 'white', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
    unfollow: { border: '1px solid #eee', color: '#666', background: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};

export default NotificationRow;