import React, { useState, useEffect } from 'react';
import { supabase } from '../../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BookCard from '../Cards/BookCard'; 

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
            .from('ListEntries')
            .select('isbn, Books(*)')
            .eq('list_id', list.id);
        if (!error) setBooks(data || []);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const { data, error } = await supabase
            .from('Books')
            .select('*')
            .ilike('book_title', `%${searchQuery}%`)
            .order('book_title', { ascending: true })
            .limit(10);
        
        if (!error) setSearchResults(data);
    };

    const confirmAddBook = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('ListEntries')
            .insert([{ list_id: list.id, isbn: pendingBook.isbn }]);

        if (error) {
            alert(error.code === '23505' ? "Book is already on this shelf." : error.message);
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
            .from('ListEntries')
            .delete()
            .eq('list_id', list.id)
            .eq('isbn', isbn);

        if (!error) {
            setBooks(books.filter(b => b.isbn !== isbn));
            if (onUpdate) onUpdate();
        }
    };

    const handleSaveDetails = async () => {
        if (!formData.name.trim()) return alert("Please enter a name for the shelf.");
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
        if (!window.confirm("PERMANENTLY delete this shelf?")) return;
        setLoading(true);
        const { error } = await supabase.from('UserLists').delete().match({ id: list.id });
        if (error) alert(error.message);
        else { if (onUpdate) onUpdate(); onClose(); }
        setLoading(false);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modalContent}>
                <button onClick={onClose} style={styles.closeBtn}>✕</button>

                {pendingBook && (
                    <div style={styles.confirmOverlay}>
                        <div style={styles.confirmBox}>
                            <h3>Add to Shelf?</h3>
                            <div style={{ transform: 'scale(0.85)', marginBottom: '10px' }}>
                                <BookCard book={pendingBook} />
                            </div>
                            <div style={styles.actionRow}>
                                <button onClick={confirmAddBook} style={styles.saveBtn}>Yes, Add</button>
                                <button onClick={() => setPendingBook(null)} style={styles.deleteBtn}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing ? (
                    <div style={styles.editSection}>
                        <h2 style={styles.modalTitle}>{list ? 'Edit Shelf' : 'Create New Shelf'}</h2>
                        <label style={styles.label}>Shelf Title</label>
                        <input style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Shelf Name" />
                        <label style={styles.label}>Description</label>
                        <textarea style={styles.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                                <input type="checkbox" checked={formData.private_list} onChange={e => setFormData({...formData, private_list: e.target.checked})} />
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>Strictly Private</span>
                            </label>
                        </div>

                        {list?.id && (
                            <div style={styles.searchSection}>
                                <h4>Add Books</h4>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input style={{...styles.input, marginBottom: 0}} placeholder="Search title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                    <button onClick={handleSearch} style={styles.searchButton}>Search</button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div style={styles.resultsScrollBox}>
                                        {searchResults.map(b => (
                                            <div key={b.isbn} onClick={() => setPendingBook(b)} style={styles.resultItem}>
                                                <strong>{b.book_title}</strong> <span style={{ color: '#888' }}> by {b.book_author}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={styles.footerActions}>
                            <button onClick={handleSaveDetails} disabled={loading} style={styles.saveBtn}>
                                {loading ? 'Processing...' : (list ? 'Save Settings' : 'Create Shelf')}
                            </button>
                            {list && <button onClick={handleDeleteList} style={styles.deleteBtn}>Delete Shelf</button>}
                        </div>
                    </div>
                ) : (
                    <div style={styles.viewSection}>
                        <div style={styles.headerRow}>
                            <div>
                                <h1 style={{ margin: 0 }}>{formData.name}</h1>
                                <p style={{ fontSize: '16px', color: '#666' }}>{formData.description}</p>
                            </div>
                            {isOwnProfile && <button onClick={() => setIsEditing(true)} style={styles.editToggle}>Manage Shelf</button>}
                        </div>
                        
                        <div style={styles.bookGrid}>
                            {books.map(entry => (
                                <div key={entry.isbn} style={styles.cardWrapper}>
                                    <div onClick={() => navigate(`/book/${entry.isbn}`)} style={{ cursor: 'pointer' }}>
                                        <BookCard book={entry.Books} />
                                    </div>
                                    {isOwnProfile && <button onClick={() => handleRemoveBook(entry.isbn)} style={styles.removeLink}>Remove</button>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(5px)' },
    modalContent: { background: 'white', padding: '40px', borderRadius: '24px', width: '95%', maxWidth: '1150px', height: '72vh', overflowY: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', zIndex: 10 },
    confirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.96)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000, borderRadius: '24px' },
    confirmBox: { padding: '30px', border: '1px solid #eee', borderRadius: '20px', background: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', textAlign: 'center' },
    searchButton: { padding: '0 25px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    resultsScrollBox: { maxHeight: '180px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '10px', marginTop: '10px', background: '#fff' },
    resultItem: { padding: '12px 15px', borderBottom: '1px solid #f9f9f9', cursor: 'pointer' },
    bookGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px 20px', marginTop: '40px' },
    cardWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '380px' },
    removeLink: { marginTop: '10px', color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' },
    input: { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', height: '100px', resize: 'none', boxSizing: 'border-box' },
    footerActions: { display: 'flex', gap: '15px', marginTop: '30px' },
    saveBtn: { flex: 2, padding: '16px', background: '#333', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    deleteBtn: { flex: 1, padding: '16px', background: '#fff', color: '#d9534f', border: '1px solid #d9534f', borderRadius: '12px', cursor: 'pointer' },
    editToggle: { padding: '10px 20px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', marginTop: '15px' }, // Moved down
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '20px' },
    actionRow: { display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }
};

export default ListModal;