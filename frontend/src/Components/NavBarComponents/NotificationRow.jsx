import React from 'react';
import { supabase } from '../../Services/supabaseClient';

const NotificationRow = ({ notification, refresh, onOpenProfile }) => {
    const { follower_id, status, username, isAlreadyFollowingBack } = notification;

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
            padding: '15px',
            borderBottom: '1px solid #eee'
        }}>
            <button
                type="button"
                onClick={() => onOpenProfile?.(follower_id)}
                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
                <strong>{username}</strong> {status === 'pending' ? 'requested to follow you' : 'followed you'}
            </button>

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
                    <button onClick={handleUnfollow} style={btnStyle.unfollow}>Unfollow</button>
                )}
                {isAlreadyFollowingBack && <span style={{ color: '#888', fontSize: '12px', fontWeight: '500' }}>Mutual</span>}
            </div>
        </div>
    );
};

const btnStyle = {
    accept: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' },
    decline: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px', padding: '0 10px' },
    followBack: { border: '1px solid #007bff', color: '#007bff', background: 'white', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' },
    unfollow: { border: '1px solid #d14343', color: '#d14343', background: 'white', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' },
};

export default NotificationRow;