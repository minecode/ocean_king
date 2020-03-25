import React, { useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	ActivityIndicator,
	Platform
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
}
import styles from '../../style';
import { Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post } from '../../services/api';
import { Image } from 'react-native-elements';
import { setTestDeviceIDAsync } from 'expo-ads-admob';

export default function LoginScreen(props) {
	const [loginError, setLoginError] = useState(null);
	const [loginUsernameError, setLoginUsernameError] = useState(null);
	const [loginPasswordError, setLoginPasswordError] = useState(null);
	const [loginEmailError, setLoginEmailError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState(false);
	const [email, setEmail] = useState(false);
	const [password, setPassword] = useState(false);

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	async function register() {
		setLoginError(null);
		setLoginPasswordError(null);
		setLoginUsernameError(null);
		setLoginEmailError(null);
		setLoading(true);
		await post('/auth/register/', {
			name: username,
			password: password,
			email: email
		})
			.then(async response => {
				setLoading(false);
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

				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch(error => {
				setLoading(false);
				setLoginError('Registration fail');
			});
	}

	async function getUser() {
		let user = await AsyncStorage.getItem('@ocean_king:user', null);
		if (user != null) {
			reset({ index: 1, routes: [{ name: 'Home' }] });
		}
	}

	useEffect(() => {
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}
		getUser();
	}, []);

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

			<View style={[styles.container, { marginTop: 0 }]}>
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
						Register
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
						placeholder='Email'
						onChangeText={text => {
							setEmail(text);
						}}
						errorMessage={loginEmailError}
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
						{
							marginHorizontal: 0,
							marginTop: 20,
							justifyContent: 'center'
						}
					]}>
					<TouchableOpacity
						style={{
							backgroundColor: '#27496d',
							height: 50,
							width: width - 30,
							borderRadius: 25,
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
							await register();
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
