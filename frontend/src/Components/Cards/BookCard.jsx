const BookCard = ({ book }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        width: '200px',
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
        <img
            src={book.image_url_m || 'https://via.placeholder.com/150x200?text=No+Image'}
            alt={book.book_title}
            style={{width: '100%', height: '200px', objectFit: 'cover', margin: '10px'}}
        />

        <h4 style={{ margin: '10px 0 5px', fontSize: '16px' }}>{book.book_title}</h4>
        <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>{book.book_author}</p>
        <p style={{ fontSize: '12px', color: '#999' }}> ISBN: {book.isbn}</p>
    </div>
);

export default BookCard;