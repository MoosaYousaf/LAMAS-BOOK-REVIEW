import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Services/supabaseClient';
import SidebarNav from '../Components/SidebarNav';
import SearchBar from '../Components/SearchBar';
import NotificationRow from '../Components/NavBarComponents/NotificationRow';
import '../Styles/variables.css';
import '../Styles/theme.css';
import '../Styles/Pages/NotificationsPage.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoading(false);

        try {
            const [received, sent] = await Promise.all([
                supabase.from('Followers').select('status, follower_id').eq('following_id', user.id),
                supabase.from('Followers').select('following_id').eq('follower_id', user.id)
            ]);

            if (received.error) throw received.error;

            const followingIds = new Set(sent.data?.map(f => f.following_id) || []);
            const uniqueFollowerIds = [...new Set(received.data.map(f => f.follower_id))];

            const { data: profiles } = await supabase
                .from('Profiles').select('id, username, avatar_url').in('id', uniqueFollowerIds);

            const profileMap = {};
            profiles?.forEach(p => { profileMap[p.id] = p; });

            const assembled = received.data
                .map((f, i) => {
                    const ud = profileMap[f.follower_id];
                    return {
                        id: `${f.follower_id}-${i}`,
                        ...f,
                        username: ud?.username || 'Unknown User',
                        avatar_url: ud?.avatar_url,
                        isAlreadyFollowingBack: followingIds.has(f.follower_id)
                    };
                })
                .filter(n => !(n.status === 'accepted' && n.isAlreadyFollowingBack));

            setNotifications(assembled);
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    return (
        <div className="pg-wrap">
            <div className="pg-bg" />
            <SidebarNav />

            <div className="pg-main">
                <header className="pg-header">
                    <SearchBar onSearch={(q, t) => navigate(`/search?q=${encodeURIComponent(q)}&type=${t}`)} />
                </header>

                <div className="notif-content">
                    <p className="section-title">Notifications</p>

                    <div className="glass notif-panel">
                        {loading ? (
                            <div className="notif-empty"><p>Syncing notifications...</p></div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    refresh={fetchNotifications}
                                    onOpenProfile={(id) => navigate(`/profile/${id}`)}
                                />
                            ))
                        ) : (
                            <div className="notif-empty">
                                <strong>No new notifications</strong>
                                <p>When people follow you, they'll show up here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
