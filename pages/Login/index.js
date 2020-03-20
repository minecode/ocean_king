import React, { useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	ActivityIndicator,
	Linking,
	Platform
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal');
}
import styles from '../../style';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post, get, put, remove } from '../../services/api';
import { Image } from 'react-native-elements';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

export default function LoginScreen(props) {
	const [loginError, setLoginError] = useState(null);
	const [loginUsernameError, setLoginUsernameError] = useState(null);
	const [loginPasswordError, setLoginPasswordError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState(false);
	const [password, setPassword] = useState(false);

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	async function login() {
		setLoginError(null);
		setLoginPasswordError(null);
		setLoginUsernameError(null);
		setLoading(true);
		await post('/auth/login/', { username: username, password: password })
			.then(async response => {
				if (Platform.OS !== 'web') {
					await AsyncStorage.setItem(
						'@ocean_king:user',
						response.data.user._id
					);
					await AsyncStorage.setItem(
						'@ocean_king:username',
						response.data.user.name
					);
				} else {
					localStorage.setItem(
						'@ocean_king:user',
						response.data.user._id
					);
					localStorage.setItem(
						'@ocean_king:username',
						response.data.user.name
					);
				}

				setLoading(false);
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch(error => {
				setLoading(false);
				console.log(error);
				setLoginError('Authentication fail');
			});
	}

	async function getUser() {
		let user = null;
		if (Platform.OS !== 'web') {
			user = await AsyncStorage.getItem('@ocean_king:user', null);
		} else {
			user = localStorage.getItem('@ocean_king:user', null);
		}

		if (user != null) {
			reset({ index: 1, routes: [{ name: 'Home' }] });
		}
	}

	useEffect(() => {
		getUser();
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}
	}, []);

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

			<View style={styles.container}>
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<Image
						source={require('../../assets/ocean_king.png')}
						style={{
							width: 100,
							height: 100
						}}
						placeholderStyle={{ backgroundColor: 'transparent' }}
					/>
				</View>
				{loginError !== null && (
					<View
						style={[
							styles.row,
							{
								justifyContent: 'center',
								alignItems: 'center'
							}
						]}>
						<Text style={{ color: 'red', textAlign: 'center' }}>
							{loginError}
						</Text>
					</View>
				)}
				<View
					style={[
						styles.row,
						{ justifyContent: 'center', marginVertical: 20 }
					]}>
					<Text
						style={{
							fontSize: 30,
							fontWeight: 'bold',
							color: '#f1f1f1'
						}}>
						Login
					</Text>
				</View>
				<View style={styles.row}>
					<Input
						placeholder='Username'
						onChangeText={text => {
							setUsername(text);
						}}
						errorMessage={loginUsernameError}
						errorStyle={{ color: 'red' }}
						inputStyle={{ color: '#f1f1f1' }}
					/>
				</View>
				<View style={styles.row}>
					<Input
						placeholder='Password'
						secureTextEntry={true}
						onChangeText={text => {
							setPassword(text);
						}}
						errorMessage={loginPasswordError}
						errorStyle={{ color: 'red' }}
						inputStyle={{ color: '#f1f1f1' }}
					/>
				</View>
				<View
					style={[
						styles.row,
						{ marginHorizontal: 0, marginTop: 20 }
					]}>
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
							login();
						}}>
						<Icon
							name='sign-in'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold'
							}}>
							Sign in
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
							navigate('Register');
						}}>
						<Icon
							name='address-book'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold'
							}}>
							Sign up
						</Text>
					</TouchableOpacity>
				</View>
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<TouchableOpacity
						onPress={() => {
							Linking.openURL('https://github.com/fabiohfab');
						}}>
						<Text style={{ color: '#f1f1f1' }}>
							Created by Fábio Henriques
						</Text>
					</TouchableOpacity>
				</View>
			</View>
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
