import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post, get } from '../../services/api';
import { getUser } from '../../utils';

export default function FriendsScreen(props) {

  const { navigate, reset } = props.navigation;

  useEffect(() => {
    getLocalUser();
  }, [])

  useEffect(() => {
    if (user && username) {
      getFriends();
      // getUsers();
    }

  }, [user, username])

  async function getLocalUser() {
    const { user, username } = await getUser(reset, true);
    setUser(user);
    setUsername(username);
  }

  const getFriends = async () => {
    await get('/friends', { user: user, status: 'accepted' })
      .then(response => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      })
  }

  const getUsers = async () => {
    await get('/friends', { user: user, status: '!accepted' })
      .then(response => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      })
  }

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
    </SafeAreaView>
  )
}
