import { useState, useEffect, useRef } from 'react';
import { searchDatabase } from '../Services/searchService';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MdPersonSearch, MdSearch } from 'react-icons/md';
import '../Styles/variables.css';
import '../Styles/Components/SearchBar.css';

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('title');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (query.trim().length > 1) {
                let data = await searchDatabase(query, type);
                if (type === 'users') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) data = data.filter(u => u.id !== user.id);
                    data.sort((a, b) => a.username.localeCompare(b.username));
                } else {
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
                setResults(data.slice(0, 8));
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [query, type]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const triggerFullSearch = (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setShowDropdown(false);
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
        <div ref={searchRef} className="searchbar">
            <form onSubmit={triggerFullSearch} className="searchbar__form">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="searchbar__select"
                >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="users">Users</option>
                </select>

                <input
                    type="text"
                    placeholder={`Search ${type}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setShowDropdown(true)}
                    className="searchbar__input"
                />

                <div className="searchbar__actions">
                    <button type="button" className="searchbar__icon-btn" title="Search users">
                        <MdPersonSearch />
                    </button>
                    <button type="submit" className="searchbar__icon-btn" title="Search">
                        <MdSearch />
                    </button>
                </div>
            </form>

            {showDropdown && results.length > 0 && (
                <div className="searchbar__dropdown">
                    {results.map((item, index) => (
                        <div
                            key={item.id || index}
                            onClick={() => handleSelect(item)}
                            className="searchbar__result-item"
                        >
                            {type === 'users' ? (
                                <span className="searchbar__result-title">{item.username}</span>
                            ) : (
                                <>
                                    <span className="searchbar__result-title">{item.book_title}</span>
                                    <span className="searchbar__result-sub">by {item.book_author}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
