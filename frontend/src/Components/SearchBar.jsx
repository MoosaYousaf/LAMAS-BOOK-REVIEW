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

    // [PERF FIX #8] Request ID guard — prevents stale search results from
    // overwriting fresher ones when queries resolve out of order.
    const latestRequestId = useRef(0);

    /**
     * Search effect with debounce and race condition guard.
     *
     * The 300ms debounce reduces network requests during rapid typing.
     * The request ID pattern ensures that if multiple queries are in flight
     * and resolve out of order, only the most recent query's results are
     * displayed. Without this, a slow query A could overwrite a fast query B's
     * correct results, causing the dropdown to show stale/wrong suggestions.
     *
     * How it works:
     * 1. Each search invocation increments latestRequestId.ref
     * 2. The current request captures its ID before the async operation
     * 3. When the async operation completes, it compares its captured ID
     *    against the current latestRequestId.ref
     * 4. If they don't match, a newer query has been initiated and this
     *    result is silently discarded
     */
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (query.trim().length > 1) {
                // [PERF FIX #8] Increment and capture the request ID for this search.
                // This ID will be compared after the async operation completes.
                latestRequestId.current += 1;
                const thisRequestId = latestRequestId.current;

                let data = await searchDatabase(query, type);

                // [PERF FIX #8] Stale response guard — if a newer query has been
                // initiated while this one was in flight, discard these results.
                // This is intentional, not a bug: it prevents race conditions where
                // slow old queries overwrite fast new queries.
                if (thisRequestId !== latestRequestId.current) {
                    return;
                }

                if (type === 'users') {
                    const { data: { user } } = await supabase.auth.getUser();

                    // [PERF FIX #8] Check again after the second async operation
                    if (thisRequestId !== latestRequestId.current) {
                        return;
                    }

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
                <button
                    type="button"
                    onClick={() => {
                        const types = ['title', 'author', 'users'];
                        setType(types[(types.indexOf(type) + 1) % types.length]);
                    }}
                    className="searchbar__type-btn"
                    title="Click to switch search type"
                >
                    {type === 'title' ? 'Title' : type === 'author' ? 'Author' : 'Users'}
                </button>

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
