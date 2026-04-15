import React, { useState } from 'react';
// import { supabase } from '../Services/supabaseClient'; // Unused in this snippet
import { useNavigate } from 'react-router-dom';

const FEATURED_BOOKS = [
  {
    id: 1,
    title: "The Hate U Give",
    author: "Angie Thomas",
    genre: "Young Adult",
    cover: "https://via.placeholder.com/200x250?text=The+Hate+U+Give"
  },
  {
    id: 2,
    title: "Of Mice and Men",
    author: "John Steinbeck",
    genre: "Fiction/Tragedy",
    cover: "https://via.placeholder.com/200x250?text=Of+Mice+And+Men"
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction/Tragedy/Romance",
    cover: "https://via.placeholder.com/200x250?text=The+Great+Gatsby"
  },
  {
    id: 4,
    title: "The Hunger Games",
    author: "Suzanne Collins",
    genre: "Young Adult",
    cover: "https://via.placeholder.com/200x250?text=The+Hunger+Games"
  },
  {
    id: 5,
    title: "The Lightning Thief",
    author: "Rick Riordan",
    genre: "Fantasy",
    cover: "https://via.placeholder.com/200x250?text=Percy+Jackson"
  },
  {
    id: 6,
    title: "Sea of Monsters",
    author: "Rick Riordan",
    genre: "Fantasy",
    cover: "https://via.placeholder.com/200x250?text=Sea+of+Monsters"
  },
  {
    id: 7,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    cover: "https://via.placeholder.com/200x250?text=Mockingbird"
  }, // Added missing comma here
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Novel, Drama, Quest", // Fixed typo "genere"
    cover: "https://via.placeholder.com/200x250?text=The+Alchemist"
  }
];

const MainPage = () => {
  const [books] = useState(FEATURED_BOOKS);
  const navigate = useNavigate();

  const handleBookClick = (id) => {
    navigate(`/book/${id}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}> {/* Added missing opening tag */}
        <h2>LAMAS BOOK REVIEW</h2>
        <h1>BookStore</h1>
        <p>Discover your next favorite story.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Books</h2>
        <div style={styles.grid}>
          {books.map((book) => (
            <div 
              key={book.id} 
              style={styles.card} 
              onClick={() => handleBookClick(book.id)}
            >
              <img src={book.cover} alt={book.title} style={styles.image} />
              <div style={styles.info}>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                <p style={styles.author}>{book.author}</p>
                <p style={styles.genre}>{book.genre}</p>
                <button style={styles.button}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' },
  section: { padding: '10px' },
  sectionTitle: { marginBottom: '20px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' },
  image: { width: '100%', height: '250px', objectFit: 'cover' },
  info: { padding: '15px' },
  bookTitle: { fontSize: '1.1rem', margin: '10px 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  author: { color: '#666', fontSize: '0.9rem', marginBottom: '5px' },
  genre: { fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' },
  button: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }
};

export default MainPage;