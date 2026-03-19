import React from 'react'
import { SampleFriendList } from ''

function FriendsPages() {
  const [friends, setFriends] = useState([
    "Seth"
    "Lior"
    "Awaadh"
    "Arshan"
    "Moosa"
    "Avash"
  ])
  const addFriend = () => {
    if (newFriend.trim() == "") return;
    setFriends([...friends, newFriend];
    setNewFriend("");
  };
  
