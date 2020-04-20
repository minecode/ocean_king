import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	ScrollView,
	Platform,
	Keyboard,
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Input } from 'react-native-elements';
import styles from '../../style';
import { post, get } from '../../services/api';
import { setTestDeviceIDAsync } from 'expo-ads-admob';

export default function ChatScreen(props) {
	const [messages, setMessages] = useState(null);
	const [message, setMessage] = useState('');

	const scrollModal = useRef(null);
	const input = useRef(null);

	useEffect(() => {
		Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
		Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

		// cleanup function
		return () => {
			Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
			Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
		};
	}, []);

	const _keyboardDidShow = () => {
		scrollModal.current.scrollToEnd({
			animated: true,
		});
	};

	const _keyboardDidHide = () => {
		scrollModal.current.scrollToEnd({
			animated: true,
		});
	};
	useEffect(() => {
		if (scrollModal.current) {
			scrollModal.current.scrollToEnd({
				animated: true,
			});
		}
	}, [scrollModal]);

	async function sendMessage(room, user) {
		await post('/game/message', {
			game: room,
			message: message,
			user: user,
		})
			.then((response) => {
				input.current.clear();
				setMessage('');
				// getMessages(props.route.params.room);
			})
			.catch((error) => {
				// console.log(error);
			});
	}

	async function getMessages(room) {
		await get('/game/message', { game: room })
			.then((response) => {
				setMessages(response.data);
			})
			.catch((error) => {
				// console.log(error)
			});
	}

	useEffect(() => {
		getUser();
		getMessages(props.route.params.room);
		props.route.params.socket.on('new message sended', async function () {
			await getMessages(props.route.params.room);
		});
	}, []);

	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);

	async function getUser() {
		let user_temp = null;
		let name = null;
		if (Platform.OS !== 'web') {
			user_temp = await AsyncStorage.getItem('@ocean_king:user', null);
			name = await AsyncStorage.getItem('@ocean_king:username', null);
		} else {
			user_temp = localStorage.getItem('@ocean_king:user', null);
			name = localStorage.getItem('@ocean_king:username', null);
		}

		if (user_temp != null) {
			setUser(user_temp);
			setUsername(name);
		} else {
			setLoading(false);
			reset({ index: 1, routes: [{ name: 'Login' }] });
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<View
				style={{
					flex: 1,
					justifyContent: 'space-between',
					marginVertical: 20,
				}}>
				<View>
					<View style={{ height: '90%' }}>
						<ScrollView
							style={{ flexGrow: 0 }}
							ref={scrollModal}
							onContentSizeChange={(
								contentWidth,
								contentHeight
							) => {
								scrollModal.current.scrollToEnd({
									animated: true,
								});
							}}>
							{messages &&
								messages.messages &&
								messages.messages.length !== 0 &&
								messages.messages.map((m, i) => {
									return (
										<View
											key={i}
											style={[
												styles.row,
												{
													backgroundColor:
														m.player._id === user
															? '#1111ff30'
															: '#f1f1f130',
													borderRadius: 20,
													paddingHorizontal: 10,
													paddingVertical: 10,
													marginVertical: 5,
													flexDirection: 'column',
													alignItems:
														m.player._id === user
															? 'flex-end'
															: 'flex-start',
												},
											]}>
											<View
												style={[
													styles.row,
													{
														marginHorizontal: 0,
														marginBottom: 5,
														justifyContent:
															m.player._id ===
															user
																? 'flex-end'
																: 'flex-start',
													},
												]}>
												<Text
													style={{
														color: '#f1f1f1',
														fontWeight: 'bold',
														fontSize: 17,
													}}>
													{m.player.name}
												</Text>
											</View>
											<Text
												style={[
													styles.row,
													{
														color: '#f1f1f1',
														textAlign:
															m.player._id ===
															user
																? 'right'
																: 'left',
														marginHorizontal: 0,
													},
												]}>
												{m.message}
											</Text>
										</View>
									);
								})}
						</ScrollView>
					</View>
				</View>
				<View style={styles.row}>
					<View style={{ flex: 6 }}>
						<Input
							ref={input}
							placeholder='Message'
							onChangeText={(text) => {
								setMessage(text);
							}}
							multiline
							errorStyle={{ color: 'red' }}
							inputStyle={{ color: '#f1f1f1' }}
						/>
					</View>

					<View style={{ flex: 1 }}>
						<TouchableOpacity
							style={{
								width: 40,
								height: 40,
								borderRadius: 100,
								backgroundColor: 'rgb(30, 200, 30)',
								justifyContent: 'center',
								alignItems: 'center',
							}}
							onPress={async () => {
								await sendMessage(
									props.route.params.room,
									props.route.params.user
								);
							}}>
							<Icon
								name='arrow-right'
								color={'white'}
								type='font-awesome'
								size={17}
								iconStyle={{ margin: 10 }}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
