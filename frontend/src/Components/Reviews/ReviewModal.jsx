import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';

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
        
        // We fetch 20 to ensure we catch the exact match even if there's noise
        const { data, error } = await supabase
            .from('Books')
            .select('*')
            .ilike('book_title', `%${searchQuery}%`)
            .limit(20);
        
        if (!error) {
            const q = searchQuery.toLowerCase().trim();
            
            const sorted = (data || []).sort((a, b) => {
                const aTitle = a.book_title.toLowerCase();
                const bTitle = b.book_title.toLowerCase();

                // 1. Exact match gets top priority
                const aExact = aTitle === q;
                const bExact = bTitle === q;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // 2. "Starts with" gets second priority
                const aStarts = aTitle.startsWith(q);
                const bStarts = bTitle.startsWith(q);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // 3. Alphabetical for everything else
                return a.book_title.localeCompare(b.book_title);
            });

            setSearchResults(sorted.slice(0, 10)); // Only show top 10
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
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3>{book ? 'Write a Review' : 'Create New Review'}</h3>
                    <button onClick={onClose} style={styles.closeX}>✕</button>
                </div>

                {!selectedBook ? (
                    <div style={styles.searchSection}>
                        <div style={styles.row}>
                            <input 
                                style={styles.input} 
                                placeholder="Search for a book..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} style={styles.btnSecondary}>Search</button>
                        </div>
                        <div style={styles.resultsBox}>
                            {searchResults.map(b => (
                                <div key={b.isbn} onClick={() => setSelectedBook(b)} style={styles.resultItem}>
                                    <strong>{b.book_title}</strong> by {b.book_author}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={styles.selectedBookInfo}>
                        <img src={selectedBook.image_url_m || selectedBook.book_cover_url} alt="cover" style={styles.miniCover} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{selectedBook.book_title}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{selectedBook.book_author}</div>
                            {!book && <button onClick={() => setSelectedBook(null)} style={styles.changeBtn}>Change Book</button>}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Rating</label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.input}>
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                    </select>

                    <label style={styles.label}>Review</label>
                    <textarea 
                        style={styles.textarea} 
                        placeholder="What did you think?" 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                    />

                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                    <button type="submit" disabled={submitting || !selectedBook} style={styles.submitBtn}>
                        {submitting ? 'Posting...' : 'Post Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    closeX: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
    searchSection: { marginBottom: '20px' },
    row: { display: 'flex', gap: '8px' },
    input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' },
    btnSecondary: { padding: '10px 15px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' },
    resultsBox: { maxHeight: '150px', overflowY: 'auto', marginTop: '8px', border: '1px solid #eee', borderRadius: '6px' },
    resultItem: { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '14px' },
    selectedBookInfo: { display: 'flex', gap: '15px', background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
    miniCover: { width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' },
    changeBtn: { border: 'none', background: 'none', color: '#007bff', padding: 0, fontSize: '12px', cursor: 'pointer', marginTop: '4px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    label: { fontWeight: 'bold', fontSize: '14px' },
    textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical' },
    submitBtn: { padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ReviewModal;