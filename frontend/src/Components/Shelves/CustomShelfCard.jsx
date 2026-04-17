import React from 'react';
import BookCard from '../Cards/BookCard';

const CustomShelfCard = ({ list, onClick, isOwnProfile }) => {
    // 1. Render Placeholder Slot (The dashed box with +)
    if (list.isPlaceholder) {
        return (
            <div onClick={onClick} style={styles.placeholder}>
                <span style={styles.plusSign}>{isOwnProfile ? '+' : ''}</span>
            </div>
        );
    }

    // 2. Render Actual Shelf Card
    const previewBooks = list.ListEntries?.slice(0, 3) || []; // Showing up to 3 now since it's a full row

    return (
        <div onClick={onClick} style={styles.card}>
            {/* Top Row: Info */}
            <div style={styles.topRow}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{list.name}</h3>
                    <span style={styles.count}>{list.book_count || 0} books</span>
                </div>
                <p style={styles.desc}>{list.description}</p>
            </div>

            {/* Bottom Row: Books (Aligned Left) */}
            <div style={styles.bookRow}>
                {previewBooks.map((entry) => (
                    <div key={entry.isbn} style={styles.scaledBook}>
                        <BookCard book={entry.Books} />
                    </div>
                ))}
                
                {list.book_count > 3 && (
                    <div style={styles.moreCircle}>
                        +{list.book_count - 3} more
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: { 
        background: '#fff', 
        border: '1px solid #eee', 
        borderRadius: '16px', 
        padding: '24px', 
        cursor: 'pointer', 
        display: 'flex', 
        flexDirection: 'column', // Stack info then books
        gap: '20px',
        transition: '0.2s', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        textAlign: 'left'
    },
    placeholder: { 
        height: '100px', 
        border: '2px dashed #eee', 
        borderRadius: '16px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        cursor: 'pointer',
        marginBottom: '10px'
    },
    plusSign: { color: '#ccc', fontSize: '32px', fontWeight: '300' },
    topRow: { width: '100%' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' },
    title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' },
    count: { fontSize: '12px', color: '#888', background: '#f8f8f8', padding: '4px 12px', borderRadius: '20px', border: '1px solid #efefef' },
    desc: { fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.4' },
    
    // The Row specifically for books
    bookRow: { 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'flex-start',
        alignItems: 'center', 
        width: '100%',
        overflow: 'hidden',
        marginTop: '5px' // Tightened gap between description and books
    },
    
    scaledBook: { 
        transform: 'scale(0.75)', 
        transformOrigin: 'left center', 
        marginRight: '-30px', 
        // REMOVING VERTICAL DEAD SPACE
        marginTop: '-35px',    
        marginBottom: '-35px', 
        pointerEvents: 'none' 
    },

    moreCircle: { 
        padding: '6px 12px',
        borderRadius: '20px', 
        background: '#333', 
        color: '#fff', 
        fontSize: '11px', 
        fontWeight: 'bold',
        marginLeft: '45px', 
        whiteSpace: 'nowrap'
    }
};

export default CustomShelfCard;