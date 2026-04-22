// ShelvesManager — renders a user's complete shelf section on their profile page.
// Displays up to 3 custom shelves (CustomShelfCard) and a grid of recently shelved books.
//
// The app enforces a maximum of 3 custom shelves per user. To always render a full
// row of 3 cards even when the user has fewer shelves, placeholder slots are padded
// in with `isPlaceholder: true`. Owners see a '+' on placeholders to create a new shelf;
// visitors see an empty slot with no action.
//
// Props:
//   targetUserId  — the profile owner's ID (may differ from the logged-in user)
//   isOwnProfile  — controls whether create/edit shelf actions are visible
//   canViewContent — false for private profiles the viewer doesn't follow; hides all content

import { useEffect, useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import CustomShelfCard from './CustomShelfCard';
import ListModal from './ListModal';
import '../../Styles/variables.css';
import '../../Styles/Components/ShelvesManager.css';

function ShelvesManager({ targetUserId, isOwnProfile, canViewContent }) {
    const [standardEntries, setStandardEntries] = useState([]);
    const [customLists, setCustomLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (canViewContent && targetUserId) loadAllData();
    }, [targetUserId, canViewContent]);

    const loadAllData = async () => {
        setLoading(true);
        const [standardRes, customRes] = await Promise.all([
            supabase.from('UserBookShelves').select('*, book:Books(*)').eq('user_id', targetUserId),
            supabase.from('UserLists').select('*, ListEntries(isbn, Books(*))').eq('user_id', targetUserId).order('created_at', { ascending: true })
        ]);
        setStandardEntries(standardRes.data || []);
        setCustomLists(customRes.data || []);
        setLoading(false);
    };

    const handleOpenModal = (list = null) => {
        if (!isOwnProfile && !list) return;
        setSelectedList(list);
        setIsModalOpen(true);
    };

    // Pad with placeholder objects so there are always exactly 3 shelf slots shown
    const customSlots = [...customLists];
    while (customSlots.length < 3) customSlots.push({ isPlaceholder: true });

    if (loading) return (
        <div className="state-empty">
            <p>Loading shelves...</p>
        </div>
    );

    return (
        <div className="shelves-wrap">
            <div style={{ marginBottom: '36px' }}>
                <p className="section-title">Custom Shelves</p>
                <div className="shelves-custom-grid">
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

            {standardEntries.length > 0 && (
                <>
                    <p className="section-title">Recent Books</p>
                    <div className="shelves-book-grid">
                        {standardEntries.map(entry => (
                            <div key={entry.id} className="shelves-mini-book">
                                <img
                                    src={entry.book?.image_url_m}
                                    alt=""
                                    className="shelves-mini-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <p className="shelves-mini-title">{entry.book?.book_title}</p>
                                    <span className="shelves-mini-tag">{entry.shelf_slug?.replace('-', ' ')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

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

export default ShelvesManager;
