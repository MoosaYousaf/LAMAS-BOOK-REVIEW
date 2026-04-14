import React, { useEffect, useState } from "react";
import TabSystem from "../../Components/TabSystem";
import { ReviewCard, ListCard } from "../../Components/Cards";

const PersonalAccountPage = () => {
    const [reviews, setReviews] = useState([]);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);

    const ProfileHeader = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
            <img 
                src={user.avatar_url || ''}
                alt="Profile"
                style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            />
            <div>
                <h2>{user.username}</h2>
                <p>{user.bio}</p>
            </div>
            <div>
                <strong>{user.followerCount}</strong> Followers
            </div>
            <div>
                <strong>{user.followingCount}</strong> Following
            </div>
        </div>
    );

    const ReviewsTab = () => (
        <div>
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            <button onClick={() => setPage(p => p + 1)}>Load More</button>
        </div>
    );


    const ListsTab = () => (
        <div>
            <button>Create New List</button>
            {lists.map(l => <ListCard key={l.id} list={l} />)}
        </div>
    );


    // conditional visibility logic
    const canViewContent = user.isPublic || user.isSelf;

    return (
        <div className="profile-page">
            <ProfileHeader />
            
            <hr />

            {canViewContent ? (
                <TabSystem
                    tabs={[
                        { label: 'Reviews', content: <ReviewsTab /> },
                        { label: 'Lists', content: <ListsTab /> }
                    ]}
                />
            ) : (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>This account is private. Follow them to see their reviews and lists.</p>
                </div>
            )}
        </div>
    );
}

export default PersonalAccountPage;

