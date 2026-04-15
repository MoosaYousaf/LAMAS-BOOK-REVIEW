import { useState, useEffect, useRef } from 'react';
import { searchDatabase } from '../Services/searchService';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('title');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null); // To detect clicks outside

    // Debounce Search
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (query.trim().length > 1) { // Only search if > 1 char
                let data = await searchDatabase(query, type);

                if (type === 'users') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        data = data.filter(u => u.id !== user.id); // exclude current user
                    }
                }

                setResults(data);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [query, type]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        // Logic for Users
        if (type === "users") {
            if (item.id) {
                navigate(`/profile/${item.id}`)
                setShowDropdown(false);
                setQuery(''); // Clear the search bar after navigation
            }
        } else {
            if (item.isbn) {
                navigate(`/book/${item.isbn}`);
                setShowDropdown(false);
                setQuery(''); // Clear the search bar after navigation
            }
        }
        /*
        // Logic to determine what string to show in the bar after clicking
        let displayValue = "";
        if (type === "users") displayValue = item.username;
        else if (type === "author") displayValue = item.book_author;
        else displayValue = item.book_title;

        setQuery(displayValue);
        setShowDropdown(false);
        onSearch(displayValue, type);
            */
    };

    return (
        /* Fixed typo: position: "relative" is key for the dropdown */
        <div ref={searchRef} style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <form onSubmit={(e) => { e.preventDefault(); onSearch(query, type); }} style={{ display: "flex", gap: "5px" }}>
                {/* 1. Category Selector */}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ padding: "10px", borderRadius: "5px 0 0 5px", border: "1px solid #ccc" }}
                >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="users">Users</option>
                </select>
                {/* 2. Search Input */}
                <input 
                    type="text"
                    placeholder={`Search ${type}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderLeft: "none", outline: "none" }}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                />

                {/* 3. Search Button on the Right */}
                <button 
                    type="submit" 
                    style={{ 
                        padding: "10px 20px", 
                        borderRadius: "0 5px 5px 0", 
                        border: "1px solid #007bff", 
                        backgroundColor: "#007bff", 
                        color: "white", 
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Search
                </button>
            </form>

            {/* Suggestion Dropdown*/}
            {showDropdown && results.length > 0 && (
                <div 
                    style={{
                        position: "absolute",
                        top: "100%", // Exactly below the input
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        zIndex: 1000,
                        maxHeight: "300px",
                        overflowY: "auto"
                    }}
                >
                    {results.map((item, index) => (
                        <div
                            key={item.id || index}
                            onClick={() => handleSelect(item)}
                            style={{ 
                                padding: "10px", 
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                display: "flex",
                                flexDirection: "column"
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#f9f9f9"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                        >
                            {/* Dynamic display logic based on type */}
                            {type === "users" ? (
                                <span>{item.username}</span>
                            ) : (
                                <>
                                    <strong>{item.book_title}</strong>
                                    <span style={{ fontSize: "12px", color: "#777" }}>
                                        by {item.book_author}
                                    </span>
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