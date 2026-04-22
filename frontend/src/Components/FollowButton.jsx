// FollowButton — a standalone follow/unfollow button used in search results and profile cards.
// Handles three follow relationship states:
//
//   null     — not following; shows a "Follow" button
//   pending  — follow request sent to a private account, waiting for approval; button disabled
//   accepted — actively following; shows a checkmark that turns into "Unfollow" on hover
//
// When following a private account, the insert uses status = 'pending' instead of
// 'accepted' so the target user can review the request in their Notifications page.
//
// Note: this component uses legacy inline styles. The fully styled equivalent
// used on profile pages is UserPersonalDataCard's built-in follow button.

import React, { useState, useEffect } from 'react';
import { supabase } from '../Services/supabaseClient';

const FollowButton = ({ targetUserId, isTargetPrivate, currentUser }) => {
    const [status, setStatus] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (currentUser && targetUserId) fetchFollowStatus();
    }, [targetUserId, currentUser]);

    const fetchFollowStatus = async () => {
        const { data } = await supabase
            .from('Followers')
            .select('status')
            .eq('follower_id', currentUser.id)
            .eq('following_id', targetUserId)
            .maybeSingle();
        
        setStatus(data?.status || null);
    };

    const handleAction = async () => {
        if (!currentUser) return;

        if (status) {
            // Any existing follow row (pending or accepted) is removed on click
            await supabase.from('Followers').delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', targetUserId);
            setStatus(null);
        } else {
            // Private accounts require approval — insert as 'pending'; public accounts are 'accepted' immediately
            const newStatus = isTargetPrivate ? 'pending' : 'accepted';
            await supabase.from('Followers').insert([{
                follower_id: currentUser.id,
                following_id: targetUserId,
                status: newStatus
            }]);
            setStatus(newStatus);
        }
    };

    if (status === 'pending') {
        return <button style={styles.requested} disabled>Requested</button>
    }

    if (status === 'accepted') {
        return (
            <button
                onClick={handleAction}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={isHovered ? styles.unfollow : styles.following}
            >
                {isHovered ? "Unfollow" : "✓"}
            </button>
        );
    }

    return <button onClick={handleAction} style={styles.follow}>Follow</button>;
};

const styles = {
    follow: { padding: '10px 25px', borderRadius: '20px', backgroundColor: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    requested: { padding: '10px 25px', borderRadius: '20px', backgroundColor: '#f0f0f0', color: '#666', border: '1px solid #ddd' },
    following: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', border: 'none', cursor: 'pointer' },
    unfollow: { padding: '10px 20px', borderRadius: '20px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', cursor: 'pointer' }
};

export default FollowButton;
