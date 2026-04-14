import React, { useState } from 'react';
import SidebarNav from '../Components/SidebarNav';

const FriendPage = () => {
  const [friends, setFriends] = useState([
    { id: 1, name: "Seth" },
    { id: 2, name: "Lior" },
    { id: 3, name: "Awaadh" },
    { id: 4, name: "Arshan" },
    { id: 5, name: "Moosa" },
    { id: 6, name: "Avash" },
  ]);

  const [newFriend, setNewFriend] = useState("");

  // Add a New Friend
  const handleAddFriend = () => {
    if (newFriend.trim() === "") return;
    const nextId = friends.length > 0 ? friends[friends.length - 1].id + 1 : 1;
    setFriends([...friends, { id: nextId, name: newFriend }]);
    setNewFriend("");
  };

  // Remove a friend by id
  const handleRemoveFriend = (id) => {
    setFriends(friends.filter((friend) => friend.id !== id));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav />

      <div style={{ flex: 1, padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
        <h1>My Friends on LAMAS BOOK REVIEW</h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {friends.map((friend) => (
          <li
            key={friend.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <span>{friend.name}</span>
            <button onClick={() => handleRemoveFriend(friend.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Add new friend"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          style={{ padding: "5px", marginRight: "10px", width: "70%" }}
        />
        <button onClick={handleAddFriend}>Add Friend</button>
      </div>
      </div>
    </div>
  );
};

export default FriendPage;
