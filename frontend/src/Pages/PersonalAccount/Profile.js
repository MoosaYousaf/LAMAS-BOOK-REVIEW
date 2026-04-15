import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';
import SidebarNav from '../../Components/SidebarNav';
import SearchBar from '../../Components/SearchBar';
import UserPeronalDataCard from '../../Components/Cards/UserPersonalDataCard';
import TabSystem from '../../Components/TabSystem';
import ReviewList from '../../Components/ReviewList';
//import Shelves from '../../Components/Shelves';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [ profile, setProfile ] = useState(null);
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ followStatus, setFollowStatus ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    const isOwnProfile = !userId || userId === currentUser?.id;
    
    useEffect(() => {
        const initializeProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const targetId = userId || user?.id;
        if (!targetId) {
            navigate('/'); // Redirect if no session and no target user
            return;
        }

        // 1. Fetch Profile Data
        const { data: profileData } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', targetId)
            .single();
        
        setProfile(profileData);

        // 2. Fetch Follow Status (only if viewing another user)
        if (user && targetId !== user.id) {
            const { data: followEntry } = await supabase
            .from('Followers')
            .select('status')
            .eq('follower_id', user.id)
            .eq('following_id', targetId)
            .single();
            setFollowStatus(followEntry?.status || null);
        }

        setLoading(false);
        };

        initializeProfile();
    }, [userId, navigate]);

    const handleSearch = (query, type) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    // Privacy Check Logic
    const canViewContent = isOwnProfile || !profile?.is_private || followStatus === 'accepted';
    
    if (loading) return <div style={{ padding: '20px'}}>Syncing Profile....</div>;

    const profileTabs = [
        { label: 'Reviews', content: <ReviewList userId={profile?.id} /> },
        { label: 'Shelves', content: <div>Shelves Component Placeholder </div> }
    ];

    return (
        <div style={{display: 'flex'}}>
            {/* Fixed: Sidebar Navigation */ }
            <SidebarNav />

            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <header style={{ padding: '20px'}}>
                    <SearchBar onSearch={handleSearch} />
                </header>

                <main style={{ padding: '30px', maxWidth: '1000px', alignSelf: 'center', width: '100%' }}>
                    {/* User Personal Data Section */}
                    <UserPeronalDataCard
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        followStatus={followStatus}
                    />

                    {/* Content Section With Tabs */}
                    <div style={{ marginTop: '30px' }}>
                        { canViewContent ? (
                            <TabSystem tabs={profileTabs} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <h3>This Account is Private </h3>
                                <p> Follow this user to see their reviews and shelves.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;