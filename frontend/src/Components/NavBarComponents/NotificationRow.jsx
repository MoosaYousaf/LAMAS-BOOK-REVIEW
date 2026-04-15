import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';

const NotificationRow = ({ notification, isPrivateAccount }) => {

    const [uiStatus, setUiStatus] = useState('pending'); // pending, accepted, following_back, declined
    const [isVisible, setIsVisible] = useState(true); // To hide the row if declined

    if (!isVisible) return null;

    const handleAccept = async () => {
        const { error } = await supabase
            .from('Followers')
            .update({ status: 'accepted' })
            .eq('id', notification.follow_row_id);
        
        if (!error) setUiStatus('accepted');
    };

    const handleDecline = async () => {
        const { error } = await supabase
            .from('Followers')
            .delete()
            .eq('id', notification.follow_row_id);
    };

    const handleFollowBack = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('Followers')
            .insert([{
                follower_id: user.id,
                following_id: notification.follower_id,
                status: 'accepted'
            }]);

        if (!error) setUiStatus('following_back');

    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '15px 20px', borderBottom: '1px solid #eee', width: '100%', boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#007bff', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                    {notification.username.charAt(0).toUpperCase()}
                </div>
                <span><strong>{notification.username}</strong> followed you</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Logic 1: Private Account + Pending = Accept/Decline */}
                {isPrivateAccount && uiStatus === 'pending' && (
                    <>
                        <button onClick={handleAccept} style={{ padding: '6px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
                            Accept
                        </button>
                        <button onClick={handleDecline} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}>
                            ✕
                        </button>
                    </>
                )}

                {/* Logic 2: Public Account OR Already Accepted = Follow Back */}
                {((!isPrivateAccount && uiStatus === 'pending') || (isPrivateAccount && uiStatus === 'accepted')) && (
                    <button onClick={handleFollowBack} style={{ padding: '6px 15px', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', cursor: 'pointer' }}>
                        Follow Back
                    </button>
                )}

                {/* Logic 3: Mutual connection complete */}
                {uiStatus === 'following_back' && (
                    <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>Mutual followers</span>
                )}
            </div>
        </div>
    );
};

export default NotificationRow;