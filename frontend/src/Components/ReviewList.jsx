import React, { useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import UserReviewCard from './Cards/UserReviewCard';

const ReviewList = ({ userId }) => {
    const [ reviews, setReviews ] = useState([]);
    const [ limit, setLimit ] = useState(5);
    const [ hasMore, setHasMore ] = useState(true);

    useEffect (() => {
        const fetchReviews = async () => {
            if (!userId) return;

            const { data, error } = await supabase
                .from('Reviews')
                .select('*, Books(book_title, book_author, book_cover_url)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(0, limit - 1);
            
            if (!error && data) {
                setReviews(data);
                if (data.length < limit) setHasMore(false);
            }
        };

        fetchReviews();
    }, [userId, limit]);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length > 0 ? (
                <>
                    {reviews.map((rev) => (
                        <UserReviewCard
                            key={rev.id}
                            bookTitle={rev.Books?.book_title}
                            author={rev.Books?.book_author}
                            coverImg={rev.Books?.book_cover_url}
                            reviewText = {rev.review_text}
                        />
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => setLimit(prev => prev + 10)}
                            style={{ padding: '12px', cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '5px' }}
                        >
                            Load More
                        </button>
                    )}
                </>
            ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>No reviews yet.</p>
            )}
        </div>
    );
};

export default ReviewList;