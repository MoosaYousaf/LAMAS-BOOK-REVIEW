import React from "react";

const UserReviewCard = ({ review, onClick, friendMode, friendData, isBookDetailPage }) => {
    const { Books, review_comment, rating, created_at } = review;
    
    const truncatedText = review_comment?.length > 180 
        ? review_comment.substring(0, 180) + "..." 
        : review_comment;
        
    return (
        <div onClick={() => onClick(review)} style={styles.card}>
            {/* Conditional Image Rendering: Circle for Book Detail Page, Rectangle for others */}
            <img 
                src={Books?.image_url_m || 'https://via.placeholder.com/100x150'} 
                alt="cover" 
                style={isBookDetailPage ? styles.circlePfp : styles.coverImg} 
            />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={styles.headerRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={styles.title}>{Books?.book_title || "Unknown Title"}</h3>
                        {/* Hide "by Reader" if on the Book Detail Page */}
                        {!isBookDetailPage && (
                            <p style={styles.author}>by {Books?.book_author || "Unknown Author"}</p>
                        )}
                    </div>

                    {friendMode && (
                        <div style={styles.friendBadge}>
                            <div style={styles.friendInfo}>
                                <span style={styles.friendName}>{friendData?.username}</span>
                                <img 
                                    src={friendData?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${friendData?.username}`} 
                                    style={styles.friendPfp} 
                                    alt="pfp" 
                                />
                            </div>
                            <span style={styles.friendDate}>
                                {new Date(created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>

                <div style={styles.rating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < rating ? '#d4a017' : '#e0e0e0', fontSize: '14px' }}>★</span>
                    ))}
                </div>
                
                <p style={styles.textBox}>{truncatedText}</p>
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
        transition: 'all 0.2s ease',
        marginBottom: '15px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        alignItems: 'center' // Ensures circular pfp stays centered relative to text
    },
    coverImg: { width: '80px', height: '120px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 },
    // New Circular Style for Book Detail Page
    circlePfp: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0, border: '1px solid #eee' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
    title: { margin: '0 0 2px 0', fontSize: '17px', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    author: { fontSize: '13px', color: '#777', margin: '0' },
    friendBadge: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginLeft: '10px' },
    friendInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' },
    friendName: { fontSize: '13px', fontWeight: 'bold', color: '#444' },
    friendPfp: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' },
    friendDate: { fontSize: '11px', color: '#999' },
    rating: { marginBottom: '8px' },
    textBox: { fontSize: '14px', lineHeight: '1.5', color: '#444', margin: 0, fontStyle: 'italic' }
};

export default UserReviewCard;