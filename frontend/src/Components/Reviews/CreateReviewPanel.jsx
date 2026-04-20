import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';

const initialForm = {
  isbn: '',
  bookTitle: '',
  bookAuthor: '',
  coverUrl: '',
  reviewText: '',
  rating: 5,
};

function CreateReviewPanel({ userId, onReviewCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage('You must be signed in to create a review.');
      return;
    }

    if (!form.isbn || !form.bookTitle || !form.bookAuthor || !form.reviewText.trim()) {
      setMessage('Please fill out ISBN, title, author, and review.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const normalizedIsbn = form.isbn.trim();

      const { data: existingBook } = await supabase
        .from('Books')
        .select('isbn')
        .eq('isbn', normalizedIsbn)
        .maybeSingle();

      if (!existingBook) {
        const { error: bookInsertError } = await supabase.from('Books').insert({
          isbn: normalizedIsbn,
          book_title: form.bookTitle.trim(),
          book_author: form.bookAuthor.trim(),
          image_url_m: form.coverUrl?.trim() || null,
        });

        if (bookInsertError) throw bookInsertError;
      }

      const { error: reviewInsertError } = await supabase.from('Reviews').insert({
        user_id: userId,
        book_id: normalizedIsbn,
        content: form.reviewText.trim(),
        rating: Number(form.rating),
      });

      if (reviewInsertError) throw reviewInsertError;

      setMessage('Review posted successfully.');
      setForm(initialForm);
      if (onReviewCreated) onReviewCreated();
    } catch (error) {
      setMessage(`Unable to create review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <h3 style={{ margin: 0 }}>Create Book Review</h3>
      <p style={{ margin: '4px 0 8px 0', color: '#666', fontSize: '13px' }}>
        Add a book by title, author, and ISBN then write your review.
      </p>

      <div style={styles.row}>
        <input value={form.bookTitle} onChange={(e) => updateField('bookTitle', e.target.value)} placeholder="Book title" style={styles.input} required />
        <input value={form.bookAuthor} onChange={(e) => updateField('bookAuthor', e.target.value)} placeholder="Book author" style={styles.input} required />
      </div>

      <div style={styles.row}>
        <input value={form.isbn} onChange={(e) => updateField('isbn', e.target.value)} placeholder="ISBN" style={styles.input} required />
        <input value={form.coverUrl} onChange={(e) => updateField('coverUrl', e.target.value)} placeholder="Cover image URL (optional)" style={styles.input} />
      </div>

      <div style={styles.row}>
        <select value={form.rating} onChange={(e) => updateField('rating', e.target.value)} style={styles.select}>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>{value} / 5</option>
          ))}
        </select>
      </div>

      <textarea
        value={form.reviewText}
        onChange={(e) => updateField('reviewText', e.target.value)}
        placeholder="Write your review"
        rows={4}
        style={styles.textarea}
        required
      />

      {message && <p style={{ margin: 0, color: message.includes('successfully') ? '#2d7a2d' : '#9b1c1c' }}>{message}</p>}

      <button type="submit" disabled={submitting} style={styles.submitBtn}>
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}

const styles = {
  card: { border: '1px solid #ddd', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { border: '1px solid #ccc', borderRadius: '6px', padding: '10px' },
  select: { maxWidth: '130px', border: '1px solid #ccc', borderRadius: '6px', padding: '10px' },
  textarea: { border: '1px solid #ccc', borderRadius: '6px', padding: '10px', resize: 'vertical' },
  submitBtn: { width: 'fit-content', border: 'none', borderRadius: '18px', padding: '10px 16px', background: '#222', color: '#fff', cursor: 'pointer' },
};

export default CreateReviewPanel;