import React, { useEffect, useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import CustomShelfCard from './CustomShelfCard';
import ListModal from './ListModal';

function ShelvesManager({ targetUserId, isOwnProfile, canViewContent }) {
  const [standardEntries, setStandardEntries] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (canViewContent && targetUserId) {
      loadAllData();
    }
  }, [targetUserId, canViewContent]);

  const loadAllData = async () => {
    setLoading(true);
    const { data: standard } = await supabase
      .from('UserBookShelves')
      .select(`*, book:Books(*)`)
      .eq('user_id', targetUserId);

    const { data: custom } = await supabase
      .from('UserLists')
      .select(`*, ListEntries(isbn, Books(*))`)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true });

    setStandardEntries(standard || []);
    setCustomLists(custom || []);
    setLoading(false);
  };

  const handleOpenModal = (list = null) => {
    if (!isOwnProfile && !list) return;
    setSelectedList(list);
    setIsModalOpen(true);
  };

  const customSlots = [...customLists];
  while (customSlots.length < 3) {
    customSlots.push({ isPlaceholder: true });
  }

  if (loading) return <div style={{ textAlign: 'left', padding: '20px' }}>Loading Shelves...</div>;

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '40px' }}>
        <h3 style={styles.sectionTitle}>Custom Shelves</h3>
        <div style={styles.customGrid}>
          {customSlots.map((list, idx) => (
            <CustomShelfCard 
              key={list.id || `slot-${idx}`}
              list={list}
              isOwnProfile={isOwnProfile}
              onClick={() => handleOpenModal(list.isPlaceholder ? null : list)}
            />
          ))}
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Recent Books</h3>
      <div style={styles.bookGrid}>
        {standardEntries.map(entry => (
            <div key={entry.id} style={styles.bookCard}>
              <img src={entry.book?.image_url_m} alt="" style={styles.cover} />
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <p style={styles.titleText}>{entry.book?.book_title}</p>
                <span style={styles.shelfTag}>{entry.shelf_slug.replace('-', ' ')}</span>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <ListModal 
          list={selectedList} 
          isOwnProfile={isOwnProfile} 
          onClose={() => { setIsModalOpen(false); loadAllData(); }}
          onUpdate={loadAllData}
        />
      )}
    </div>
  );
}

const styles = {
  container: { width: '100%', textAlign: 'left' },
  customGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#333', textAlign: 'left' },
  bookGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' },
  bookCard: { display: 'flex', gap: '12px', padding: '10px', border: '1px solid #f5f5f5', borderRadius: '8px', alignItems: 'center' },
  cover: { width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' },
  titleText: { fontSize: '13px', fontWeight: '600', margin: '0 0 3px 0' },
  shelfTag: { fontSize: '10px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' },
};

export default ShelvesManager;