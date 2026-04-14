import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';

/**
 * ShelvesPage
 * ----------
 * Placeholder route for the Goodreads-style "My Shelves" feature.
 *
 * What this page does now:
 * 1) Confirms the user is authenticated.
 * 2) Displays shelf categories and their intended behavior.
 * 3) Documents the next implementation steps in code for contributors.
 *
 * Why this exists:
 * - Gives the app a stable route and UX placeholder for shelf management.
 * - Keeps product momentum while backend schema and interactions are built.
 */
function ShelvesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Reader');

  /**
   * Core shelf definitions for the MVP Goodreads-style experience.
   *
   * `slug` is intentionally DB-friendly so we can reuse it later as the canonical
   * enum/string value in a future `Shelves` or `UserBookShelves` table.
   */
  const SHELF_DEFINITIONS = [
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

  useEffect(() => {
    const loadSession = async () => {
      // Guard route: shelves are only meaningful for authenticated users.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      // Nice-to-have: show username in the placeholder UI when available.
      const { data: profile } = await supabase
        .from('Profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setUsername(profile?.username || user.email || 'Reader');
      setLoading(false);
    };

    loadSession();
  }, [navigate]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading shelves...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2 style={styles.title}>My Shelves</h2>
        <div style={styles.actions}>
          <button style={styles.buttonSecondary} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <p style={styles.subtitle}>
        Welcome, <strong>{username}</strong>. Shelves are scaffolded and ready for data wiring.
      </p>

      <section style={styles.grid}>
        {SHELF_DEFINITIONS.map((shelf) => (
          <article key={shelf.slug} style={styles.card}>
            <h3 style={styles.cardTitle}>{shelf.label}</h3>
            <p style={styles.cardBody}>{shelf.description}</p>
            <p style={styles.badge}>Coming soon</p>
          </article>
        ))}
      </section>

      <section style={styles.notes}>
        <h4>Implementation Notes</h4>
        <ul>
          <li>Create a junction table between users and books for shelf membership.</li>
          <li>Use <code>slug</code> values as canonical shelf identifiers.</li>
          <li>Add actions from search/cards: “Add to shelf” and “Move shelf”.</li>
          <li>Later add per-shelf sorting/filtering and pagination.</li>
        </ul>
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  subtitle: {
    color: '#555',
    marginTop: '14px',
  },
  grid: {
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '14px',
    background: '#fff',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '8px',
  },
  cardBody: {
    margin: 0,
    color: '#444',
    minHeight: '40px',
  },
  badge: {
    marginTop: '12px',
    fontSize: '12px',
    display: 'inline-block',
    backgroundColor: '#f2f2f2',
    borderRadius: '999px',
    padding: '4px 10px',
    color: '#666',
  },
  notes: {
    marginTop: '28px',
    padding: '12px 16px',
    border: '1px dashed #bbb',
    borderRadius: '8px',
    background: '#fcfcfc',
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

export default ShelvesPage;
