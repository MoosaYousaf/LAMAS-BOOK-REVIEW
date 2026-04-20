import React from "react";

/**
 * Enhanced Review Card for Profile/Lists
 * @param {Object} review - The full review object including joined Books data
 * @param {function} onClick - Triggered to open the Detail Modal
 */
const UserReviewCard = ({ review, onClick }) => {
    // Destructure data from the Supabase join structure
    const { Books, review_comment, rating, created_at } = review;
    const truncatedText = review_comment?.length > 180 
        ? review_comment.substring(0, 180) + "..." 
        : review_comment;
        
    return (
        <div onClick={() => onClick(review)} style={styles.card}>
            <img 
                src={Books?.book_cover_url || 'https://via.placeholder.com/100x150'} 
                alt="cover" 
                style={styles.coverImg} 
            />
            <div style={{ flex: 1 }}>
                <div style={styles.headerRow}>
                    <h3 style={styles.title}>{Books?.book_title || "Unknown Title"}</h3>
                    <span style={styles.date}>{new Date(created_at).toLocaleDateString()}</span>
                </div>
                <p style={styles.author}>by {Books?.book_author || "Unknown Author"}</p>
                <div style={styles.rating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < rating ? '#d4a017' : '#e0e0e0' }}>★</span>
                    ))}
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#888' }}>({rating}/5)</span>
                </div>
                <div style={styles.textBox}>
                    {truncatedText || "No content provided."}
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: { 
        display: 'flex', 
        gap: '20px', 
        padding: '20px', 
        backgroundColor: '#fff',
        border: '1px solid #eee',
        borderRadius: '12px',
        width: '100%', 
        boxSizing: 'border-box', 
        cursor: 'pointer', 
        transition: 'transform 0.1s, box-shadow 0.1s',
        marginBottom: '10px'
    },
    coverImg: { width: '90px', height: '135px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { margin: '0 0 4px 0', fontSize: '18px', color: '#222' },
    date: { fontSize: '12px', color: '#999' },
    author: { fontSize: '14px', color: '#666', margin: '0 0 8px 0' },
    rating: { fontSize: '16px', marginBottom: '10px' },
    textBox: { 
        fontSize: '14px', 
        lineHeight: '1.6', 
        padding: '12px', 
        backgroundColor: '#fcfcfc', 
        border: '1px solid #f0f0f0',
        borderRadius: '8px', 
        color: '#444',
        fontStyle: content => !content ? 'italic' : 'normal'
    }
};

export default UserReviewCard;