import { useState } from 'react';
import '../../Styles/variables.css';
import '../../Styles/Components/BookCard.css';

const BookCard = ({ book }) => {
    const [imgFailed, setImgFailed] = useState(false);

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
