import React from "react";

const UserReviewCard = ({ bookTitle, author, coverImg, reviewText }) => {
    return (
        <div style={{ 
            display: 'flex', 
            gap: '20px', 
            padding: '15px', 
            borderBottom: '1px solid #eee', 
            width: '100%', 
            boxSizing: 'border-box' 
        }}>
        <img 
            src={coverImg || 'https://via.placeholder.com/100x150'} 
            alt={bookTitle} 
            style={{ width: '100px', height: '145px', objectFit: 'cover', borderRadius: '4px' }} 
        />
        <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0' }}>{bookTitle}</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px 0' }}>by {author}</p>
            <div style={{ 
                fontSize: '14px', 
                lineHeight: '1.6', 
                padding: '10px', 
                backgroundColor: '#fafafa', 
                borderRadius: '4px' 
            }}>
            {reviewText || "User description placeholder..."}
            </div>
        </div>
        </div>
    );
};

export default UserReviewCard;