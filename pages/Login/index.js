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
let AdSense = null;
let GoogleLogin = null;
let GoogleLogout = null;
import {
	APIKEY,
	ANDROIDCLIENTID,
	ANDROIDSTANDALONEAPPCLIENTID,
	ANDROIDCLIENTIDWEB,
	ADMOBUNITID
} from 'react-native-dotenv';
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
} else {
	AdSense = require('react-adsense').default;
	GoogleLogin = require('react-google-login').GoogleLogin;
	GoogleLogout = require('react-google-login').GoogleLogout;
}
import styles from '../../style';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post, get, put, remove } from '../../services/api';
import { Image } from 'react-native-elements';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';
import * as Google from 'expo-google-app-auth';
import * as GoogleSignIn from 'expo-google-sign-in';

export default function LoginScreen(props) {
	const [loginError, setLoginError] = useState(null);
	const [loginUsernameError, setLoginUsernameError] = useState(null);
	const [loginPasswordError, setLoginPasswordError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState(false);
	const [password, setPassword] = useState(false);
	const [error, setError] = useState(false);
	const [message, setMessage] = useState(false);

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	const signInMobile = async () => {
		setLoading(true);
		if (__DEV__) {
			try {
				const { type, accessToken, user } = await Google.logInAsync({
					androidClientId: process.env.ANDROIDCLIENTID,
					androidStandaloneAppClientId:
						process.env.ANDROIDSTANDALONEAPPCLIENTID
				});
				if (type === 'success') {
					await post('/auth/googleLogin/', { user })
						.then(async response => {
							if (response.data.dataBase_user !== undefined) {
								if (Platform.OS !== 'web') {
									await AsyncStorage.setItem(
										'@ocean_king:user',
										response.data.dataBase_user._id
									);
									await AsyncStorage.setItem(
										'@ocean_king:username',
										response.data.dataBase_user.name
									);
								} else {
									localStorage.setItem(
										'@ocean_king:user',
										response.data.dataBase_user._id
									);
									localStorage.setItem(
										'@ocean_king:username',
										response.data.dataBase_user.name
									);
								}
							} else {
								if (Platform.OS !== 'web') {
									await AsyncStorage.setItem(
										'@ocean_king:user',
										response.data.new_user._id
									);
									await AsyncStorage.setItem(
										'@ocean_king:username',
										response.data.new_user.name
									);
								} else {
									localStorage.setItem(
										'@ocean_king:user',
										response.data.new_user._id
									);
									localStorage.setItem(
										'@ocean_king:username',
										response.data.new_user.name
									);
								}
							}

							setLoading(false);
							reset({ index: 1, routes: [{ name: 'Home' }] });
						})
						.catch(error => {
							setLoading(false);
							console.log(error);
							setLoginError('Authentication fail');
						});
				} else {
					setLoading(false);
					console.log('cancelled');
				}
			} catch (e) {
				setLoading(false);
				console.log('error', e);
			}
		} else {
			try {
				await GoogleSignIn.askForPlayServicesAsync();
				const { type, user } = await GoogleSignIn.signInAsync();
				if (type === 'success') {
					setLoading(true);
					await post('/auth/googleLogin/', { user })
						.then(async response => {
							setLoading(false);
							if (response.data.dataBase_user !== undefined) {
								if (Platform.OS !== 'web') {
									await AsyncStorage.setItem(
										'@ocean_king:user',
										response.data.dataBase_user._id
									);
									await AsyncStorage.setItem(
										'@ocean_king:username',
										response.data.dataBase_user.name
									);
								} else {
									localStorage.setItem(
										'@ocean_king:user',
										response.data.dataBase_user._id
									);
									localStorage.setItem(
										'@ocean_king:username',
										response.data.dataBase_user.name
									);
								}
							} else {
								if (Platform.OS !== 'web') {
									await AsyncStorage.setItem(
										'@ocean_king:user',
										response.data.new_user._id
									);
									await AsyncStorage.setItem(
										'@ocean_king:username',
										response.data.new_user.name
									);
								} else {
									localStorage.setItem(
										'@ocean_king:user',
										response.data.new_user._id
									);
									localStorage.setItem(
										'@ocean_king:username',
										response.data.new_user.name
									);
								}
							}
							reset({ index: 1, routes: [{ name: 'Home' }] });
						})
						.catch(error => {
							setLoading(false);
							console.log(error);
							setLoginError('Authentication fail');
						});
				} else {
					setLoginError('Authentication fail (1)');
					setLoading(false);
				}
			} catch (err) {
				setLoginError('Authentication fail (2)' + err.message);
				setLoading(false);
			}
		}
	};

	const badResponseGoogle = async response => {
		console.log(response);
		setError('Authentication failed');
	};

	const responseGoogle = async response => {
		await post('/auth/googleLogin/', {
			user: {
				email: response.profileObj.email,
				name: response.profileObj.name
			}
		})
			.then(async response => {
				if (response.data.dataBase_user !== undefined) {
					if (Platform.OS !== 'web') {
						await AsyncStorage.setItem(
							'@ocean_king:user',
							response.data.dataBase_user._id
						);
						await AsyncStorage.setItem(
							'@ocean_king:username',
							response.data.dataBase_user.name
						);
					} else {
						localStorage.setItem(
							'@ocean_king:user',
							response.data.dataBase_user._id
						);
						localStorage.setItem(
							'@ocean_king:username',
							response.data.dataBase_user.name
						);
					}
				} else {
					if (Platform.OS !== 'web') {
						await AsyncStorage.setItem(
							'@ocean_king:user',
							response.data.new_user._id
						);
						await AsyncStorage.setItem(
							'@ocean_king:username',
							response.data.new_user.name
						);
					} else {
						localStorage.setItem(
							'@ocean_king:user',
							response.data.new_user._id
						);
						localStorage.setItem(
							'@ocean_king:username',
							response.data.new_user.name
						);
					}
				}

				setLoading(false);
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch(error => {
				setLoading(false);
				console.log(error);
				setLoginError('Authentication fail');
			});
	};

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

	async function initAsync() {
		await GoogleSignIn.initAsync();
	}

	useEffect(() => {
		console.log(process.env.APIKEY);
		console.log(process.env.ANDROIDCLIENTID);
		console.log(process.env.ANDROIDSTANDALONEAPPCLIENTID);
		console.log(process.env.ANDROIDCLIENTIDWEB);
		console.log(process.env.ADMOBUNITID);

		console.log(APIKEY);
		console.log(ANDROIDCLIENTID);
		console.log(ANDROIDSTANDALONEAPPCLIENTID);
		console.log(ANDROIDCLIENTIDWEB);
		console.log(ADMOBUNITID);
		if (__DEV__) {
			console.log('I am in debug');
		} else {
			if (Platform.OS !== 'web') {
				initAsync();
			}
		}

		getUser();
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		} else {
			// const script = document.createElement('script');
			// script.src =
			// 	'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
			// script.async = true;
			// document.body.appendChild(script);
		}
	}, []);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			{Platform.OS !== 'web' && (
				<AdMobBanner
					bannerSize='fullBanner'
					adUnitID={process.env.ADMOBUNITID} // Test ID, Replace with your-admob-unit-id
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
							width: 200,
							height: 200
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

				<View style={styles.row}>
					{message && (
						<Text style={{ color: '#f1f1f1' }}>{message}</Text>
					)}
					{error && <Text style={{ color: 'red' }}>{error}</Text>}
				</View>

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
				{false && (
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
				)}
				{false && (
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
				)}
				{false && (
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
				)}
				{Platform.OS === 'web' && (
					<View style={[styles.row, { justifyContent: 'center' }]}>
						<GoogleLogin
							clientId={process.env.ANDROIDCLIENTIDWEB}
							buttonText='Login'
							onSuccess={responseGoogle}
							onFailure={badResponseGoogle}
							cookiePolicy={'single_host_origin'}
							render={renderProps => {
								return (
									<View
										style={[
											styles.row,
											{ justifyContent: 'center' }
										]}>
										<TouchableOpacity
											style={{
												backgroundColor: '#142850',
												height: 50,
												width: 500,
												borderRadius: 25,
												marginLeft: 10,
												marginRight: 10,
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
											onPress={renderProps.onClick}
											// disabled={renderProps.disabled}
										>
											<Icon
												name='google'
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
												Sign in with google
											</Text>
										</TouchableOpacity>
									</View>
								);
							}}
						/>
					</View>
				)}
				{Platform.OS === 'android' && (
					<View style={[styles.row, { justifyContent: 'center' }]}>
						<TouchableOpacity
							style={{
								backgroundColor: '#142850',
								height: 50,
								width: width - 30,
								borderRadius: 25,
								marginLeft: 10,
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
							onPress={async () => {
								await signInMobile();
							}}>
							<Icon
								name='google'
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
								Sign in with google
							</Text>
						</TouchableOpacity>
					</View>
				)}

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
			<View
				style={[
					styles.row,
					{
						justifyContent: 'flex-start',
						marginBottom: 20
					}
				]}>
				<Text style={{ color: '#a1a1a1' }}>
					{Platform.OS === 'web' && 'web'} v202003241828
				</Text>
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
