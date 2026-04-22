import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import { supabase } from '../Services/supabaseClient';
import ReviewModal from '../Components/Reviews/ReviewModal';
import ReviewDetailModal from '../Components/Reviews/ReviewDetailModal';
import UserReviewCard from '../Components/Cards/UserReviewCard';
import '../Styles/variables.css';
import '../Styles/theme.css';
import '../Styles/Pages/BookDetailPage.css';

function BookDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isbn } = useParams();

    const [bookData, setBookData] = useState(location.state?.book || null);
    const bookIsbn = bookData?.isbn || isbn;

    const title = bookData?.book_title || bookData?.title || 'Loading...';
    const author = bookData?.book_author || bookData?.author || 'Loading author...';
    const cover = bookData?.image_url_l || bookData?.image_url_m || bookData?.image_url_s || null;
    const description = bookData?.description || bookData?.book_description || bookData?.summary || 'No description available.';

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [myShelves, setMyShelves] = useState([]);
    const [showShelfSelector, setShowShelfSelector] = useState(false);
    const [isHoveringX, setIsHoveringX] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [acceptedFollowing, setAcceptedFollowing] = useState([]);
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
        if (!bookData && isbn) {
            supabase.from('Books').select('*').eq('isbn', isbn).single()
                .then(({ data, error }) => {
                    setBookData(!error && data ? data : { book_title: 'Unknown Title', book_author: 'Unknown Author' });
                });
        }
    }, [isbn, bookData]);

    const fetchMyShelves = useCallback(async (userId) => {
        const { data, error } = await supabase
            .from('UserLists').select('*, ListEntries(isbn)')
            .eq('user_id', userId).order('created_at', { ascending: true });
        if (!error) {
            const slots = [...(data || [])];
            while (slots.length < 3) slots.push({ isPlaceholder: true });
            setMyShelves(slots);
        }
    }, []);

    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                fetchMyShelves(user.id);
                const { data: following } = await supabase
                    .from('Followers').select('following_id')
                    .eq('follower_id', user.id).eq('status', 'accepted');
                setAcceptedFollowing(following?.map(f => f.following_id) || []);
            }
        };
        initUser();
    }, [bookIsbn, fetchMyShelves]);

    const toggleBookOnShelf = async (list) => {
        if (list.isPlaceholder) return;
        const isIn = list.ListEntries?.some(e => e.isbn === bookIsbn);
        if (isIn) {
            const { error } = await supabase.from('ListEntries').delete().match({ list_id: list.id, isbn: bookIsbn });
            if (!error) fetchMyShelves(currentUser.id);
        } else {
            const { error } = await supabase.from('ListEntries').insert([{ list_id: list.id, isbn: bookIsbn }]);
            if (!error) fetchMyShelves(currentUser.id);
        }
    };

    const isInAnyShelf = myShelves.some(l => !l.isPlaceholder && l.ListEntries?.some(e => e.isbn === bookIsbn));

    const fetchReviews = useCallback(async () => {
        if (!bookIsbn) return;
        setLoadingReviews(true);
        const { data, error } = await supabase
            .from('Reviews')
            .select('id, rating, review_comment, created_at, user_id, book_id, profiles: Reviews_user_id_fkey(id, username, avatar_url, is_private)')
            .eq('book_id', bookIsbn)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching reviews:', error.message);

        if (data) {
            setReviews(data.filter(rev => {
                if (currentUser?.id === rev.user_id) return true;
                if (!rev.profiles) return false;
                if (!rev.profiles.is_private) return true;
                return acceptedFollowing.includes(rev.user_id);
            }));
        }
        setLoadingReviews(false);
    }, [bookIsbn, currentUser, acceptedFollowing]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    return (
        <div className="pg-wrap">
            <div className="pg-bg" />
            <SidebarNav />

            <div className="pg-main">
                <div className="bdp-content">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost bdp-back">
                        ← Back
                    </button>

                    {/* Book info panel */}
                    <div className="glass bdp-info-panel">
                        <div className="bdp-cover-col">
                            {!imgFailed && cover ? (
                                <img src={cover} alt={title} className="bdp-cover" onError={() => setImgFailed(true)} />
                            ) : (
                                <div className="bdp-cover-fallback">
                                    <span style={{ fontSize: '36px', opacity: 0.5 }}>📖</span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>No Cover</span>
                                </div>
                            )}

                            {currentUser && (
                                <button
                                    onClick={() => setShowShelfSelector(true)}
                                    className={`bdp-shelf-btn ${isInAnyShelf ? 'bdp-shelf-btn--in' : 'bdp-shelf-btn--out'}`}
                                >
                                    {isInAnyShelf ? '✓' : '+'}
                                </button>
                            )}
                        </div>

                        <div className="bdp-meta">
                            <h2 className="bdp-title">{title}</h2>
                            <p className="bdp-meta-row"><strong>Author:</strong> {author}</p>
                            <p className="bdp-meta-row"><strong>ISBN:</strong> {bookIsbn || 'Unknown'}</p>
                            <p className="bdp-description-label">Description</p>
                            <p className="bdp-description">{description}</p>
                        </div>
                    </div>

                    {/* Reviews panel */}
                    <div className="glass bdp-reviews-panel">
                        <div className="bdp-reviews-header">
                            <h3 className="bdp-reviews-title">User Reviews</h3>
                            {currentUser && (
                                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-copper" style={{ fontSize: '12px', padding: '9px 18px' }}>
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {loadingReviews && <div className="state-empty"><p>Loading reviews...</p></div>}

                        <div className="bdp-review-list">
                            {reviews.length > 0 ? (
                                reviews.map(rev => (
                                    <UserReviewCard
                                        key={rev.id}
                                        isBookDetailPage={true}
                                        review={{
                                            ...rev,
                                            Books: {
                                                book_title: rev.profiles?.username || 'Unknown User',
                                                book_author: 'Reader',
                                                image_url_m: rev.profiles?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${rev.profiles?.username || 'fallback'}`
                                            }
                                        }}
                                        onClick={() => setSelectedReview(rev)}
                                    />
                                ))
                            ) : !loadingReviews && (
                                <p className="bdp-no-reviews">No reviews yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showShelfSelector && (
                <div className="modal-overlay" onClick={() => setShowShelfSelector(false)}>
                    <div className="modal-lite bdp-shelf-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-lite" onClick={() => setShowShelfSelector(false)}>✕</button>
                        <h4 className="bdp-shelf-modal-title">Add to Shelf</h4>
                        <div className="bdp-shelf-modal-list">
                            {myShelves.map((list, idx) => {
                                const inThis = !list.isPlaceholder && list.ListEntries?.some(e => e.isbn === bookIsbn);
                                return list.isPlaceholder ? (
                                    <div key={`slot-${idx}`} className="bdp-shelf-modal-item bdp-shelf-modal-item--disabled">
                                        Empty Shelf Slot {idx + 1}
                                    </div>
                                ) : (
                                    <div
                                        key={list.id}
                                        onClick={() => toggleBookOnShelf(list)}
                                        className={`bdp-shelf-modal-item${inThis ? ' bdp-shelf-modal-item--in' : ''}`}
                                    >
                                        <span>{list.name}</span>
                                        {inThis && (
                                            <div
                                                onMouseEnter={() => setIsHoveringX(list.id)}
                                                onMouseLeave={() => setIsHoveringX(null)}
                                                className="bdp-mini-check"
                                                style={{ backgroundColor: isHoveringX === list.id ? '#c0392b' : 'var(--color-glow)' }}
                                            >
                                                {isHoveringX === list.id ? '✕' : '✓'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <ReviewModal
                    book={bookData}
                    userId={currentUser?.id}
                    onClose={() => setIsCreateModalOpen(false)}
                    onReviewCreated={fetchReviews}
                />
            )}

            {selectedReview && (
                <ReviewDetailModal
                    review={{
                        ...selectedReview,
                        Books: { ...bookData, book_title: title, book_author: author, book_cover_url: cover }
                    }}
                    currentUserId={currentUser?.id}
                    onClose={() => setSelectedReview(null)}
                    onDeleteSuccess={fetchReviews}
                />
            )}
        </div>
    );
}

export default BookDetailPage;
