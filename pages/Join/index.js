import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	Text,
	Dimensions,
	RefreshControl,
	ScrollView,
	AppState,
	Platform
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
}
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import styles from '../../style';
import { post, get, put, remove } from '../../services/api';
import store from '../../store';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

export default function JoinScreen(props) {
	const { height, width } = Dimensions.get('window');
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);
	const [loading, setLoading] = useState(false);
	const [games, setGames] = useState(null);
	const { navigate, reset } = props.navigation;

	async function getUser() {
		let user = null;
		let name = null;
		if (Platform.OS !== 'web') {
			user = await AsyncStorage.getItem('@ocean_king:user', null);
			name = await AsyncStorage.getItem('@ocean_king:username', null);
		} else {
			user = localStorage.getItem('@ocean_king:user', null);
			name = localStorage.getItem('@ocean_king:username', null);
		}
		if (user != null) {
			setUser(user);
			setUsername(name);
		} else {
			reset({ index: 1, routes: [{ name: 'Login' }] });
		}
	}

	async function joinGame(id) {
		await post('/game/join', { user: user, game: id })
			.then(async response => {
				setLoading(false);
				reset({
					index: 1,
					routes: [
						{
							name: 'Game',
							params: { game: id }
						}
					]
				});
			})
			.catch(error => {
				setLoading(false);
			});
	}

	useEffect(() => {
		getUser();
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}
	}, []);

	const handleChange = newState => {
		if (newState === 'active') {
			console.log('!');
			console.log(user, username);
			if (user != null && username != null) {
				getGames();
			}
		}
	};

	useEffect(() => {
		if (user != null && username != null) {
			getGames();
			AppState.addEventListener('change', handleChange);

			return () => {
				AppState.removeEventListener('change', handleChange);
			};
		}
	}, [user, username]);

	async function getGames() {
		await get('/game/', { user: user })
			.then(async response => {
				console.log(response.data);
				setLoading(false);
				if (response.data.games.length !== 0) {
					setGames(response.data.games);
				} else {
					setGames(null);
				}
			})
			.catch(error => {
				console.log(error);
				setLoading(false);
			});
	}

	const onRefresh = () => {
		if (user != null && username != null) {
			getGames();
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			{Platform.OS !== 'web' && (
				<Modal
					isVisible={loading}
					coverScreen={false}
					backdropColor={'#212121'}
					backdropOpacity={0.8}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<ActivityIndicator size='large' color='#f1f1f1' />
						<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
					</View>
				</Modal>
			)}

			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				<View
					style={[
						styles.container,
						{
							justifyContent: 'flex-start',
							marginTop: 0
						}
					]}>
					<View style={styles.row}>
						<Text
							style={{
								fontSize: 30,
								fontWeight: 'bold',
								color: '#f1f1f1'
							}}>
							Games
						</Text>
					</View>
					{games &&
						games.length !== 0 &&
						games.map((g, i) => {
							return (
								<View style={styles.row} key={i}>
									<Text
										style={{
											fontSize: 20,
											color: '#f1f1f1'
										}}>
										{g.createdBy.name}
									</Text>
									<TouchableOpacity
										style={{
											backgroundColor: '#217721',
											height: 30,
											borderRadius: 25,
											marginLeft: 10,
											marginRight: 5,
											marginVertical: 10,
											alignItems: 'center',
											justifyContent: 'center',
											shadowOffset: {
												width: 0,
												height: 1
											},
											shadowOpacity: 0.8,
											shadowRadius: 2,
											elevation: 5,
											flexDirection: 'row'
										}}
										onPress={async () => {
											await joinGame(g._id);
										}}>
										<Icon
											name='sign-out'
											color={'white'}
											type='font-awesome'
											iconStyle={{ marginLeft: 10 }}
											size={15}
										/>
										<Text
											style={{
												color: 'white',
												margin: 10,
												fontWeight: 'bold'
											}}>
											Join game
										</Text>
									</TouchableOpacity>
								</View>
							);
						})}
				</View>
			</ScrollView>
			{Platform.OS === 'web' && loading && (
				<View
					style={[
						{
							width: '100%',
							height: '100%',
							position: 'absolute',
							alignContent: 'center',
							justifyContent: 'center',
							backgroundColor: '#21212180'
						}
					]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<ActivityIndicator size='large' color='#f1f1f1' />
						<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}
