import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import SidebarNav from '../Components/SidebarNav';
import SearchBar from '../Components/SearchBar';
import UserReviewCard from '../Components/Cards/UserReviewCard';
import '../Styles/variables.css';
import '../Styles/theme.css';
import '../Styles/Pages/FriendsPage.css';

const FriendsPage = () => {
    const navigate = useNavigate();

    const [friends, setFriends] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [friendPage, setFriendPage] = useState(1);
    const FRIENDS_PER_PAGE = 8;

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFriendsReviews = useCallback(async (ids, filterId = null) => {
        const targetIds = filterId ? [filterId] : ids;
        if (!targetIds?.length) { setReviews([]); setLoading(false); return; }

        const { data, error } = await supabase
            .from('Reviews').select('*, Books(*)')
            .in('user_id', targetIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) console.error('Error fetching reviews:', error);
        setReviews(data || []);
        setLoading(false);
    }, []);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const [followingRes, followersRes] = await Promise.all([
                supabase.from('Followers').select('following_id').eq('follower_id', user.id).eq('status', 'accepted'),
                supabase.from('Followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted')
            ]);

            const followingIds = new Set(followingRes.data?.map(f => f.following_id));
            const mutualIds = followersRes.data?.filter(f => followingIds.has(f.follower_id)).map(f => f.follower_id) || [];

            if (mutualIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('Profiles').select('id, username, avatar_url').in('id', mutualIds);
                setFriends(profiles || []);
                await fetchFriendsReviews(mutualIds);
            } else {
                setFriends([]); setReviews([]); setLoading(false);
            }
        } catch (err) {
            console.error('Mutual Friend Fetch Error:', err);
            setLoading(false);
        }
    }, [fetchFriendsReviews]);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    const handleSelectFriend = (id) => {
        if (selectedFriendId === id) {
            setSelectedFriendId(null);
            fetchFriendsReviews(friends.map(f => f.id));
        } else {
            setSelectedFriendId(id);
            fetchFriendsReviews([], id);
        }
    };

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
        <div className="pg-wrap">
            <div className="pg-bg" />
            <SidebarNav />

            <div className="pg-main">
                <header className="pg-header">
                    <SearchBar onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
                </header>

                <div className="friends-layout">
                    {/* Left: reviews feed */}
                    <div className="glass friends-feed">
                        <p className="friends-feed__title">
                            {selectedFriendId ? 'Reviews from Friend' : 'Recent Reviews from All Friends'}
                        </p>

                        {loading ? (
                            <div className="state-empty"><p>Syncing reviews...</p></div>
                        ) : reviews.length > 0 ? (
                            reviews.map(r => {
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
                            <div className="state-empty"><p>Add friends to see their reviews</p></div>
                        ) : (
                            <div className="state-empty"><p>No reviews available at this time</p></div>
                        )}
                    </div>

                    {/* Right: friends list */}
                    <div className="glass friends-list">
                        <div className="friends-list__header">
                            <p className="friends-list__title">Friends</p>
                            <button
                                onClick={() => setShowSearchModal(true)}
                                className="btn btn-ghost"
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                            >
                                Search
                            </button>
                        </div>

                        {friends.length === 0 ? (
                            <div className="state-empty" style={{ padding: '20px 0' }}>
                                <p>Add friends to see them here!</p>
                            </div>
                        ) : (
                            <div className="friends-list__items">
                                {paginatedFriends.map(f => (
                                    <div
                                        key={f.id}
                                        onClick={() => handleSelectFriend(f.id)}
                                        className={`friends-item${selectedFriendId === f.id ? ' friends-item--active' : ''}`}
                                    >
                                        <img
                                            src={f.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${f.username}`}
                                            className="friends-item__avatar"
                                            alt="pfp"
                                            onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${f.username}`; }}
                                        />
                                        <span
                                            className="friends-item__name"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${f.id}`); }}
                                        >
                                            {f.username}
                                        </span>
                                    </div>
                                ))}

                                {friends.length > FRIENDS_PER_PAGE && (
                                    <button
                                        onClick={() => setFriendPage(prev => (prev * FRIENDS_PER_PAGE < friends.length ? prev + 1 : 1))}
                                        className="btn btn-ghost"
                                        style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '9px' }}
                                    >
                                        Next Page
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search friend modal */}
            {showSearchModal && (
                <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
                    <div className="modal-glass friends-search-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowSearchModal(false)}>✕</button>
                        <p className="friends-search-modal__title">Search Friends</p>
                        <input
                            autoFocus
                            placeholder="Type username..."
                            className="glass-input"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="friends-search-modal__results">
                            {friends
                                .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(f => (
                                    <div
                                        key={f.id}
                                        className="friends-search-result"
                                        onClick={() => { handleSelectFriend(f.id); setShowSearchModal(false); }}
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

export default FriendsPage;
