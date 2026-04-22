import { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import '../../Styles/variables.css';
import '../../Styles/theme.css';
import '../../Styles/Components/ReviewModal.css';

const ReviewModal = ({ book, userId, onClose, onReviewCreated }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(book || null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const { data, error } = await supabase
            .from('Books')
            .select('*')
            .ilike('book_title', `%${searchQuery}%`)
            .limit(20);

        if (!error) {
            const q = searchQuery.toLowerCase().trim();
            const sorted = (data || []).sort((a, b) => {
                const aT = a.book_title.toLowerCase(), bT = b.book_title.toLowerCase();
                if (aT === q && bT !== q) return -1;
                if (bT === q && aT !== q) return 1;
                if (aT.startsWith(q) && !bT.startsWith(q)) return -1;
                if (bT.startsWith(q) && !aT.startsWith(q)) return 1;
                return a.book_title.localeCompare(b.book_title);
            });
            setSearchResults(sorted.slice(0, 10));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook || !userId) return;
        setSubmitting(true);
        setError('');
        try {
            const { error: insertError } = await supabase.from('Reviews').insert({
                user_id: userId,
                book_id: selectedBook.isbn,
                rating: Number(rating),
                review_comment: reviewText.trim(),
                created_at: new Date().toISOString(),
            });
            if (insertError) throw insertError;
            if (onReviewCreated) onReviewCreated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-glass rmodal" onClick={(e) => e.stopPropagation()}>
                <div className="rmodal__header">
                    <h3 className="rmodal__title">{book ? 'Write a Review' : 'Create New Review'}</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>

                {!selectedBook ? (
                    <div>
                        <div className="rmodal__search-row">
                            <input
                                className="glass-input"
                                placeholder="Search for a book..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>Search</button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="rmodal__results">
                                {searchResults.map(b => {
                                    const thumb = b.image_url_m || b.image_url_l;
                                    return (
                                        <div key={b.isbn} onClick={() => setSelectedBook(b)} className="rmodal__result-item">
                                            {thumb && (
                                                <img
                                                    src={thumb}
                                                    alt=""
                                                    className="rmodal__result-thumb"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                            <div>
                                                <strong>{b.book_title}</strong>
                                                <span> — {b.book_author}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rmodal__selected-book">
                        <img
                            src={selectedBook.image_url_m || selectedBook.book_cover_url}
                            alt="cover"
                            className="rmodal__mini-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="rmodal__selected-info">
                            <p className="rmodal__selected-title">{selectedBook.book_title}</p>
                            <p className="rmodal__selected-author">{selectedBook.book_author}</p>
                            {!book && (
                                <button onClick={() => setSelectedBook(null)} className="rmodal__change-btn">
                                    Change Book
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="rmodal__form">
                    <div>
                        <label className="glass-label">Rating</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="glass-select"
                        >
                            {[5, 4, 3, 2, 1].map(n => (
                                <option key={n} value={n}>{n} / 5 Stars</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="glass-label">Review</label>
                        <textarea
                            className="glass-textarea"
                            placeholder="What did you think?"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required
                            style={{ minHeight: '110px' }}
                        />
                    </div>

                    {error && <p className="rmodal__error">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting || !selectedBook}
                        className="btn btn-copper"
                        style={{ padding: '13px', fontSize: '14px' }}
                    >
                        {submitting ? 'Posting...' : 'Post Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
