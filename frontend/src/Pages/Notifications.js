import React, { useEffect, useState } from "react";
import { supabase } from "../Services/supabaseClient";
import SidebarNav from "../Components/SidebarNav";
import NotificationRow from "../Components/NavBarComponents/NotificationRow";

const Notifications = () => {

    const[notifications, setNotifications] = useState([]);
    const [isPrivateAccount, setIsPrivateAccount] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data: profile } = await supabase
                .from('Profiles')
                .select('is_private')
                .eq('id', user.id)
                .single();
            
            setIsPrivateAccount(profile?.is_private || false);

            // Fetch People following the current user
            // Join with the 'Profiles' table using the follower_id to get their username
            const { data: followerData } = await supabase
                .from('Followers')
                .select(`
                    id,
                    status,
                    follower_id,
                    Profiles!follower_id (username)
                `)
                .eq('following_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && followerData) {
                const formatted = followerData.map(f => ({
                    follow_row_id: f.id,
                    follower_id: f.follower_id,
                    username: f.Profiles?.username || 'Unknown User',
                    status: f.status
                }));
                setNotifications(formatted);
            };
            setLoading(false);
        };

        fetchNotifications();
    }, []);
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <SidebarNav />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
                    <h2>Notifications</h2>
                </header>

                <main style={{ padding: '20px', maxWidth: '800px', width: '100%', alignSelf: 'center' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <NotificationRow 
                                    key={n.follow_row_id} 
                                    notification={n} 
                                    isPrivateAccount={isPrivateAccount} 
                                />
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                No follower notifications present
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Notifications;