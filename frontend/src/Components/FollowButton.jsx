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
            await supabase.from('Followers').delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', targetUserId);
            setStatus(null);
        } else {
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
