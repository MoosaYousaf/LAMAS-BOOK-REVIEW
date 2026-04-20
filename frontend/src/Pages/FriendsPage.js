import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import SidebarNav from '../Components/SidebarNav';
import SearchBar from '../Components/SearchBar';
import UserReviewCard from '../Components/Cards/UserReviewCard';

const FriendsPage = () => {
    const navigate = useNavigate();
    
    // Data State
    const [friends, setFriends] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [friendPage, setFriendPage] = useState(1);
    const FRIENDS_PER_PAGE = 8;

    // Search Modal State
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * FETCH REVIEWS
     * Fetches top 10 reviews for either all mutual friends or one specific friend
     */
    const fetchFriendsReviews = useCallback(async (ids, filterId = null) => {
        const targetIds = filterId ? [filterId] : ids;
        
        if (!targetIds || targetIds.length === 0) {
            setReviews([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('Reviews')
            .select('*, Books(*)')
            .in('user_id', targetIds)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) console.error("Error fetching reviews:", error);
        setReviews(data || []);
        setLoading(false);
    }, []);

    /**
     * INITIAL DATA LOAD
     * 1. Finds Mutual Friends (Intersection of Follower/Following tables)
     * 2. Fetches their Profiles
     * 3. Fetches initial batch of 10 recent reviews
     */
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Get people YOU follow and people following YOU in parallel
            const [followingRes, followersRes] = await Promise.all([
                supabase.from('Followers').select('following_id').eq('follower_id', user.id).eq('status', 'accepted'),
                supabase.from('Followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted')
            ]);

            const followingIds = new Set(followingRes.data?.map(f => f.following_id));
            const mutualIds = followersRes.data
                ?.filter(f => followingIds.has(f.follower_id))
                .map(f => f.follower_id) || [];

            if (mutualIds.length > 0) {
                const { data: profiles, error: pError } = await supabase
                    .from('Profiles')
                    .select('id, username, avatar_url')
                    .in('id', mutualIds);

                if (pError) throw pError;

                setFriends(profiles || []);
                // Load global feed of these friends
                await fetchFriendsReviews(mutualIds);
            } else {
                setFriends([]);
                setReviews([]);
                setLoading(false);
            }
        } catch (err) {
            console.error("Mutual Friend Fetch Error:", err);
            setLoading(false);
        }
    }, [fetchFriendsReviews]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    /**
     * SELECTION LOGIC
     * Toggles between a single friend's feed and the all-friends feed
     */
    const handleSelectFriend = (id) => {
        if (selectedFriendId === id) {
            setSelectedFriendId(null);
            fetchFriendsReviews(friends.map(f => f.id));
        } else {
            setSelectedFriendId(id);
            fetchFriendsReviews([], id);
        }
    };

    // UI Sorting: Keep selected friend at the very top of the list
    const sortedFriends = [...friends].sort((a, b) => {
        if (a.id === selectedFriendId) return -1;
        if (b.id === selectedFriendId) return 1;
        return 0;
    });

    const paginatedFriends = sortedFriends.slice(
        (friendPage - 1) * FRIENDS_PER_PAGE,
        friendPage * FRIENDS_PER_PAGE
    );

    return (
        <div style={styles.pageWrapper}>
            <SidebarNav />
            
            <div style={styles.mainContent}>
                {/* TOP BAR */}
                <header style={styles.topHeader}>
                    <SearchBar onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
                </header>

                <div style={styles.contentLayout}>
                    
                    {/* LEFT BOX: REVIEWS (WIDER) */}
                    <div style={styles.leftBox}>
                        <h3 style={styles.boxTitle}>
                            {selectedFriendId ? "Recent Friend Reviews" : "Recent Reviews from All Friends"}
                        </h3>
                        
                        {loading ? (
                            <p style={styles.emptyMsg}>Syncing reviews...</p>
                        ) : reviews.length > 0 ? (
                            reviews.map(r => {
                                // Find friend data to pass to the card for the top-right badge
                                const owner = friends.find(f => f.id === r.user_id);
                                return (
                                    <UserReviewCard 
                                        key={r.id} 
                                        review={r} 
                                        friendMode={true} 
                                        friendData={owner}
                                        onClick={() => navigate(`/book/${r.book_id}`)} 
                                    />
                                );
                            })
                        ) : friends.length === 0 ? (
                            <p style={styles.emptyMsg}>Add friends to see their reviews</p>
                        ) : (
                            <p style={styles.emptyMsg}>No reviews available at this time</p>
                        )}
                    </div>

                    {/* RIGHT BOX: FRIENDS LIST (THINNER) */}
                    <div style={styles.rightBox}>
                        <div style={styles.friendHeader}>
                            <span>Friends</span>
                            <button onClick={() => setShowSearchModal(true)} style={styles.searchBtn}>Search Friend</button>
                        </div>
                        
                        {friends.length === 0 ? (
                            <p style={styles.emptyMsg}>Add friends to see them here!</p>
                        ) : (
                            <div style={styles.listContainer}>
                                {paginatedFriends.map(f => (
                                    <div 
                                        key={f.id} 
                                        onClick={() => handleSelectFriend(f.id)}
                                        style={{
                                            ...styles.friendItem, 
                                            backgroundColor: selectedFriendId === f.id ? '#f0f7ff' : 'transparent',
                                            border: selectedFriendId === f.id ? '1px solid #007bff' : '1px solid transparent'
                                        }}
                                    >
                                        <img 
                                            src={f.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${f.username}`} 
                                            style={styles.miniAvatar} 
                                            alt="pfp" 
                                        />
                                        <span 
                                            style={styles.friendUsername} 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                navigate(`/profile/${f.id}`); 
                                            }}
                                        >
                                            {f.username}
                                        </span>
                                    </div>
                                ))}

                                {friends.length > FRIENDS_PER_PAGE && (
                                    <button 
                                        onClick={() => setFriendPage(prev => (prev * FRIENDS_PER_PAGE < friends.length ? prev + 1 : 1))} 
                                        style={styles.pageBtn}
                                    >
                                        Next Page
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SEARCH MODAL */}
            {showSearchModal && (
                <div style={styles.modalOverlay} onClick={() => setShowSearchModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h4 style={{marginTop: 0}}>Search Friends</h4>
                        <input 
                            autoFocus
                            placeholder="Type username..." 
                            style={styles.modalInput}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div style={styles.modalResults}>
                            {friends
                                .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(f => (
                                    <div 
                                        key={f.id} 
                                        style={styles.resultItem} 
                                        onClick={() => { 
                                            handleSelectFriend(f.id); 
                                            setShowSearchModal(false); 
                                        }}
                                    >
                                        {f.username}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    pageWrapper: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
    topHeader: { padding: '20px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #eee', backgroundColor: '#fff' },
    contentLayout: { display: 'flex', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
    leftBox: { flex: 2.5, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #ddd', minHeight: '600px' },
    rightBox: { flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', height: 'fit-content', position: 'sticky', top: '20px' },
    boxTitle: { marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' },
    friendHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold' },
    searchBtn: { fontSize: '11px', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
    friendItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer', borderRadius: '8px', transition: '0.2s' },
    miniAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' },
    friendUsername: { fontSize: '14px', fontWeight: '500', color: '#007bff' },
    emptyMsg: { textAlign: 'center', color: '#888', marginTop: '40px' },
    pageBtn: { width: '100%', marginTop: '10px', padding: '10px', cursor: 'pointer', border: 'none', background: '#f0f0f0', borderRadius: '5px', fontWeight: 'bold', color: '#666' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', width: '320px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    modalInput: { width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' },
    modalResults: { maxHeight: '200px', overflowY: 'auto' },
    resultItem: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px' }
};

export default FriendsPage;