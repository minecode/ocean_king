import React, { useEffect, useState, useRef } from 'react';
import { View, Platform, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../style';
import { post, get } from '../../services/api';

import ADMobBanner from '../Components/ADMobBanner';
import Version from '../Components/Version';
import Title from '../Components/Title';
import Error from '../Components/Error';
import Logo from '../Components/Logo';
import Button from '../Components/Button';
import CreatedBy from '../Components/CreatedBy';

import { getUser } from '../../utils';

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
	  shouldShowAlert: true,
	  shouldPlaySound: false,
	  shouldSetBadge: false,
	}),
  });
  

export default function HomeScreen(props) {
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);
	const [error, setError] = useState(false);
	const [notification, setNotfication] = useState(false);
	const [expoPushToken, setExpoPushToken] = useState('');

	const notificationListener = useRef();
	const responseListener = useRef();

	const { navigate, reset } = props.navigation;

	useEffect(() => {
		if (expoPushToken !== null && user !== null) {
			post('/auth/pn/', {
				user: user,
				token: expoPushToken,
			})
				.then((response) => {
					setError(null);
				})
				.catch((error) => {
					setError(
						'Ocorreu um erro. Por favor, tente novamente mais tarde.'
					);
				});
		}
	}, [expoPushToken, user]);

	async function getLocalUser() {
		const { user, username } = await getUser(reset, true);
		setUser(user);
		setUsername(username);
	}

	useEffect(() => {
		getLocalUser();

		registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
	
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
		  setNotfication(notification);
		});
	
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
		//   console.log(response);
		});
	
		return () => {
		  Notifications.removeNotificationSubscription(notificationListener.current);
		  Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	useEffect(() => {
		if (user != null && username != null) {
			inGame();
		}
	}, [user, username]);

	async function inGame() {
		await get('/game/inGame', { user: user })
			.then(async (response) => {
				if (response.data.inGame) {
					reset({
						index: 1,
						routes: [
							{
								name: 'Game',
								params: { game: response.data.game._id },
							},
						],
					});
				}
			})
			.catch((error) => {});
	}

	async function newGame() {
		if (user) {
			await post('/game', { user: user })
				.then(async (response) => {
					reset({
						index: 1,
						routes: [
							{
								name: 'Game',
								params: { game: response.data.game._id },
							},
						],
					});
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			setError('Please, logout and try again');
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ADMobBanner />

			<View style={styles.container}>
				<Logo />
				<Title
					title={username}
					style={{ fontSize: 15, fontWeight: 'normal' }}
				/>
				<Error error={error} />

				<View
					style={[
						styles.row,
						{
							marginHorizontal: 0,
							marginTop: 20,
							justifyContent:
								Platform.OS === 'web'
									? 'center'
									: 'space-between',
						},
					]}
				>
					<Button
						text={'New game'}
						icon={'gamepad'}
						action={() => {
							newGame();
						}}
						firstColor={'#142850'}
						secondColor={'#f1f1f1'}
					/>

					<Button
						text={'Join game'}
						icon={'server'}
						action={() => {
							navigate('Join');
						}}
						firstColor={'#142850'}
						secondColor={'#f1f1f1'}
					/>
				</View>

				<View
					style={[
						styles.row,
						{
							marginHorizontal: 0,
							// marginTop: 20,
							justifyContent:
								Platform.OS === 'web'
									? 'center'
									: 'space-between',
						},
					]}
				>
					<Button
						text={'Scoreboards'}
						icon={'list'}
						action={() => {
							navigate('Scoreboards');
						}}
						firstColor={'#27496d'}
						secondColor={'#f1f1f1'}
					/>

					<Button
						text={'Options'}
						icon={'cogs'}
						action={() => {
							navigate('Settings');
						}}
						firstColor={'#27496d'}
						secondColor={'#f1f1f1'}
					/>
				</View>

				<CreatedBy />
			</View>

			<Version />
		</SafeAreaView>
	);
}

async function registerForPushNotificationsAsync() {
    let token;
	if (Constants.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
		}
		if (finalStatus !== 'granted') {
		alert('Failed to get push token for push notification!');
		return;
		}
		token = (await Notifications.getExpoPushTokenAsync()).data;
	} else {
		alert('Must use physical device for Push Notifications');
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
		name: 'default',
		importance: Notifications.AndroidImportance.MAX,
		vibrationPattern: [0, 250, 250, 250],
		lightColor: '#FF231F7C',
		});
	}

	return token;
}
