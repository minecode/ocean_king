import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	Platform,
} from 'react-native';
import {
	ANDROID_CLIENT_ID,
	ANDROID_STANDALONE_APP_CLIENT_ID,
	ANDROID_CLIENT_ID_WEB,
} from 'react-native-dotenv';
let ReactGoogleLogin = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
} else {
	ReactGoogleLogin = require('react-google-login').GoogleLogin;
}
import { Icon } from 'react-native-elements';
import * as Google from 'expo-google-app-auth';
import * as ExpoGoogleSignIn from 'expo-google-sign-in';
import { post } from '../../services/api';
import styles from '../../style';
import Error from './Error';

function GoogleButton(props) {
	const [loginError, setLoginError] = useState(null);
	const { width } = Dimensions.get('window');

	const reset = props.reset;

	async function setUser(response) {
		if (response.data.dataBase_user !== undefined) {
			await AsyncStorage.setItem(
				'@ocean_king:user',
				response.data.dataBase_user._id
			);
			await AsyncStorage.setItem(
				'@ocean_king:username',
				response.data.dataBase_user.name
			);
		} else {
			await AsyncStorage.setItem(
				'@ocean_king:user',
				response.data.new_user._id
			);
			await AsyncStorage.setItem(
				'@ocean_king:username',
				response.data.new_user.name
			);
		}

		//setLoading(false);
		reset({ index: 1, routes: [{ name: 'Home' }] });
	}

	const signInMobile = async () => {
		//setLoading(true);
		if (__DEV__) {
			try {
				const { type, accessToken, user } = await Google.logInAsync({
					androidClientId: String(ANDROID_CLIENT_ID),
					androidStandaloneAppClientId: String(
						ANDROID_STANDALONE_APP_CLIENT_ID
					),
				});
				if (type === 'success') {
					await post('/auth/googleLogin/', { user })
						.then(async (response) => {
							await setUser(response);
						})
						.catch((error) => {
							//setLoading(false);
							console.log(error);
							setLoginError('Authentication fail code: 3');
						});
				} else {
					//setLoading(false);
					console.log('cancelled');
				}
			} catch (e) {
				//setLoading(false);
				console.log('error', e);
			}
		} else {
			try {
				await ExpoGoogleSignIn.askForPlayServicesAsync();
				const { type, user } = await ExpoGoogleSignIn.signInAsync();
				if (type === 'success') {
					//setLoading(true);
					await post('/auth/googleLogin/', { user })
						.then(async (response) => {
							await setUser(response);
						})
						.catch((error) => {
							//setLoading(false);
							setLoginError('Authentication fail code: 0');
						});
				} else {
					setLoginError('Authentication fail code: 1');
					//setLoading(false);
				}
			} catch (err) {
				setLoginError('Authentication fail code: 2' + err.message);
				//setLoading(false);
			}
		}
	};

	return (
		<>
			<Error error={loginError} />
			<View style={[styles.row, { justifyContent: 'center' }]}>
				<TouchableOpacity
					style={{
						backgroundColor: '#142850',
						height: 50,
						width: Platform.OS === 'web' ? 500 : width - 30,
						borderRadius: 25,
						marginLeft: 10,
						marginRight: 10,
						marginVertical: 10,
						alignItems: 'center',
						justifyContent: 'center',
						shadowOffset: {
							width: 0,
							height: 1,
						},
						shadowOpacity: 0.8,
						shadowRadius: 2,
						elevation: 5,
						flexDirection: 'row',
					}}
					onPress={
						Platform.OS === 'web'
							? props.renderProps.onClick
							: async () => {
									await signInMobile();
							  }
					}>
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
							fontWeight: 'bold',
						}}>
						Sign in with google
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

export default function GoogleLogin(props) {
	const [loginError, setLoginError] = useState(null);
	const [error, setError] = useState(false);

	const reset = props.reset;

	const badResponseGoogle = async (response) => {
		setError('Authentication failed code: -1');
	};

	const responseGoogle = async (response) => {
		await post('/auth/googleLogin/', {
			user: {
				email: response.profileObj.email,
				name: response.profileObj.name,
				imageURL: response.profileObj.imageUrl,
			},
		})
			.then(async (response) => {
				if (response.data.dataBase_user !== undefined) {
					localStorage.setItem(
						'@ocean_king:user',
						response.data.dataBase_user._id
					);
					localStorage.setItem(
						'@ocean_king:username',
						response.data.dataBase_user.name
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

				//setLoading(false);
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch((error) => {
				//setLoading(false);
				setLoginError('Authentication fail');
			});
	};

	async function initAsync() {
		await ExpoGoogleSignIn.initAsync();
	}

	useEffect(() => {
		if (!__DEV__) {
			if (Platform.OS !== 'web') {
				initAsync();
			}
		}
	});

	return (
		<>
			<Error error={loginError} />
			<Error error={error} />

			{Platform.OS === 'web' && (
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<ReactGoogleLogin
						clientId={ANDROID_CLIENT_ID_WEB}
						buttonText='Login'
						onSuccess={responseGoogle}
						onFailure={badResponseGoogle}
						cookiePolicy={'single_host_origin'}
						scope={'profile email openid'}
						render={(renderProps) => {
							return (
								<GoogleButton
									reset={reset}
									renderProps={renderProps}
								/>
							);
						}}
					/>
				</View>
			)}
			{Platform.OS !== 'web' && <GoogleButton reset={reset} />}
		</>
	);
}
