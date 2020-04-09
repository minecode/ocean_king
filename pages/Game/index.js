import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	Text,
	Dimensions,
	ScrollView,
	AppState,
	Platform,
	StatusBar,
	RefreshControl,
	Keyboard,
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
let AdSense = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
} else {
	AdSense = require('react-adsense').default;
}
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { Icon, Input, Image } from 'react-native-elements';
import styles from '../../style';
import { post, get } from '../../services/api';
import Card from '../Components/Card';
import {
	setTestDeviceIDAsync,
	AdMobBanner,
	AdMobInterstitial,
} from 'expo-ads-admob';
import { AD_MOB_UNIT_ID, AD_MOB_UNIT_ID_INTER } from 'react-native-dotenv';

export default function GameScreen(props) {
	const { height, width } = Dimensions.get('window');
	const [user, setUser] = useState(null);
	const [game, setGame] = useState(null);
	const [players, setPlayers] = useState(null);
	const [cards, setCards] = useState(null);
	const [pontuations, setPontuations] = useState(null);
	const [username, setUsername] = useState(null);
	const [loading, setLoading] = useState(false);
	const [gameState, setGameState] = useState('in queue');
	const [maxBets, setMaxBets] = useState(null);
	const [displayWinner, setDisplayWinner] = useState(null);
	const [currentPlayer, setCurrentPlayer] = useState(null);
	const [alreadyBet, setAlreadyBet] = useState(false);
	const [betsState, setBetsState] = useState(null);
	const [tempResults, setTempResults] = useState(null);
	const [playedCardsState, setPlayedCardsState] = useState(null);
	const [tempCard, setTempCard] = useState(null);
	const [choiceVisible, setChoiceVisible] = useState(false);
	const [socket, setSocket] = useState(null);
	const [room, setRoom] = useState(null);
	const [colorArray, setColorArray] = useState(null);
	const [viewPontuations, setViewPontuations] = useState(false);
	const [newMessage, setNewMessage] = useState(false);
	const [count, setCount] = useState(0);

	const { navigate, reset } = props.navigation;

	useEffect(() => {
		setLoading(true);
		getUser();
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (game && gameState && room) {
			if (gameState === 'place bets') {
				getPlayerCards(room);
				getPontuations(room);
			} else if (gameState === 'in game') {
				setAlreadyBet(false);
				getPlayerCards(room);
				getCurrentPlayer(room);
				getPlayerStatus(room);
				getPontuations(room);
			} else if (gameState === 'finished') {
				getPontuations(room);
			}
		}
	}, [game, gameState]);

	useEffect(() => {
		if (players !== null && room !== null) {
			getGame(room);
		} else if (room === null) {
			setRoom(props.route.params.game);
		} else if (players === null) {
			getGamePlayers(room);
		}
	}, [players]);

	useEffect(() => {
		if (socket !== null && room !== null) {
			getGamePlayers(room);
			// getGame(room);
			socket.on('user join', function (user) {
				// console.log(user + ' join your room');
				getGamePlayers(room);
			});
			socket.on('user leave', function (user) {
				// console.log(user + ' leave your room');
				getGamePlayers(room);
			});
			socket.on('new message sended', async function () {
				// await getMessages();
			});
			socket.on('place bets', function (max) {
				setCurrentPlayer(null);
				setMaxBets(max);
				getGame(room);
				// console.log('place bets');
				setDisplayWinner(null);
				setCurrentPlayer(null);
				// getPlayerCards(room);
			});
			socket.on('start round', function () {
				if (Platform.OS !== 'web') {
					// callInterstitial();
				}
				setCurrentPlayer(null);
				setGameState('in game');
			});
			socket.on('new turn', function (player) {
				// console.log('first play: ' + player.name);
				setDisplayWinner(null);
				setPlayedCardsState(null);
				setCurrentPlayer(player._id);
				getPlayerStatus(room);
			});
			socket.on('next play', function (player) {
				// console.log('next play: ' + player.player.name);
				setCurrentPlayer(player.player._id);
				getPlayerStatus(room);
			});
			socket.on('turn winner', function (player) {
				// console.log('winner: ' + player.name);
				setDisplayWinner(player.name);
				setCurrentPlayer(null);
			});
			socket.on('new message sended', async function () {
				if (props.navigation.isFocused()) {
					setNewMessage(true);
				}
			});
			socket.on('turn finish', function () {
				// console.log('turn finish');
				// getPlayerStatus(props.route.params.game);
				// setDisplayWinner(null);
				setCurrentPlayer(null);
			});
			socket.on('game finished', function () {
				// console.log('game finished');
				setGameState('finished');
				setDisplayWinner(null);
				setCurrentPlayer(null);
			});
			socket.on('card played', function (card, user) {
				getPlayerStatus(room);
			});

			socket.emit('set nickname', username);
			socket.emit('join room', room, user);
		}
	}, [socket, room]);

	useEffect(() => {
		if (user !== null && username !== null) {
			if (socket === null) {
				// setSocket(io('http://192.168.1.68:3000'));
				setSocket(
					io('https://skull-king-game.herokuapp.com', {
						transports: ['websocket'],
						autoConnect: true,
					})
				);
				setRoom(props.route.params.game);

				AppState.addEventListener('change', handleChange);

				return () => {
					AppState.removeEventListener('change', handleChange);
				};
			} else {
				AppState.addEventListener('change', handleChange);

				setLoading(false);
				return () => {
					AppState.removeEventListener('change', handleChange);
				};
			}
		}
	}, [user, username]);

	async function callInterstitial() {
		setLoading(true);
		AdMobInterstitial.setAdUnitID(AD_MOB_UNIT_ID_INTER);
		await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
		await AdMobInterstitial.showAdAsync();
		setLoading(false);
	}

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

	async function handleChange(newState) {
		setLoading(true);
		if (newState === 'active') {
			if (socket !== null) {
				if (user !== null && username !== null && room !== null) {
					getGamePlayers(room);
				}
			} else {
				if (user !== null && username !== null && room !== null) {
					setSocket(
						io('https://skull-king-game.herokuapp.com', {
							transports: ['websocket'],
							autoConnect: true,
						})
					);
					setRoom(props.route.params.game);
				}
			}
		}

		setLoading(false);
	}

	function interpolateColor(color1, color2, factor) {
		if (arguments.length < 3) {
			factor = 0.5;
		}
		var result = color1.slice();
		for (var i = 0; i < 3; i++) {
			result[i] = Math.round(
				result[i] + factor * (color2[i] - color1[i])
			);
		}
		return result;
	}

	function interpolateColors(color1, color2, steps) {
		if (steps === 1) {
			return [[30, 200, 30]];
		}

		// console.log(steps, pontuations.length);
		// console.log(pontuations, pontuations.length !== steps);

		if (pontuations && pontuations.length !== steps) {
			steps = pontuations.length;
		}
		var stepFactor = 1 / (steps - 1),
			interpolatedColorArray = [];

		color1 = color1.match(/\d+/g).map(Number);
		color2 = color2.match(/\d+/g).map(Number);

		for (var i = 0; i < steps; i++) {
			interpolatedColorArray.push(
				interpolateColor(color1, color2, stepFactor * i)
			);
		}
		return interpolatedColorArray;
	}

	async function getPontuations(current_game) {
		await get('/game/pontuations', { game: current_game })
			.then((response) => {
				response.data.pontuations.sort((a, b) => {
					if (a.points > b.points) {
						return -1;
					}
					return 1;
				});
				setPontuations(response.data.pontuations);
				setLoading(false);
			})
			.catch((error) => {
				setLoading(false);
				//console.log(error);
			});
	}

	async function getCurrentPlayer(current_game) {
		await get('/game/currentPlayer', { game: current_game })
			.then((response) => {
				setCurrentPlayer(response.data.player._id);
			})
			.catch((error) => {
				//console.log(error);
			});
	}

	async function getPlayerCards(current_game) {
		await get('/game/cards', { user: user, game: current_game })
			.then((response) => {
				setCards(response.data.cards.cards);
			})
			.catch((error) => {
				setLoading(false);
				//console.log(error);
			});
	}

	async function getPlayerStatus(current_game) {
		await get('/game/playersStatus', { game: current_game })
			.then((response) => {
				setBetsState(response.data.bet);
				// setTempBetsState(response.data.bet);
				// setBetsState(null);
				setPlayedCardsState(response.data.played_cards);
				setTempResults(response.data.temp_results);
			})
			.catch((error) => {
				//console.log(error);
			});
	}

	async function playCard(card, current_game) {
		await post('/game/cards', {
			user: user,
			game: current_game,
			card: card,
		})
			.then((response) => {
				setCards(response.data.new_cards.cards);
			})
			.catch((error) => {
				//console.log(error);
			});
	}

	async function getGamePlayers(game) {
		await get('/game/gamePlayers', { game: game })
			.then(async (response) => {
				setPlayers(response.data.game_players);
				setColorArray(
					interpolateColors(
						'rgb(30, 200, 30)',
						'rgb(200, 20, 20)',
						response.data.game_players.length
					)
				);
			})
			.catch((error) => {
				setLoading(false);
				//console.log(error);
			});
	}

	async function leaveGame() {
		await post('/game/leave', { user: user })
			.then(async (response) => {
				setLoading(false);
				socket.emit('leave room', room, user);
				socket.emit('forceDisconnect');
				setSocket(null);
				setRoom(null);
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch((error) => {
				setLoading(false);
			});
	}

	async function getGame(current_game) {
		await get('/game/current', { game: current_game, user: user })
			.then(async (response) => {
				setGame(response.data.current_game);
				setGameState(response.data.current_game.status);
				if (
					response.data.current_game.status === 'place bets' ||
					response.data.current_game.status === 'in game'
				) {
					setMaxBets(response.data.round.roundNumber);

					if (response.data.bet) {
						setAlreadyBet(true);
					} else {
						setAlreadyBet(false);
					}
				}
			})
			.catch((error) => {
				setLoading(false);
				//console.log(error);
			});
	}

	async function startGame() {
		await post('/game/start', { user: user })
			.then(async (response) => {
				setLoading(false);
			})
			.catch((error) => {
				setLoading(false);
			});
	}

	async function placeBet(value) {
		await post('/game/bet', { user: user, game: game._id, value: value })
			.then((response) => {
				setAlreadyBet(true);
			})
			.catch((error) => {
				//console.log(error);
			});
		return;
	}

	async function onRefresh() {
		if (socket !== null) {
			if (user != null && username != null && room !== null) {
				getGamePlayers(room);
			}
		} else {
			if (user !== null && username !== null && room !== null) {
				setSocket(
					io('https://skull-king-game.herokuapp.com', {
						transports: ['websocket'],
						autoConnect: true,
					})
				);
				setRoom(props.route.params.game);
			}
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			{Platform.OS !== 'web' && (
				<AdMobBanner
					bannerSize='fullBanner'
					adUnitID={AD_MOB_UNIT_ID}
					servePersonalizedAds
					bannerSize={'smartBannerLandscape'}
				/>
			)}

			{Platform.OS !== 'web' && (
				<Modal
					isVisible={loading}
					deviceHeight={height + StatusBar.currentHeight}
					coverScreen={false}
					backdropColor={'#212121'}
					backdropOpacity={0.8}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<ActivityIndicator size='large' color='#f1f1f1' />
						<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
					</View>
				</Modal>
			)}

			{Platform.OS !== 'web' && (
				<Modal
					isVisible={displayWinner !== null}
					coverScreen={false}
					deviceHeight={height + StatusBar.currentHeight}
					backdropColor={'#212121'}
					backdropOpacity={0.8}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							flexWrap: 'wrap',
						}}>
						<Text
							style={{
								color: '#f1f1f1',
								fontSize: 25,
								textAlign: 'center',
							}}>
							{displayWinner} won the hand
						</Text>
					</View>
				</Modal>
			)}

			{Platform.OS !== 'web' && gameState === 'in game' && (
				<Modal
					isVisible={viewPontuations}
					coverScreen={false}
					deviceHeight={height + StatusBar.currentHeight}
					backdropColor={'#212121'}
					backdropOpacity={0.95}>
					<View
						style={{
							flex: 1,
							marginTop: 20,
						}}>
						<View
							style={[
								styles.row,
								{
									justifyContent: 'space-around',
									marginBottom: 50,
								},
							]}>
							<View>
								<Icon
									name='list-alt'
									color={'white'}
									type='font-awesome'
									size={30}
									iconStyle={{ margin: 10 }}
								/>
								<Text
									style={{
										fontSize: 25,
										fontWeight: 'bold',
										color: '#f1f1f1',
										marginHorizontal: 10,
									}}>
									Pontuations
								</Text>
							</View>
							<TouchableOpacity
								style={{
									width: 80,
									height: 40,
									borderRadius: 100,
									backgroundColor: '#c1c1c1',
									justifyContent: 'center',
									alignItems: 'center',
								}}
								onPress={() => {
									setViewPontuations(false);
								}}>
								<Icon
									name='times'
									color={'white'}
									type='font-awesome'
									size={17}
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>

						{pontuations &&
							pontuations.map((pont, i) => {
								return (
									<View style={styles.row} key={i}>
										<Text
											style={{
												fontSize: 15,
												fontWeight: 'bold',
												color: '#f1f1f1',
												marginHorizontal: 5,
											}}>
											{pont.player.name}:{' '}
										</Text>
										<Text
											style={{
												backgroundColor: '#212121',
												borderRadius: 20,
												paddingHorizontal: 5,
												color: '#f1f1f1',
												fontWeight: 'bold',
											}}>
											{pont.points}
										</Text>
									</View>
								);
							})}
					</View>
				</Modal>
			)}

			{Platform.OS !== 'web' && (
				<Modal
					isVisible={choiceVisible}
					coverScreen={false}
					deviceHeight={height + StatusBar.currentHeight}
					backdropColor={'#212121'}
					backdropOpacity={0.8}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-around',
						}}>
						<TouchableOpacity
							onPress={async () => {
								setCurrentPlayer(null);
								setChoiceVisible(false);
								await playCard(
									{
										color: tempCard.color,
										value: 'f',
										index: 58,
									},
									game
								);
								setTempCard(null);
								// setCards(null);
							}}>
							<Image
								source={require('../../assets/cards/cards/f.png')}
								style={{ width: 50, height: 50 }}
								placeholderStyle={{
									backgroundColor: 'transparent',
								}}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={async () => {
								setCurrentPlayer(null);
								setChoiceVisible(false);
								await playCard(
									{
										color: tempCard.color,
										value: 'p',
										index: 58,
									},
									game
								);
								setTempCard(null);
								// setCards(null);
							}}>
							<Image
								source={require('../../assets/cards/cards/p.png')}
								style={{ width: 50, height: 50 }}
								placeholderStyle={{
									backgroundColor: 'transparent',
								}}
							/>
						</TouchableOpacity>
					</View>
				</Modal>
			)}

			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				{gameState && gameState === 'in queue' && (
					<View style={[styles.container, { alignItems: 'center' }]}>
						<View>
							<View style={styles.row}>
								<Text
									style={{
										fontSize: 30,
										fontWeight: 'bold',
										color: '#f1f1f1',
									}}>
									Players
								</Text>
							</View>
							{players &&
								players.length !== 0 &&
								players.map((p, i) => {
									return (
										<View style={styles.row} key={i}>
											<Text style={{ color: '#f1f1f1' }}>
												{p.player.name}
											</Text>
										</View>
									);
								})}
						</View>
						<View style={[styles.row, { marginTop: 20 }]}>
							<TouchableOpacity
								style={{
									backgroundColor: newMessage
										? '#2177aa'
										: '#f1f1f1',
									color: newMessage ? '#f1f1f1' : '#212121',
									borderRadius: 100,
									height: 40,
									width: 80,
									marginVertical: 10,
									marginHorizontal: 10,
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
								onPress={() => {
									setCount(0);
									setNewMessage(false);
									navigate('Chat', {
										socket: socket,
										room: room,
										user: user,
									});
								}}>
								<Icon
									name='comments'
									color={newMessage ? '#f1f1f1' : '#212121'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>
						{user &&
							game &&
							game.createdBy &&
							user == game.createdBy._id &&
							players &&
							players.length >= 2 &&
							players.length <= 6 && (
								<View
									style={[
										styles.row,
										{
											marginHorizontal: 0,
											justifyContent: 'center',
										},
									]}>
									<TouchableOpacity
										style={{
											backgroundColor: '#27496d',
											height: 40,
											width: 80,
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
										onPress={async () => {
											await startGame();
										}}>
										<Icon
											name='play'
											color={'white'}
											type='font-awesome'
											iconStyle={{ margin: 10 }}
										/>
									</TouchableOpacity>
								</View>
							)}
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center',
								},
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									height: 40,
									width: 80,
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
								onPress={async () => {
									await leaveGame();
								}}>
								<Icon
									name='sign-out'
									color={'white'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>
					</View>
				)}
				{gameState && gameState === 'place bets' && alreadyBet && (
					<View style={styles.container}>
						<View
							style={[styles.row, { justifyContent: 'center' }]}>
							<Text
								style={{
									fontSize: 25,
									fontWeight: 'bold',
									color: '#f1f1f1',
								}}>
								Waiting for other players...
							</Text>
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center',
								},
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: newMessage
										? '#2177aa'
										: '#f1f1f1',
									color: '#212121',
									borderRadius: 100,
									height: 40,
									width: 80,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={() => {
									setCount(0);
									setNewMessage(false);
									navigate('Chat', {
										socket: socket,
										room: room,
										user: user,
									});
								}}>
								<Icon
									name='comments'
									color={'#212121'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									borderRadius: 100,
									height: 40,
									width: 80,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={async () => {
									await leaveGame();
								}}>
								<Icon
									name='sign-out'
									color={'white'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									marginBottom: 20,
								},
							]}>
							<ScrollView
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								decelerationRate={0}
								snapToInterval={80}
								snapToAlignment={'center'}
								contentInset={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center',
								}}>
								{cards &&
									cards.length !== 0 &&
									cards.map((v, i) => {
										return (
											<View
												key={i}
												style={{ marginHorizontal: 5 }}>
												<Card
													color={v.color}
													value={v.value}
													overlay={false}
												/>
											</View>
										);
									})}
							</ScrollView>
						</View>
					</View>
				)}
				{gameState && gameState === 'place bets' && !alreadyBet && (
					<View
						style={[
							styles.container,
							{
								marginVertical: 0,
								justifyContent: 'space-between',
							},
						]}>
						<View
							style={[
								{
									justifyContent: 'space-around',
									alignItems: 'center',
									flexDirection: 'column',
									flex: 1,
									marginBottom: 20,
								},
							]}>
							<View style={styles.row}>
								<Text
									style={{
										fontSize: 25,
										fontWeight: 'bold',
										color: '#f1f1f1',
										marginHorizontal: 10,
									}}>
									Round {maxBets}
								</Text>
								<TouchableOpacity
									style={{
										backgroundColor: newMessage
											? '#2177aa'
											: '#f1f1f1',
										color: '#212121',
										borderRadius: 100,
										height: 40,
										width: 80,
										marginVertical: 10,
										marginHorizontal: 10,
										alignItems: 'center',
										justifyContent: 'center',
										shadowOffset: { width: 0, height: 1 },
										shadowOpacity: 0.8,
										shadowRadius: 2,
										elevation: 5,
										flexDirection: 'row',
									}}
									onPress={() => {
										setCount(0);
										setNewMessage(false);
										navigate('Chat', {
											socket: socket,
											room: room,
											user: user,
										});
									}}>
									<Icon
										name='comments'
										color={'#212121'}
										type='font-awesome'
										iconStyle={{ margin: 10 }}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										backgroundColor: '#a72121',
										borderRadius: 100,
										height: 40,
										width: 80,
										marginVertical: 10,
										marginHorizontal: 10,
										alignItems: 'center',
										justifyContent: 'center',
										shadowOffset: { width: 0, height: 1 },
										shadowOpacity: 0.8,
										shadowRadius: 2,
										elevation: 5,
										flexDirection: 'row',
									}}
									onPress={async () => {
										await leaveGame();
									}}>
									<Icon
										name='sign-out'
										color={'white'}
										type='font-awesome'
										iconStyle={{ margin: 10 }}
									/>
								</TouchableOpacity>
							</View>
							{pontuations &&
								pontuations.map((pont, i) => {
									return (
										<View
											style={[
												styles.row,
												{
													justifyContent:
														'space-around',
												},
											]}
											key={i}>
											<Text
												style={{
													fontSize: 15,
													fontWeight: 'bold',
													color: '#f1f1f1',
													marginHorizontal: 5,
												}}>
												{pont.player.name}:{' '}
											</Text>
											<Text
												style={{
													backgroundColor: '#212121',
													borderRadius: 20,
													paddingHorizontal: 5,
													color: '#f1f1f1',
													fontWeight: 'bold',
												}}>
												{pont.points}
											</Text>
										</View>
									);
								})}
							<View style={[styles.row, { flexWrap: 'wrap' }]}>
								{maxBets !== null &&
									[...Array(maxBets + 1)].map((v, i) => {
										return (
											<TouchableOpacity
												key={i}
												style={{
													backgroundColor: '#414141',
													height: 40,
													width: 80,
													borderRadius: 20,
													alignItems: 'center',
													justifyContent: 'center',
													margin: 5,
												}}
												onPress={async () => {
													await placeBet(i);
												}}>
												<Text
													style={{
														color: '#f1f1f1',
														fontSize: 20,
													}}>
													{parseInt(i)}
												</Text>
											</TouchableOpacity>
										);
									})}
							</View>
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									marginBottom: 20,
								},
							]}>
							<ScrollView
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								decelerationRate={0}
								snapToInterval={80}
								snapToAlignment={'center'}
								contentInset={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center',
								}}>
								{cards &&
									cards.length !== 0 &&
									cards.map((v, i) => {
										return (
											<View
												key={i}
												style={{ marginHorizontal: 5 }}>
												<Card
													color={v.color}
													value={v.value}
													overlay={false}
												/>
											</View>
										);
									})}
							</ScrollView>
						</View>
					</View>
				)}
				{gameState && gameState === 'in game' && (
					<View
						style={[
							styles.container,
							{
								marginVertical: 0,
								justifyContent: 'space-between',
							},
						]}>
						<View
							style={[
								styles.row,
								{
									justifyContent: 'center',
									alignItems: 'center',
								},
							]}>
							<Text
								style={{
									fontSize: 25,
									fontWeight: 'bold',
									color: '#f1f1f1',
									marginHorizontal: 10,
								}}>
								Round {maxBets}
							</Text>

							<TouchableOpacity
								style={{
									backgroundColor: '#21b121',
									height: 40,
									width: 80,
									borderRadius: 100,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={() => {
									setViewPontuations(true);
								}}>
								<Icon
									size={20}
									name='list-alt'
									color={'white'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={{
									backgroundColor: newMessage
										? '#2177aa'
										: '#f1f1f1',
									color: '#212121',
									borderRadius: 100,
									height: 40,
									width: 80,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={() => {
									setCount(0);
									setNewMessage(false);
									navigate('Chat', {
										socket: socket,
										room: room,
										user: user,
									});
								}}>
								<Icon
									name='comments'
									color={'#212121'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									height: 40,
									width: 80,
									borderRadius: 100,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={async () => {
									await leaveGame();
								}}>
								<Icon
									name='sign-out'
									color={'white'}
									size={20}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>

						<View
							style={[
								styles.row,
								{
									justifyContent: 'center',
									flexWrap: 'wrap',
									margin: 0,
								},
							]}>
							{betsState &&
								tempResults &&
								betsState.map((bet, i) => {
									let hasReturn = false;
									return (
										<View
											key={i}
											style={{
												alignItems: 'center',
												margin: 2,
											}}>
											{bet && (
												<Text
													style={{
														fontSize: 15,
														fontWeight: 'bold',
														color:
															bet.player._id ===
															currentPlayer
																? '#21b121'
																: '#f1f1f1',
													}}>
													{bet.player.name}
												</Text>
											)}
											{playedCardsState &&
												bet &&
												playedCardsState.map(
													(card, j) => {
														if (
															card.player._id ===
															bet.player._id
														) {
															return (
																<Card
																	key={j}
																	color={
																		card
																			.card[0]
																			.color
																	}
																	value={
																		card
																			.card[0]
																			.value
																	}
																	overlay={
																		false
																	}
																/>
															);
														}
													}
												)}
											{bet && (
												<Text
													style={{
														fontSize: 15,
														fontWeight: 'bold',
														color:
															bet.player._id ===
															currentPlayer
																? '#21b121'
																: '#f1f1f1',
													}}>
													{
														tempResults[
															bet.player._id
														]
													}
													/{bet.value}
												</Text>
											)}
										</View>
									);
								})}
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									marginBottom: 20,
								},
							]}>
							<ScrollView
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								decelerationRate={0}
								snapToInterval={80}
								snapToAlignment={'center'}
								contentInset={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center',
								}}>
								{cards &&
									cards.length !== 0 &&
									cards.map((v, i) => {
										return (
											<View
												key={i}
												style={{
													marginHorizontal: 5,
												}}>
												<TouchableOpacity
													onPress={async () => {
														if (
															currentPlayer ===
															user
														) {
															let temp = cards;
															const index = temp.indexOf(
																v
															);
															if (index > -1) {
																temp.splice(
																	index,
																	1
																);
															}
															// setTempCards(temp);

															if (
																v.color ===
																'binary'
															) {
																setTempCard(v);
																setChoiceVisible(
																	true
																);
															} else {
																setCurrentPlayer(
																	null
																);
																await playCard(
																	v,
																	game
																);
																// setCards(null);
															}
														}
													}}>
													<Card
														color={v.color}
														value={v.value}
														overlay={
															currentPlayer !==
															user
														}
													/>
												</TouchableOpacity>
											</View>
										);
									})}
							</ScrollView>
						</View>
					</View>
				)}
				{gameState && gameState === 'finished' && (
					<View style={[styles.container, { alignItems: 'center' }]}>
						{!pontuations && (
							<View style={[styles.row]}>
								<Text
									style={{
										fontSize: 25,
										fontWeight: 'bold',
										color: '#f1f1f1',
									}}>
									Waiting for pontuations...
								</Text>
							</View>
						)}
						{pontuations &&
							pontuations.map((pont, i) => {
								return (
									<View
										style={[
											styles.row,
											{
												justifyContent: 'space-around',
											},
										]}
										key={i}>
										<Text
											style={{
												fontSize: 15,
												fontWeight: 'bold',
												color: '#f1f1f1',
												marginHorizontal: 5,
											}}>
											{pont.player.name}:{' '}
										</Text>
										<Text
											style={{
												backgroundColor: '#212121',
												borderRadius: 20,
												paddingHorizontal: 5,
												color: '#f1f1f1',
												fontWeight: 'bold',
											}}>
											{pont.points}
										</Text>
									</View>
								);
							})}
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center',
								},
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: newMessage
										? '#2177aa'
										: '#f1f1f1',
									color: '#212121',
									borderRadius: 100,
									height: 40,
									width: 80,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={() => {
									setCount(0);
									setNewMessage(false);
									navigate('Chat', {
										socket: socket,
										room: room,
										user: user,
									});
								}}>
								<Icon
									name='comments'
									color={'#212121'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									height: 40,
									width: 80,
									borderRadius: 100,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={async () => {
									await leaveGame();
								}}>
								<Icon
									name='sign-out'
									color={'white'}
									type='font-awesome'
									iconStyle={{ margin: 10 }}
								/>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</ScrollView>

			{Platform.OS === 'web' && loading && (
				<View
					style={[
						{
							width: width,
							height: height,
							position: 'absolute',
							alignContent: 'center',
							justifyContent: 'center',
							backgroundColor: '#21212180',
						},
					]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<ActivityIndicator size='large' color='#526b78' />
						<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
					</View>
				</View>
			)}

			{Platform.OS === 'web' && displayWinner !== null && (
				<View
					style={[
						{
							width: width,
							height: height,
							position: 'absolute',
							alignContent: 'center',
							justifyContent: 'center',
							backgroundColor: '#21212180',
						},
					]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							flexWrap: 'wrap',
						}}>
						<Text
							style={{
								color: '#f1f1f1',
								fontSize: 25,
								fontWeight: 'bold',
								textAlign: 'center',
							}}>
							{displayWinner} won the hand
						</Text>
					</View>
				</View>
			)}

			{Platform.OS === 'web' &&
				gameState === 'in game' &&
				viewPontuations && (
					<View
						style={[
							{
								width: width,
								height: height,
								position: 'absolute',
								alignContent: 'center',
								justifyContent: 'center',
								backgroundColor: '#21212180',
							},
						]}>
						<View
							style={{
								flex: 1,
								marginTop: 20,
							}}>
							<View
								style={[
									styles.row,
									{
										justifyContent: 'space-around',
										marginBottom: 50,
									},
								]}>
								<View>
									<Icon
										name='list-alt'
										color={'white'}
										type='font-awesome'
										size={30}
										iconStyle={{ margin: 10 }}
									/>
									<Text
										style={{
											fontSize: 25,
											fontWeight: 'bold',
											color: '#f1f1f1',
											marginHorizontal: 10,
										}}>
										Pontuations
									</Text>
								</View>
								<TouchableOpacity
									style={{
										width: 80,
										height: 40,
										borderRadius: 100,
										backgroundColor: '#c1c1c1',
										justifyContent: 'center',
										alignItems: 'center',
									}}
									onPress={() => {
										setViewPontuations(false);
									}}>
									<Icon
										name='times'
										color={'white'}
										type='font-awesome'
										size={17}
										iconStyle={{ margin: 10 }}
									/>
								</TouchableOpacity>
							</View>

							{pontuations &&
								pontuations.map((pont, i) => {
									return (
										<View
											style={[
												styles.row,
												{
													justifyContent:
														'space-around',
												},
											]}
											key={i}>
											<Text
												style={{
													fontSize: 15,
													fontWeight: 'bold',
													color: '#f1f1f1',
													marginHorizontal: 5,
												}}>
												{pont.player.name}:{' '}
											</Text>
											<Text
												style={{
													backgroundColor: '#212121',
													borderRadius: 20,
													paddingHorizontal: 5,
													color: '#f1f1f1',
													fontWeight: 'bold',
												}}>
												{pont.points}
											</Text>
										</View>
									);
								})}
						</View>
					</View>
				)}

			{Platform.OS === 'web' && choiceVisible && (
				<View
					style={[
						{
							width: width,
							height: height,
							position: 'absolute',
							alignContent: 'center',
							justifyContent: 'center',
							backgroundColor: '#21212180',
						},
					]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-around',
						}}>
						<TouchableOpacity
							onPress={async () => {
								setCurrentPlayer(null);
								setChoiceVisible(false);
								await playCard(
									{
										color: tempCard.color,
										value: 'f',
										index: 58,
									},
									game
								);
								setTempCard(null);
								// setCards(null);
							}}>
							<Image
								source={require('../../assets/cards/cards/f.png')}
								style={{ width: 50, height: 50 }}
								placeholderStyle={{
									backgroundColor: 'transparent',
								}}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={async () => {
								setCurrentPlayer(null);
								setChoiceVisible(false);
								await playCard(
									{
										color: tempCard.color,
										value: 'p',
										index: 58,
									},
									game
								);
								setTempCard(null);
								// setCards(null);
							}}>
							<Image
								source={require('../../assets/cards/cards/p.png')}
								style={{ width: 50, height: 50 }}
								placeholderStyle={{
									backgroundColor: 'transparent',
								}}
							/>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}
