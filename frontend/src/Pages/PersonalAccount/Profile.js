import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';
import SidebarNav from '../../Components/SidebarNav';
import SearchBar from '../../Components/SearchBar';
import UserPersonalDataCard from '../../Components/Cards/UserPersonalDataCard';
import TabSystem from '../../Components/TabSystem';
import ReviewList from '../../Components/Reviews/ReviewList';
import ShelvesManager from '../../Components/Shelves/ShelvesManager';
import ReviewModal from '../../Components/Reviews/ReviewModal';
import ReviewDetailModal from '../../Components/Reviews/ReviewDetailModal';
import '../../Styles/variables.css';
import '../../Styles/theme.css';
import '../../Styles/Pages/ProfilePage.css';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followStatus, setFollowStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const [relationshipModal, setRelationshipModal] = useState({ open: false, mode: 'followers' });
    const [relationshipRows, setRelationshipRows] = useState([]);

    const isOwnProfile = !userId || userId === currentUser?.id;

    const fetchProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const targetId = userId || user?.id;
        if (!targetId) return;

        const { data: profileData, error } = await supabase
            .from('Profiles').select('*').eq('id', targetId).single();
        if (error) { console.error('Error fetching profile:', error); return; }
        setProfile(profileData);

        if (user && targetId !== user.id) {
            const { data: followEntry } = await supabase
                .from('Followers').select('status')
                .eq('follower_id', user.id).eq('following_id', targetId).maybeSingle();
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
        const newStatus = isCurrentlyFollowing ? null : (profile.is_private ? 'pending' : 'accepted');
        setFollowStatus(newStatus);

        try {
            if (isCurrentlyFollowing) {
                const { error } = await supabase.from('Followers').delete()
                    .eq('follower_id', currentUser.id).eq('following_id', profile.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('Followers')
                    .insert([{ follower_id: currentUser.id, following_id: profile.id, status: newStatus }]);
                if (error) throw error;
            }
            await fetchProfileData();
        } catch (error) {
            console.error('Follow action failed:', error.message);
            setFollowStatus(previousStatus);
            alert(`Action failed: ${error.message}`);
        }
    };

    const openRelationshipList = async (mode) => {
        if (!profile?.id) return;
        setRelationshipModal({ open: true, mode });
        const column = mode === 'followers' ? 'following_id' : 'follower_id';
        const profileIdField = mode === 'followers' ? 'follower_id' : 'following_id';

        const { data: rows } = await supabase
            .from('Followers').select('follower_id, following_id, status')
            .eq(column, profile.id).eq('status', 'accepted');

        const ids = (rows || []).map(row => row[profileIdField]);
        if (!ids.length) { setRelationshipRows([]); return; }

        const { data: profiles } = await supabase
            .from('Profiles').select('id, username, avatar_url, bio').in('id', ids);
        setRelationshipRows(profiles || []);
    };

    const canViewContent = isOwnProfile || !profile?.is_private || followStatus === 'accepted';

    if (loading) return <div className="pg-loading">Syncing Profile...</div>;

    const profileTabs = [
        {
            label: 'Reviews',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isOwnProfile && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="profile-write-review-btn">
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
        <div className="pg-wrap">
            <div className="pg-bg" />
            <SidebarNav />

            <div className="pg-main">
                <header className="pg-header">
                    <SearchBar onSearch={(q, t) => navigate(`/search?q=${encodeURIComponent(q)}&type=${t}`)} />
                </header>

                <div className="profile-content">
                    <div className="glass profile-user-card">
                        <UserPersonalDataCard
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            followStatus={followStatus}
                            onFollowAction={handleFollowToggle}
                            onFollowersClick={() => openRelationshipList('followers')}
                            onFollowingClick={() => openRelationshipList('following')}
                        />
                    </div>

                    {canViewContent ? (
                        <TabSystem tabs={profileTabs} />
                    ) : (
                        <div className="glass profile-private">
                            <h3>This Account is Private</h3>
                            <p>Follow this user to see their reviews and shelves.</p>
                        </div>
                    )}
                </div>
            </div>

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
                <div className="modal-overlay" onClick={() => setRelationshipModal({ open: false, mode: 'followers' })}>
                    <div className="modal-glass profile-rel-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setRelationshipModal({ open: false, mode: 'followers' })}>✕</button>
                        <h3 className="profile-rel-title">
                            {relationshipModal.mode === 'followers' ? 'Followers' : 'Following'}
                        </h3>

                        {relationshipRows.length === 0 ? (
                            <div className="state-empty"><p>No users found.</p></div>
                        ) : (
                            relationshipRows.map(row => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => {
                                        setRelationshipModal({ open: false, mode: 'followers' });
                                        navigate(`/profile/${row.id}`);
                                    }}
                                    className="profile-rel-row"
                                >
                                    <img
                                        src={row.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${row.username}`}
                                        alt={row.username}
                                        className="profile-rel-avatar"
                                        onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${row.username}`; }}
                                    />
                                    <div>
                                        <p className="profile-rel-name">{row.username}</p>
                                        <p className="profile-rel-bio">{row.bio || 'No bio yet.'}</p>
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

export default Profile;
