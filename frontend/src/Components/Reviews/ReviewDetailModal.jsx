import React from 'react';
import { supabase } from '../../Services/supabaseClient';

const ReviewDetailModal = ({ review, currentUserId, onClose, onDeleteSuccess }) => {

    const isAuthor = String(currentUserId) === String(review.user_id);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this review?");
        if (!confirmDelete) return;
        
        try {
            const { error } = await supabase
                .from('Reviews')
                .delete()
                .eq('id', review.id);

            if (error) throw error;

            // Success logic
            if (onDeleteSuccess) onDeleteSuccess();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err.message);
            alert("Error deleting review: " + err.message);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.topSection}>
                    <div style={styles.userInfo}>
                        <img src={review.profiles?.avatar_url || 'https://via.placeholder.com/40'} style={styles.pfp} alt="pfp" />
                        <strong>{review.profiles?.username}</strong>
                    </div>
                    <div style={styles.timestamp}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>

                <div style={styles.midSection}>
                    <img src={review.Books?.book_cover_url || 'https://via.placeholder.com/100x150'} style={styles.bookCover} alt="book" />
                    <div style={styles.bookMeta}>
                        <h2 style={{ margin: 0 }}>{review.Books?.book_title}</h2>
                        <p style={{ color: '#666' }}>by {review.Books?.book_author}</p>
                        <div style={{ color: '#d4a017' }}>★ {review.rating} / 5</div>
                    </div>
                </div>

                <div style={styles.bottomSection}>
                    <p style={styles.fullText}>{review.review_comment}</p>
                </div>

                <div style={styles.footer}>
                    {isAuthor && <button onClick={handleDelete} style={styles.deleteBtn}>Delete Review</button>}
                    <button onClick={onClose} style={styles.closeBtn}>Close</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
    topSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    pfp: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    timestamp: { color: '#888', fontSize: '14px' },
    midSection: { display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #eee' },
    bookCover: { width: '100px', height: '150px', objectFit: 'cover', borderRadius: '6px' },
    bookMeta: { flex: 1 },
    bottomSection: { padding: '20px 0' },
    fullText: { lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '20px' },
    deleteBtn: { padding: '10px 20px', color: '#d9534f', border: '1px solid #d9534f', background: 'none', borderRadius: '8px', cursor: 'pointer' },
    closeBtn: { padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default ReviewDetailModal;