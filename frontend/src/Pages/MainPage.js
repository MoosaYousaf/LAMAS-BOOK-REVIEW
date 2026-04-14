import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const FEATURED_Books = [
  {
    id: 1,
    title: "The Hate U Give",
    author: "Angie Thomas",
    genre: "Young Adult"
  },

  {
    id: 2,
    title: "Mice of Men",
    author: "John Steinbeck",
    genre: "Fiction/Tragedy"
  },

  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction/Tragedy/Romance"
  },

  {
    id: 4,
    title: "The Hunger Games",
    author: "Suzanne Collins",
    genere: "Young Adult"
  },

  {
    id: 5,
    title: "Percy Jackson & The Olympians: The Lightning Thief",
    author: "Rick Riordan",
    genere: "Fantasy"
  },

  {
    id: 6,
    title: "Percy Jackson & The Olympians: The Lightning Thief",
    author: "Rick Riordan",
    genere: "Fantasy"
  },

  {
    id: 7,
    title: "To Kill a Mockingbird",
    author:  "Harper Lee",
    genere: "Fiction"
  }
];

const MainPage = () => {
  const [books] = useState(FEATURED_BOOKS);
  const navigate = useNavigate();

  const handleBookClick = (id) => {
    // Navigate to a dynamic route like /book/1
    navigate(`/book/${id}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
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
                <p style={styles.price}>${book.price.toFixed(2)}</p>
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
  bookTitle: { fontSize: '1.1rem', margin: '10px 0 5px' },
  author: { color: '#666', fontSize: '0.9rem', marginBottom: '5px' },
  genre: { fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' },
  price: { fontWeight: 'bold', color: '#2ecc71', margin: '10px 0' },
  button: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }
};

export default MainPage;
