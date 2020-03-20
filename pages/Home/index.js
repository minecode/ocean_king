import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	Text,
	Dimensions,
	Linking,
	Platform
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal');
}
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import styles from '../../style';
import { post, get, put, remove } from '../../services/api';
import store from '../../store';
import { Image } from 'react-native-elements';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

export default function HomeScreen(props) {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);
	const { height, width } = Dimensions.get('window');

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

	const onRefresh = () => {
		setRefreshing(true);
		getPurchases();
		setRefreshing(false);
	};

	useEffect(() => {
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}

		getUser();
	}, []);

	useEffect(() => {
		if (user != null && username != null) {
			inGame();
		}
	}, [user, username]);

	async function inGame() {
		await get('/game/inGame', { user: user })
			.then(async response => {
				setLoading(false);
				if (response.data.inGame) {
					reset({
						index: 1,
						routes: [
							{
								name: 'Game',
								params: { game: response.data.game._id }
							}
						]
					});
				}
			})
			.catch(error => {
				setLoading(false);
			});
	}

	async function newGame() {
		await post('/game', { user: user })
			.then(async response => {
				setLoading(false);
				reset({
					index: 1,
					routes: [
						{
							name: 'Game',
							params: { game: response.data.game._id }
						}
					]
				});
			})
			.catch(error => {
				console.log(error);
				setLoading(false);
			});
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			{Platform.OS !== 'web' && (
				<AdMobBanner
					bannerSize='fullBanner'
					adUnitID='ca-app-pub-7606799175531903/7143162423' // Test ID, Replace with your-admob-unit-id
					servePersonalizedAds // true or false
					bannerSize={'smartBannerLandscape'}
				/>
			)}

			<View style={styles.container}>
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<Image
						source={require('../../assets/ocean_king.png')}
						style={{
							width: 100,
							height: 100
						}}
						placeholderStyle={{
							backgroundColor: 'transparent'
						}}
					/>
				</View>
				<View
					style={[styles.row, { marginHorizontal: 0, marginTop: 20 }]}
				>
					<TouchableOpacity
						style={{
							backgroundColor: '#142850',
							height: 50,
							width: (width - 30) / 2,
							borderRadius: 25,
							marginLeft: 10,
							marginRight: 5,
							marginVertical: 10,
							alignItems: 'center',
							justifyContent: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5,
							flexDirection: 'row'
						}}
						onPress={async () => {
							await newGame();
						}}
					>
						<Icon
							name='gamepad'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold'
							}}
						>
							New game
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							backgroundColor: '#27496d',
							height: 50,
							width: (width - 30) / 2,
							borderRadius: 25,
							marginLeft: 5,
							marginRight: 10,
							marginVertical: 10,
							alignItems: 'center',
							justifyContent: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5,
							flexDirection: 'row'
						}}
						onPress={() => {
							navigate('Join');
						}}
					>
						<Icon
							name='server'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold'
							}}
						>
							Join game
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 0,
							marginTop: 20,
							justifyContent: 'center'
						}
					]}
				>
					<TouchableOpacity
						style={{
							backgroundColor: '#142850',
							height: 50,
							width: width - 30,
							borderRadius: 25,
							marginLeft: 5,
							marginRight: 5,
							marginVertical: 10,
							alignItems: 'center',
							justifyContent: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5,
							flexDirection: 'row'
						}}
						onPress={async () => {
							if (Platform.OS !== 'web') {
								await AsyncStorage.removeItem(
									'@ocean_king:user'
								);
								await AsyncStorage.removeItem(
									'@ocean_king:username'
								);
							} else {
								localStorage.removeItem('@ocean_king:user');
								localStorage.removeItem('@ocean_king:username');
							}

							reset({
								index: 1,
								routes: [{ name: 'Login' }]
							});
						}}
					>
						<Icon
							name='sign-out'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold'
							}}
						>
							Logout
						</Text>
					</TouchableOpacity>
				</View>
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<TouchableOpacity
						onPress={() => {
							Linking.openURL('https://github.com/fabiohfab');
						}}
					>
						<Text style={{ color: '#f1f1f1' }}>
							Created by Fábio Henriques
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{loading && (
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
					]}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<ActivityIndicator size='large' color='#f1f1f1' />
						<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}
