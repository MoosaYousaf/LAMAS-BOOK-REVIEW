import { useState, useEffect } from 'react';
import { supabase } from '../../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BookCard from '../Cards/BookCard';
import '../../Styles/variables.css';
import '../../Styles/theme.css';
import '../../Styles/Components/ShelvesManager.css';

const ListModal = ({ list, isOwnProfile, onClose, onUpdate }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(!list);
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [pendingBook, setPendingBook] = useState(null);

    const [formData, setFormData] = useState({
        name: list?.name || '',
        description: list?.description || '',
        private_list: list?.private_list || false
    });

    useEffect(() => {
        if (list?.id) fetchListBooks();
    }, [list]);

    const fetchListBooks = async () => {
        const { data, error } = await supabase
            .from('ListEntries').select('isbn, Books(*)').eq('list_id', list.id);
        if (!error) setBooks(data || []);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const { data, error } = await supabase
            .from('Books').select('*').ilike('book_title', `%${searchQuery}%`)
            .order('book_title', { ascending: true }).limit(10);
        if (!error) setSearchResults(data);
    };

    const confirmAddBook = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('ListEntries').insert([{ list_id: list.id, isbn: pendingBook.isbn }]);
        if (error) {
            alert(error.code === '23505' ? 'Book is already on this shelf.' : error.message);
        } else {
            setBooks([...books, { isbn: pendingBook.isbn, Books: pendingBook }]);
            setPendingBook(null);
            setSearchResults([]);
            setSearchQuery('');
            if (onUpdate) onUpdate();
        }
        setLoading(false);
    };

    const handleRemoveBook = async (isbn) => {
        const { error } = await supabase
            .from('ListEntries').delete().eq('list_id', list.id).eq('isbn', isbn);
        if (!error) {
            setBooks(books.filter(b => b.isbn !== isbn));
            if (onUpdate) onUpdate();
        }
    };

    const handleSaveDetails = async () => {
        if (!formData.name.trim()) return alert('Please enter a name for the shelf.');
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const payload = { ...formData, user_id: user.id };
        const { error } = list?.id
            ? await supabase.from('UserLists').update(payload).eq('id', list.id)
            : await supabase.from('UserLists').insert([payload]);
        if (error) alert(error.message);
        else {
            if (onUpdate) onUpdate();
            if (!list?.id) onClose();
            else setIsEditing(false);
        }
        setLoading(false);
    };

    const handleDeleteList = async () => {
        if (!window.confirm('PERMANENTLY delete this shelf?')) return;
        setLoading(true);
        const { error } = await supabase.from('UserLists').delete().match({ id: list.id });
        if (error) alert(error.message);
        else { if (onUpdate) onUpdate(); onClose(); }
        setLoading(false);
    };

    return (
        <div className="lm-overlay">
            <div className="lm">
                <button onClick={onClose} className="modal-close">✕</button>

                {pendingBook && (
                    <div className="lm__confirm-overlay">
                        <div className="lm__confirm-box">
                            <h3 className="lm__confirm-title">Add to Shelf?</h3>
                            <div className="lm__confirm-preview">
                                {(pendingBook.image_url_m || pendingBook.image_url_l) ? (
                                    <img
                                        src={pendingBook.image_url_m || pendingBook.image_url_l}
                                        alt={pendingBook.book_title}
                                        className="lm__confirm-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="lm__confirm-cover-fallback">📖</div>
                                )}
                                <p className="lm__confirm-book-title">{pendingBook.book_title}</p>
                                <p className="lm__confirm-book-author">{pendingBook.book_author}</p>
                            </div>
                            <div className="lm__confirm-actions">
                                <button onClick={confirmAddBook} className="btn btn-copper">Yes, Add</button>
                                <button onClick={() => setPendingBook(null)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing ? (
                    <div>
                        <h2 className="lm__title">{list ? 'Edit Shelf' : 'Create New Shelf'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label className="glass-label">Shelf Title</label>
                                <input
                                    className="glass-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Shelf Name"
                                />
                            </div>
                            <div>
                                <label className="glass-label">Description</label>
                                <textarea
                                    className="glass-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <label className="glass-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.private_list}
                                    onChange={e => setFormData({ ...formData, private_list: e.target.checked })}
                                />
                                Strictly Private
                            </label>

                            {list?.id && (
                                <div style={{ marginTop: '8px' }}>
                                    <label className="glass-label" style={{ marginBottom: '10px' }}>Add Books</label>
                                    <div className="lm__search-row">
                                        <input
                                            className="glass-input"
                                            placeholder="Search title..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button onClick={handleSearch} className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>Search</button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="lm__search-results">
                                            {searchResults.map(b => (
                                                <div key={b.isbn} onClick={() => setPendingBook(b)} className="lm__result-item">
                                                    <strong>{b.book_title}</strong> <span>by {b.book_author}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="lm__footer">
                                <button
                                    onClick={handleSaveDetails}
                                    disabled={loading}
                                    className="btn btn-copper"
                                    style={{ flex: 2, padding: '14px' }}
                                >
                                    {loading ? 'Processing...' : (list ? 'Save Settings' : 'Create Shelf')}
                                </button>
                                {list && (
                                    <button
                                        onClick={handleDeleteList}
                                        className="btn btn-danger"
                                        style={{ flex: 1, padding: '14px' }}
                                    >
                                        Delete Shelf
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="lm__header-row">
                            <div>
                                <h1 className="lm__shelf-name">{formData.name}</h1>
                                {formData.description && <p className="lm__shelf-desc">{formData.description}</p>}
                            </div>
                            {isOwnProfile && (
                                <button onClick={() => setIsEditing(true)} className="btn btn-ghost">
                                    Manage Shelf
                                </button>
                            )}
                        </div>

                        <div className="lm__book-grid">
                            {books.map(entry => (
                                <div key={entry.isbn} className="lm__card-wrap">
                                    <div
                                        onClick={() => navigate(`/book/${entry.isbn}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <BookCard book={entry.Books} />
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => handleRemoveBook(entry.isbn)}
                                            className="lm__remove-btn"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListModal;
