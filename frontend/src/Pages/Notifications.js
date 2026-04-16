import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../Services/supabaseClient";
import SidebarNav from "../Components/SidebarNav";
import SearchBar from "../Components/SearchBar";
import NotificationRow from "../Components/NavBarComponents/NotificationRow";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoading(false);

        try {
            // Run both follow-related queries in parallel
            const [received, sent] = await Promise.all([
                supabase.from('Followers').select('status, follower_id').eq('following_id', user.id),
                supabase.from('Followers').select('following_id').eq('follower_id', user.id)
            ]);

            if (received.error || !received.data.length) return setNotifications([]);

            const followingIds = new Set(sent.data?.map(f => f.following_id));
            const uniqueFollowers = [...new Set(received.data.map(f => f.follower_id))];

            // Fetch profiles for the names
            const { data: profiles } = await supabase
                .from('Profiles')
                .select('id, username')
                .in('id', uniqueFollowers);

            const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p.username]) || []);

            // Assemble notifications
            setNotifications(received.data.map((f, i) => ({
                id: f.id || i,
                ...f,
                username: profileMap[f.follower_id] || 'Unknown User',
                isAlreadyFollowingBack: followingIds.has(f.follower_id)
            })));

        } catch (err) {
            console.error("Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { 
        fetchNotifications(); 
    }, []);

    const handleSearch = (query, type) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
            <SidebarNav />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* Search Bar centered in its own row - */}
                <header style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #eee' 
                }}>
                    <SearchBar onSearch={handleSearch} />
                </header>

                <main style={{ padding: '20px', maxWidth: '800px', width: '100%', alignSelf: 'center' }}>
                    <h2 style={{ marginBottom: '20px' }}>Notifications</h2>
                    
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        minHeight: '200px'
                    }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                <p>Syncing notifications...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <NotificationRow 
                                    key={n.id} 
                                    notification={n} 
                                    refresh={fetchNotifications} 
                                />
                            ))
                        ) : (
                            /* Explicit empty state box - */
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    No new notifications
                                </p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                                    When people follow you, they'll show up here.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Notifications;