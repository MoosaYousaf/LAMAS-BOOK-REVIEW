import React, { useEffect, useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import UserReviewCard from '../Cards/UserReviewCard';

/**
 * ReviewList Component
 * @param {string} userId - ID of the profile owner to fetch reviews for
 * @param {number} refreshKey - Incrementing this forces a re-fetch
 * @param {function} onReviewClick - Passed down to individual cards
 */
const ReviewList = ({ userId, refreshKey = 0, onReviewClick }) => {
    const [reviews, setReviews] = useState([]);
    const [limit, setLimit] = useState(5);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!userId) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('Reviews')
                .select('*, Books(*)') // Pull full book data for the cards
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(0, limit - 1);
            
            if (!error && data) {
                setReviews(data);
                // If we got fewer results than the limit, there are no more to load
                if (data.length < limit) setHasMore(false);
            }
            setLoading(false);
        };

        fetchReviews();
    }, [userId, limit, refreshKey]);

    if (loading && reviews.length === 0) return <p style={styles.statusText}>Loading reviews...</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length > 0 ? (
                <>
                    {reviews.map((rev) => (
                        <UserReviewCard
                            key={rev.id}
                            review={rev}
                            onClick={onReviewClick}
                        />
                    ))}
                    
                    {hasMore && (
                        <button
                            onClick={() => setLimit(prev => prev + 5)}
                            style={styles.loadMoreBtn}
                        >
                            Load More
                        </button>
                    )}
                </>
            ) : (
                <div style={styles.emptyState}>
                    <p>No reviews posted yet.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    statusText: { textAlign: 'center', color: '#666', padding: '20px' },
    loadMoreBtn: { 
        padding: '12px', 
        cursor: 'pointer', 
        background: '#fff', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        fontWeight: 'bold',
        color: '#555',
        marginTop: '10px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        background: '#f9f9f9',
        borderRadius: '12px',
        border: '1px dashed #ccc',
        color: '#999'
    }
};

export default ReviewList;