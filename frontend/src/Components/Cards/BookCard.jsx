// BookCard — displays a single book with its cover image, title, author, and ISBN.
// Used in the Dashboard explore grid and inside ListModal for shelf contents.
// Prefers the medium cover (image_url_m) and falls back to large (image_url_l).
// If the image fails to load, a "No Cover" placeholder is shown instead.

import { useState } from 'react';
import '../../Styles/variables.css';
import '../../Styles/Components/BookCard.css';

const BookCard = ({ book }) => {
    const [imgFailed, setImgFailed] = useState(false);

    // Prefer medium cover for faster load; fall back to large if medium is missing
    const primarySrc = book.image_url_m || book.image_url_l;

    return (
        <div className="book-card">
            <div className="book-card__cover-wrap">
                {!imgFailed && primarySrc ? (
                    <img
                        src={primarySrc}
                        alt={book.book_title}
                        className="book-card__cover"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className="book-card__cover-fallback">
                        <span className="book-card__cover-fallback-icon">📖</span>
                        <span className="book-card__cover-fallback-text">No Cover</span>
                    </div>
                )}
            </div>
            <div className="book-card__info">
                <h4 className="book-card__title">{book.book_title}</h4>
                <p className="book-card__author">{book.book_author}</p>
                <div className="book-card__meta">
                    <span className="book-card__isbn">{book.isbn}</span>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
