import React, { useEffect, useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import UserReviewCard from '../Cards/UserReviewCard';

const ReviewList = ({ userId, refreshKey = 0, onReviewClick }) => {
    const [reviews, setReviews] = useState([]);
    const [limit, setLimit] = useState(5);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!userId) return;
            setLoading(true);

            // Fetch reviews joined with book and profile data
            const { data, error } = await supabase
                .from('Reviews')
                .select(`
                    *,
                    Books(*),
                    profiles:user_id(*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(0, limit - 1);

            if (error) console.error('Fetch error:', error);

            if (data) {
                setReviews(data);
                if (data.length < limit) setHasMore(false);
            }
            setLoading(false);
        };

        fetchReviews();
    }, [userId, limit, refreshKey]);

    if (loading && reviews.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px', fontFamily: 'var(--font-body)', fontSize: '14px' }}>Loading reviews...</p>;
    }

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
                        <button onClick={() => setLimit(prev => prev + 5)} style={{
                            padding: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                            marginTop: '10px',
                            transition: 'background 0.15s ease',
                        }}>
                            Load More
                        </button>
                    )}
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                }}>
                    <p style={{ margin: 0 }}>No reviews posted yet.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
