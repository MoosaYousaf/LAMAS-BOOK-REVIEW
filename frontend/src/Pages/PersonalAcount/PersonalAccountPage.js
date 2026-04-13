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
        </div>
    );

    return (

    );
}

export default PersonalAccountPage;

