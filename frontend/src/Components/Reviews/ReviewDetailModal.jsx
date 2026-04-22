// ReviewDetailModal — full-screen overlay modal showing a single review in detail.
// Displays the reviewer's profile, the book, rating, and full review text.
// If the current user is the review author, Edit and Delete controls appear.
//
// The `review` prop can come from two different Supabase query shapes:
//   - From a Reviews query with profile/book joins (profile page, book detail page)
//   - From a denormalized shape (community page)
// The userData/bookData variables below handle all three shapes with fallback chains.
//
// Clicking the user row navigates to their profile.
// Clicking the book row navigates to the book detail page.
// Edit mode swaps the text and rating into editable inputs in-place.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';
import '../../Styles/variables.css';
import '../../Styles/theme.css';
import '../../Styles/Components/ReviewDetailModal.css';

const ReviewDetailModal = ({ review, currentUserId, onClose, onDeleteSuccess }) => {
    const navigate = useNavigate();
    const isAuthor = String(currentUserId) === String(review.user_id);

    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(review.review_comment);
    const [editedRating, setEditedRating] = useState(review.rating);
    const [isSaving, setIsSaving] = useState(false);

    // Normalise the review data regardless of which query shape it came from.
    // `review.profiles` is the joined Profiles row; `review.user_data` is a
    // legacy alias; falling back to `review` itself covers denormalised shapes.
    const userData = review.profiles || review.user_data || review;
    const bookData = review.Books || review.book_data || review;

    const username = userData?.username || review?.username || 'Reader';
    const userPfp = userData?.avatar_url || review?.avatar_url ||
        `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
    const bookCover = bookData?.book_cover_url || bookData?.image_url_l || bookData?.image_url_m;
    const bookTitle = bookData?.book_title || bookData?.title || 'Unknown Book';
    const bookAuthor = bookData?.book_author || bookData?.author || 'Unknown Author';

    const handleDelete = async () => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            const { error } = await supabase.from('Reviews').delete().eq('id', review.id);
            if (error) throw error;
            if (onDeleteSuccess) onDeleteSuccess();
            onClose();
        } catch (err) {
            alert('Error: ' + err.message);
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
            // onDeleteSuccess is reused here as a generic "something changed" callback
            // that tells the parent to re-fetch reviews after an edit or delete
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-lite" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-lite" onClick={onClose}>✕</button>

                {/* User row */}
                <div className="rdm__top">
                    <div
                        className="rdm__user"
                        onClick={() => { if (!isEditing) { navigate(`/profile/${review.user_id}`); onClose(); } }}
                    >
                        <img
                            src={userPfp}
                            className="rdm__pfp"
                            alt="pfp"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`; }}
                        />
                        <strong className="rdm__username">{username}</strong>
                    </div>
                    <span className="rdm__date">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>

                {/* Book row */}
                <div
                    className="rdm__book-row"
                    onClick={() => { if (!isEditing) { navigate(`/book/${review.book_id}`); onClose(); } }}
                >
                    {bookCover && (
                        <img
                            src={bookCover}
                            className="rdm__book-cover"
                            alt="book"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <div className="rdm__book-meta">
                        <h2 className="rdm__book-title">{bookTitle}</h2>
                        <p className="rdm__book-author">by {bookAuthor}</p>
                        {isEditing ? (
                            <select
                                value={editedRating}
                                onChange={(e) => setEditedRating(Number(e.target.value))}
                                className="lite-select"
                                style={{ width: 'auto' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                            </select>
                        ) : (
                            <div className="rdm__rating">★ {editedRating} / 5</div>
                        )}
                    </div>
                </div>

                {/* Review text */}
                <div>
                    {isEditing ? (
                        <textarea
                            className="lite-textarea"
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                        />
                    ) : (
                        <p className="rdm__text">{editedComment}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="rdm__footer">
                    <div className="rdm__footer-left">
                        {isAuthor && !isEditing && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="btn-lite btn-lite-ghost">Edit</button>
                                <button onClick={handleDelete} className="btn-lite btn-lite-danger">Delete</button>
                            </>
                        )}
                        {isEditing && (
                            <button onClick={handleUpdate} disabled={isSaving} className="btn-lite btn-lite-success">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="btn-lite btn-lite-primary">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetailModal;
