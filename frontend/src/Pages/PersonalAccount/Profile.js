import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';
import SidebarNav from '../../Components/SidebarNav';
import SearchBar from '../../Components/SearchBar';
import UserPeronalDataCard from '../../Components/Cards/UserPersonalDataCard';
import TabSystem from '../../Components/TabSystem';
import ReviewList from '../../Components/ReviewList';
import ShelvesManager from '../../Components/Shelves/ShelvesManager';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followStatus, setFollowStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = !userId || userId === currentUser?.id;

    const fetchProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const targetId = userId || user?.id;
        if (!targetId) return;

        // Fetching profile with count columns from DB
        const { data: profileData, error: profileError } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', targetId)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
        }
        setProfile(profileData);

        // Fetch follow relationship status
        if (user && targetId !== user.id) {
            const { data: followEntry } = await supabase
                .from('Followers')
                .select('status')
                .eq('follower_id', user.id)
                .eq('following_id', targetId)
                .maybeSingle();
            setFollowStatus(followEntry?.status || null);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProfileData().finally(() => setLoading(false));
    }, [userId]);

    const handleFollowToggle = async () => {
        if (!currentUser || !profile) return;
        
        const isCurrentlyFollowing = followStatus !== null;
        const previousStatus = followStatus; // Store to revert if DB fails

        // 1. Logic: Determine new status
        const isTargetPrivate = profile.is_private === true;
        const newStatus = isCurrentlyFollowing ? null : (isTargetPrivate ? 'pending' : 'accepted');

        // 2. Optimistic UI: Update state immediately so the button changes instantly
        setFollowStatus(newStatus);

        try {
            if (isCurrentlyFollowing) {
                // UNFOLLOW
                const { error } = await supabase
                    .from('Followers')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id);
                if (error) throw error;
            } else {
                // FOLLOW
                const { error } = await supabase
                    .from('Followers')
                    .insert([{ 
                        follower_id: currentUser.id, 
                        following_id: profile.id, 
                        status: newStatus 
                    }]);
                if (error) throw error;
            }

            // 3. Refresh profile to get the updated counts from the SQL trigger
            await fetchProfileData();

        } catch (error) {
            console.error("Follow action failed:", error.message);
            // Revert UI if the database action failed
            setFollowStatus(previousStatus);
            alert(`Action failed: ${error.message}`);
        }
    };

    const handleSearch = (query, type) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    // Privacy Check Logic
    const canViewContent = isOwnProfile || !profile?.is_private || followStatus === 'accepted';
    
    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            Syncing Profile...
        </div>
    );

    const profileTabs = [
        { label: 'Reviews', content: <ReviewList userId={profile?.id} /> },
        { label: 'Shelves', content: ( <ShelvesManager targetUserId={profile?.id} isOwnProfile={isOwnProfile} /> ) }
    ];

    return (
        <div style={{ display: 'flex' }}>
            <SidebarNav />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '20px' }}>
                    <SearchBar onSearch={handleSearch} />
                </header>

                <main style={{ padding: '30px', maxWidth: '1000px', alignSelf: 'center', width: '100%' }}>
                    <UserPeronalDataCard
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        followStatus={followStatus}
                        onFollowAction={handleFollowToggle}
                    />

                    <div style={{ marginTop: '30px' }}>
                        {canViewContent ? (
                            <TabSystem tabs={profileTabs} />
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '80px 20px', 
                                border: '1px solid #eee', 
                                borderRadius: '12px',
                                backgroundColor: '#fafafa' 
                            }}>
                                <h3 style={{ color: '#333' }}>This Account is Private</h3>
                                <p style={{ color: '#666' }}>Follow this user to see their reviews and shelves.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;