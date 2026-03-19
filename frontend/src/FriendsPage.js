import React from 'react'
import { SampleFriendList } from ''

function FriendsPages() {
  const bookFreinds = [
    "Zendaya"
    "Tom Holland"
    "Robert Downey Jr"
    "Chris Evans"

  const [friends, setFriends] = useState(bookFriends);

  //If you want to remove someone as a friend
  const removeFriend = 
  ])
  const addFriend = () => {
    if (newFriend.trim() == "") return;
    setFriends([...friends, newFriend];
    setNewFriend("");
  };
  
