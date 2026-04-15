import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabaseClient';

export const SHELVES = [
  {
    slug: 'to-read',
    label: 'To Read',
    description: 'Books you plan to read in the future.',
  },
  {
    slug: 'currently-reading',
    label: 'Currently Reading',
    description: 'Books you are actively reading right now.',
  },
  {
    slug: 'read',
    label: 'Read',
    description: 'Books you have finished reading.',
  },
];

/**
 * Reusable shelves manager UI.
 *
 * Can be rendered as a full page, or embedded in another page
 * (for example, a user profile/personal account page).
 */
function ShelvesManager({
  title = 'My Shelves',
  onRequireLogin,
  onBack,
  showBackButton = true,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Reader');
  const [entries, setEntries] = useState([]);
  const [savingEntryId, setSavingEntryId] = useState(null);
  const [activeShelf, setActiveShelf] = useState('all');

  // Defaults keep the component usable directly as a route element with no wrappers.
  const handleBack = onBack || (() => navigate('/dashboard'));

  useEffect(() => {
    const loadShelves = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (onRequireLogin) onRequireLogin();
        else navigate('/');
        return;
      }

      const profileResponse = await supabase
        .from('Profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (!profileResponse.error && profileResponse.data?.username) {
        setUsername(profileResponse.data.username);
      } else {
        setUsername(user.email || 'Reader');
      }

      const shelvesResponse = await supabase
        .from('UserBookShelves')
        .select(`
          id,
          user_id,
          book_id,
          shelf_slug,
          created_at,
          updated_at,
          book:Books (
            id,
            book_title,
            book_author,
            isbn,
            image_url_m
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!shelvesResponse.error && Array.isArray(shelvesResponse.data)) {
        setEntries(shelvesResponse.data);
      } else {
        setEntries([]);
      }

      setLoading(false);
    };

    loadShelves();
  }, [navigate, onRequireLogin]);

  const grouped = useMemo(() => {
    return SHELVES.reduce((acc, shelf) => {
      acc[shelf.slug] = entries.filter((entry) => entry.shelf_slug === shelf.slug);
      return acc;
    }, {});
  }, [entries]);

  const visibleShelves = activeShelf === 'all'
    ? SHELVES
    : SHELVES.filter((shelf) => shelf.slug === activeShelf);

  const handleMove = async (entryId, nextShelf) => {
    setSavingEntryId(entryId);

    const { error } = await supabase
      .from('UserBookShelves')
      .update({ shelf_slug: nextShelf, updated_at: new Date().toISOString() })
      .eq('id', entryId);

    if (!error) {
      setEntries((prev) => prev.map((entry) => (
        entry.id === entryId ? { ...entry, shelf_slug: nextShelf } : entry
      )));
    }

    setSavingEntryId(null);
  };

  const handleRemove = async (entryId) => {
    setSavingEntryId(entryId);

    const { error } = await supabase
      .from('UserBookShelves')
      .delete()
      .eq('id', entryId);

    if (!error) {
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    }

    setSavingEntryId(null);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading your shelves...</div>;
  }

  const totalBooks = entries.length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.subtitle}>Welcome, <strong>{username}</strong>.</p>
        </div>
        {showBackButton && (
          <button style={styles.buttonSecondary} onClick={handleBack}>
            Back to Dashboard
          </button>
        )}
      </header>

      <div style={styles.summaryRow}>
        <span style={styles.summaryPill}>Total books: {totalBooks}</span>
        {SHELVES.map((shelf) => (
          <button
            key={shelf.slug}
            onClick={() => setActiveShelf(shelf.slug)}
            style={{
              ...styles.filterButton,
              ...(activeShelf === shelf.slug ? styles.filterButtonActive : {}),
            }}
          >
            {shelf.label} ({(grouped[shelf.slug] || []).length})
          </button>
        ))}
        <button
          onClick={() => setActiveShelf('all')}
          style={{
            ...styles.filterButton,
            ...(activeShelf === 'all' ? styles.filterButtonActive : {}),
          }}
        >
          All
        </button>
      </div>

      <section style={styles.grid}>
        {visibleShelves.map((shelf) => (
          <article key={shelf.slug} style={styles.column}>
            <h3 style={styles.columnTitle}>{shelf.label}</h3>
            <p style={styles.columnDescription}>{shelf.description}</p>

            {(grouped[shelf.slug] || []).length === 0 ? (
              <p style={styles.emptyText}>No books in this shelf yet.</p>
            ) : (
              <div style={styles.list}>
                {(grouped[shelf.slug] || []).map((entry) => (
                  <div key={entry.id} style={styles.bookCard}>
                    <div style={styles.bookTopRow}>
                      <img
                        src={entry.book?.image_url_m || 'https://via.placeholder.com/54x78?text=Book'}
                        alt={entry.book?.book_title || 'Book cover'}
                        style={styles.cover}
                      />
                      <div>
                        <h4 style={styles.bookTitle}>{entry.book?.book_title || 'Untitled book'}</h4>
                        <p style={styles.bookMeta}>{entry.book?.book_author || 'Unknown author'}</p>
                        {entry.book?.isbn && <p style={styles.bookMeta}>ISBN: {entry.book.isbn}</p>}
                      </div>
                    </div>

                    <div style={styles.actionsRow}>
                      <select
                        value={entry.shelf_slug}
                        onChange={(e) => handleMove(entry.id, e.target.value)}
                        disabled={savingEntryId === entry.id}
                        style={styles.select}
                      >
                        {SHELVES.map((option) => (
                          <option key={option.slug} value={option.slug}>
                            Move to: {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemove(entry.id)}
                        disabled={savingEntryId === entry.id}
                        style={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #ddd',
    paddingBottom: '12px',
    gap: '16px',
  },
  title: {
    margin: 0,
  },
  subtitle: {
    marginTop: '8px',
    color: '#555',
  },
  summaryRow: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  summaryPill: {
    background: '#f2f2f2',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '13px',
  },
  filterButton: {
    border: '1px solid #cfcfcf',
    background: '#fff',
    color: '#333',
    borderRadius: '999px',
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  filterButtonActive: {
    borderColor: '#4f46e5',
    color: '#4f46e5',
    background: '#eef0ff',
  },
  grid: {
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '14px',
  },
  column: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '14px',
    background: '#fff',
    minHeight: '220px',
  },
  columnTitle: {
    margin: 0,
  },
  columnDescription: {
    marginTop: '6px',
    marginBottom: '12px',
    color: '#444',
  },
  emptyText: {
    marginTop: '8px',
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bookCard: {
    border: '1px solid #ececec',
    borderRadius: '8px',
    padding: '10px',
    background: '#fafafa',
  },
  bookTopRow: {
    display: 'flex',
    gap: '10px',
  },
  cover: {
    width: '54px',
    height: '78px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  bookTitle: {
    margin: '0 0 4px',
    fontSize: '15px',
  },
  bookMeta: {
    margin: 0,
    color: '#666',
    fontSize: '13px',
  },
  actionsRow: {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  select: {
    flex: 1,
    minWidth: 0,
    padding: '7px 8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    background: '#fff',
  },
  removeButton: {
    border: '1px solid #d35757',
    color: '#a83a3a',
    background: '#fff6f6',
    borderRadius: '6px',
    padding: '7px 10px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    border: '1px solid #bbb',
    background: '#fff',
    color: '#333',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
};

export default ShelvesManager;