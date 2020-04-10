import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';

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

export default function HomeScreen(props) {
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);
	const [error, setError] = useState(false);

	const { navigate, reset } = props.navigation;

	async function getLocalUser() {
		const { user, username } = await getUser(reset, true);
		setUser(user);
		setUsername(username);
	}

	useEffect(() => {
		getLocalUser();
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
					]}>
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
					]}>
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
						text={'Settings'}
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
