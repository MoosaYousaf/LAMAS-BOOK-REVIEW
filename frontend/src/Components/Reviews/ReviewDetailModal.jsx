import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';

const ReviewDetailModal = ({ review, currentUserId, onClose, onDeleteSuccess }) => {
    const navigate = useNavigate();
    const isAuthor = String(currentUserId) === String(review.user_id);

    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(review.review_comment);
    const [editedRating, setEditedRating] = useState(review.rating);
    const [isSaving, setIsSaving] = useState(false);

    // --- ENHANCED DATA NORMALIZATION ---
    // Check 'profiles', 'user_data', or 'review' itself for user info
    const userData = review.profiles || review.user_data || review;
    const bookData = review.Books || review.book_data || review;

    // Use a strict fallback chain for username
    const username = userData?.username || review?.username || "Reader";
    
    // Use the username to generate initials pfp if avatar_url is missing everywhere
    const userPfp = userData?.avatar_url || 
                    review?.avatar_url || 
                    `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
    
    const bookCover = bookData?.book_cover_url || 
                      bookData?.image_url_l || 
                      bookData?.image_url_m || 
                      'https://via.placeholder.com/100x150';

    const bookTitle = bookData?.book_title || bookData?.title || "Unknown Book";
    const bookAuthor = bookData?.book_author || bookData?.author || "Unknown Author";

    const handleDelete = async () => {
        if (!window.confirm("Delete this review permanently?")) return;
        try {
            const { error } = await supabase.from('Reviews').delete().eq('id', review.id);
            if (error) throw error;
            if (onDeleteSuccess) onDeleteSuccess();
            onClose();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('Reviews').update({
                review_comment: editedComment,
                rating: editedRating
            }).eq('id', review.id);
            if (error) throw error;
            setIsEditing(false);
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.topSection}>
                    <div 
                        style={{ ...styles.userInfo, cursor: isEditing ? 'default' : 'pointer' }} 
                        onClick={() => { if(!isEditing) { navigate(`/profile/${review.user_id}`); onClose(); } }}
                    >
                        <img src={userPfp} style={styles.pfp} alt="pfp" />
                        <strong>{username}</strong>
                    </div>
                    <div style={styles.timestamp}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>

                <div style={styles.midSection} onClick={() => { if(!isEditing) { navigate(`/book/${review.book_id}`); onClose(); } }}>
                    <img src={bookCover} style={styles.bookCover} alt="book" />
                    <div style={styles.bookMeta}>
                        <h2 style={{ margin: 0 }}>{bookTitle}</h2>
                        <p style={{ color: '#666' }}>by {bookAuthor}</p>
                        {isEditing ? (
                            <select value={editedRating} onChange={(e) => setEditedRating(Number(e.target.value))} style={styles.selectInput}>
                                {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
                            </select>
                        ) : (
                            <div style={{ color: '#d4a017' }}>★ {editedRating} / 5</div>
                        )}
                    </div>
                </div>

                <div style={styles.bottomSection}>
                    {isEditing ? (
                        <textarea style={styles.textarea} value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                    ) : (
                        <p style={styles.fullText}>{editedComment}</p>
                    )}
                </div>

                <div style={styles.footer}>
                    <div style={styles.leftActions}>
                        {isAuthor && !isEditing && (
                            <>
                                <button onClick={() => setIsEditing(true)} style={styles.editBtn}>Edit</button>
                                <button onClick={handleDelete} style={styles.deleteBtn}>Delete</button>
                            </>
                        )}
                        {isEditing && (
                            <button onClick={handleUpdate} disabled={isSaving} style={styles.saveBtn}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
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
    midSection: { display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #eee', cursor: 'pointer' },
    bookCover: { width: '100px', height: '150px', objectFit: 'cover', borderRadius: '6px' },
    bookMeta: { flex: 1, minWidth: 0 },
    bottomSection: { padding: '20px 0' },
    fullText: { lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' },
    textarea: { width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '20px' },
    leftActions: { display: 'flex', gap: '10px' },
    editBtn: { padding: '10px 20px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
    deleteBtn: { padding: '10px 20px', color: '#d9534f', border: '1px solid #d9534f', background: 'none', borderRadius: '8px', cursor: 'pointer' },
    saveBtn: { padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    closeBtn: { padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default ReviewDetailModal;