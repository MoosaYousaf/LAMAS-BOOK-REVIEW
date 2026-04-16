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
function ShelvesManager({ targetUserId, isOwnProfile}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [savingEntryId, setSavingEntryId] = useState(null);
  const [activeShelf, setActiveShelf] = useState('all');

  useEffect(() => {
    const loadShelves = async () => {
      if (!targetUserId) return;

      // Fetch shelves for the specific profile being viewed
      const { data, error } = await supabase
        .from('UserBookShelves')
        .select(`
          id,
          user_id,
          book_id,
          shelf_slug,
          book:Books (
            id,
            book_title,
            book_author,
            isbn,
            image_url_m
          )
        `)
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false });

      if (!error) setEntries(data || []);
      setLoading(false);
    };

    loadShelves();
  }, [targetUserId]);

  const handleMove = async (entryId, nextShelf) => {
    if (!isOwnProfile) return; // Prevent moving if not own profile
    setSavingEntryId(entryId);

    const { error } = await supabase
      .from('UserBookShelves')
      .update({ shelf_slug: nextShelf, updated_at: new Date().toISOString() })
      .eq('id', entryId);

    if (!error) {
      setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, shelf_slug: nextShelf } : e));
    }

    setSavingEntryId(null);
  };

  const handleRemove = async (entryId) => {
    if (!isOwnProfile) return; // Prevent removing if not own profile
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

  const grouped = useMemo(() => {
    return SHELVES.reduce((acc, shelf) => {
      acc[shelf.slug] = entries.filter((entry) => entry.shelf_slug === shelf.slug);
      return acc;
    }, {});
  }, [entries]);


  if (loading) {
    return <div style={{ padding: '20px' }}>Loading your shelves...</div>;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Filter Row */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveShelf('all')}
          style={activeShelf === 'all' ? styles.activeFilter : styles.filter}
        >
          All ({entries.length})
        </button>
        {SHELVES.map(shelf => (
          <button 
            key={shelf.slug}
            onClick={() => setActiveShelf(shelf.slug)}
            style={activeShelf === shelf.slug ? styles.activeFilter : styles.filter}
          >
            {shelf.label} ({(grouped[shelf.slug] || []).length})
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {entries
          .filter(e => activeShelf === 'all' || e.shelf_slug === activeShelf)
          .map(entry => (
            <div key={entry.id} style={styles.bookCard}>
              <img src={entry.book?.image_url_m} alt="cover" style={styles.cover} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px' }}>{entry.book?.book_title}</h4>
                <p style={{ fontSize: '12px', color: '#666' }}>{entry.book?.book_author}</p>
                
                {/* Only show management controls if it's the user's own profile */}
                {isOwnProfile && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    <select 
                      value={entry.shelf_slug} 
                      onChange={(e) => handleMove(entry.id, e.target.value)}
                      style={styles.smallSelect}
                    >
                      {SHELVES.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                    </select>
                    <button onClick={() => handleRemove(entry.id)} style={styles.deleteBtn}>✕</button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
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