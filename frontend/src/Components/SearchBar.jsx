import { useState, useEffect, useRef } from 'react';
import { searchDatabase } from '../Services/searchService';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('title');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // --- DEBOUNCED DROPDOWN SEARCH ---
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (query.trim().length > 1) {
                let data = await searchDatabase(query, type);

                if (type === 'users') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) data = data.filter(u => u.id !== user.id);
                    data.sort((a, b) => a.username.localeCompare(b.username));
                } else {
                    // Relevance Sorting Logic
                    const q = query.toLowerCase().trim();
                    data = (data || []).sort((a, b) => {
                        const aVal = (type === 'title' ? a.book_title : a.book_author).toLowerCase();
                        const bVal = (type === 'title' ? b.book_title : b.book_author).toLowerCase();

                        if (aVal === q && bVal !== q) return -1;
                        if (bVal === q && aVal !== q) return 1;
                        if (aVal.startsWith(q) && !bVal.startsWith(q)) return -1;
                        if (bVal.startsWith(q) && !aVal.startsWith(q)) return 1;
                        return aVal.localeCompare(bVal);
                    });
                }

                setResults(data.slice(0, 8)); // Top 8 relevant for dropdown
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [query, type]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- FULL SEARCH SUBMISSION ---
    const triggerFullSearch = (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setShowDropdown(false);
        // Navigate to your existing Search Results page
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    const handleSelect = (item) => {
        setShowDropdown(false);
        setQuery('');
        if (type === 'users') {
            navigate(`/profile/${item.id}`);
        } else {
            navigate(`/book/${item.isbn}`, { state: { book: item } });
        }
    };

    return (
        <div ref={searchRef} style={styles.container}>
            <form onSubmit={triggerFullSearch} style={styles.searchForm}>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    style={styles.select}
                >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="users">Users</option>
                </select>

                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        placeholder={`Search ${type}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setShowDropdown(true)}
                        style={styles.input}
                    />

                    {/* RELEVANCE DROPDOWN */}
                    {showDropdown && results.length > 0 && (
                        <div style={styles.dropdown}>
                            {results.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    onClick={() => handleSelect(item)}
                                    style={styles.resultItem}
                                >
                                    {type === "users" ? (
                                        <span>{item.username}</span>
                                    ) : (
                                        <>
                                            <strong>{item.book_title}</strong>
                                            <span style={{ fontSize: "12px", color: "#777" }}>by {item.book_author}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" style={styles.submitBtn}>
                    Search
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { width: "100%", maxWidth: "600px" },
    searchForm: { display: 'flex', gap: '8px', alignItems: 'stretch' },
    input: { 
        width: "100%", padding: "12px", borderRadius: "8px", 
        border: "1px solid #ddd", fontSize: "15px", boxSizing: 'border-box' 
    },
    select: { 
        padding: "0 12px", borderRadius: "8px", border: "1px solid #ddd", 
        background: "#fff", cursor: "pointer", fontSize: '14px' 
    },
    submitBtn: { 
        padding: "0 20px", borderRadius: "8px", border: "none", 
        background: "#333", color: "#fff", fontWeight: "bold", 
        cursor: "pointer", transition: '0.2s' 
    },
    dropdown: {
        position: "absolute", top: "105%", left: 0, right: 0,
        backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 1000,
        maxHeight: "300px", overflowY: "auto"
    },
    resultItem: { 
        padding: "12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0",
        display: "flex", flexDirection: "column", transition: 'background 0.2s'
    }
};

export default SearchBar;