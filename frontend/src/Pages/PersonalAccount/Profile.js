import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';
import SidebarNav from '../../Components/SidebarNav';
import SearchBar from '../../Components/SearchBar';
import UserPeronalDataCard from '../../Components/Cards/UserPersonalDataCard';
import TabSystem from '../../Components/TabSystem';
import ReviewList from '../../Components/Reviews/ReviewList';
import ShelvesManager from '../../Components/Shelves/ShelvesManager';
import ReviewModal from '../../Components/Reviews/ReviewModal';
import ReviewDetailModal from '../../Components/Reviews/ReviewDetailModal';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // Auth and Profile State
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followStatus, setFollowStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal and Refresh State
    const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // Relationship Modal State
    const [relationshipModal, setRelationshipModal] = useState({ open: false, mode: 'followers' });
    const [relationshipRows, setRelationshipRows] = useState([]);

    const isOwnProfile = !userId || userId === currentUser?.id;

    const fetchProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const targetId = userId || user?.id;
        if (!targetId) return;

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
        const previousStatus = followStatus;
        const isTargetPrivate = profile.is_private === true;
        const newStatus = isCurrentlyFollowing ? null : (isTargetPrivate ? 'pending' : 'accepted');

        setFollowStatus(newStatus);

        try {
            if (isCurrentlyFollowing) {
                const { error } = await supabase
                    .from('Followers')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('Followers')
                    .insert([{
                        follower_id: currentUser.id,
                        following_id: profile.id,
                        status: newStatus
                    }]);
                if (error) throw error;
            }
            await fetchProfileData();
        } catch (error) {
            console.error("Follow action failed:", error.message);
            setFollowStatus(previousStatus);
            alert(`Action failed: ${error.message}`);
        }
    };

    const handleSearch = (query, type) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    const openRelationshipList = async (mode) => {
        if (!profile?.id) return;
        setRelationshipModal({ open: true, mode });

        const column = mode === 'followers' ? 'following_id' : 'follower_id';
        const profileIdField = mode === 'followers' ? 'follower_id' : 'following_id';

        const { data: rows } = await supabase
            .from('Followers')
            .select('follower_id, following_id, status')
            .eq(column, profile.id)
            .eq('status', 'accepted');

        const ids = (rows || []).map((row) => row[profileIdField]);
        if (ids.length === 0) {
            setRelationshipRows([]);
            return;
        }

        const { data: profiles } = await supabase
            .from('Profiles')
            .select('id, username, avatar_url, bio')
            .in('id', ids);

        setRelationshipRows(profiles || []);
    };

    const canViewContent = isOwnProfile || !profile?.is_private || followStatus === 'accepted';

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            Syncing Profile...
        </div>
    );

    // --- UPDATED TAB SYSTEM LOGIC ---
    const profileTabs = [
        {
            label: 'Reviews',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {isOwnProfile && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            style={styles.createReviewBtn}
                        >
                            + Write a New Review
                        </button>
                    )}
                    
                    <ReviewList 
                        userId={profile?.id} 
                        refreshKey={reviewRefreshKey} 
                        onReviewClick={(rev) => setSelectedReview(rev)}
                    />
                </div>
            )
        },
        {
            label: 'Shelves',
            content: (
                <ShelvesManager
                    targetUserId={profile?.id}
                    isOwnProfile={isOwnProfile}
                    canViewContent={canViewContent}
                />
            )
        }
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
                        onFollowersClick={() => openRelationshipList('followers')}
                        onFollowingClick={() => openRelationshipList('following')}
                    />

                    <div style={{ marginTop: '30px' }}>
                        {canViewContent ? (
                            <TabSystem tabs={profileTabs} />
                        ) : (
                            <div style={styles.privateOverlay}>
                                <h3 style={{ color: '#333' }}>This Account is Private</h3>
                                <p style={{ color: '#666' }}>Follow this user to see their reviews and shelves.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- MODAL OVERLAYS --- */}
            {isCreateModalOpen && (
                <ReviewModal 
                    userId={currentUser?.id}
                    onClose={() => setIsCreateModalOpen(false)}
                    onReviewCreated={() => setReviewRefreshKey(prev => prev + 1)}
                />
            )}

            {selectedReview && (
                <ReviewDetailModal 
                    review={selectedReview}
                    currentUserId={currentUser?.id}
                    onClose={() => setSelectedReview(null)}
                    onDeleteSuccess={() => setReviewRefreshKey(prev => prev + 1)}
                />
            )}

            {relationshipModal.open && (
                <div style={styles.overlay} onClick={() => setRelationshipModal({ open: false, mode: 'followers' })}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>
                            {relationshipModal.mode === 'followers' ? 'Followers' : 'Following'}
                        </h3>

                        {relationshipRows.length === 0 ? (
                            <p style={{ color: '#777' }}>No users found.</p>
                        ) : (
                            relationshipRows.map((row) => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => {
                                        setRelationshipModal({ open: false, mode: 'followers' });
                                        navigate(`/profile/${row.id}`);
                                    }}
                                    style={styles.personRow}
                                >
                                    <img
                                        src={row.avatar_url || 'https://via.placeholder.com/44'}
                                        alt={row.username}
                                        style={styles.avatar}
                                    />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600 }}>{row.username}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{row.bio || 'No bio yet.'}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    createReviewBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: '2px dashed #ddd',
        background: '#fff',
        color: '#555',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center'
    },
    privateOverlay: {
        textAlign: 'center',
        padding: '80px 20px',
        border: '1px solid #eee',
        borderRadius: '12px',
        backgroundColor: '#fafafa'
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    modal: {
        width: '100%',
        maxWidth: '420px',
        maxHeight: '70vh',
        overflowY: 'auto',
        background: '#fff',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
    },
    personRow: {
        width: '100%',
        border: '1px solid #eee',
        background: '#fff',
        borderRadius: '8px',
        marginBottom: '8px',
        padding: '10px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' },
};

export default Profile;