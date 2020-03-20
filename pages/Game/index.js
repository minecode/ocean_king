import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	Text,
	Dimensions,
	AsyncStorage,
	ScrollView,
	ImageBackground,
	AppState
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import styles from '../../style';
import { post, get, put, remove } from '../../services/api';
import store from '../../store';
import Card from '../Components/Card';
import { Image } from 'react-native-elements';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

export default function GameScreen(props) {
	const { height, width } = Dimensions.get('window');
	const [user, setUser] = useState(null);
	const [game, setGame] = useState(null);
	const [players, setPlayers] = useState(null);
	const [cards, setCards] = useState(null);
	const [tempCards, setTempCards] = useState(null);
	const [pontuations, setPontuations] = useState(null);
	const [username, setUsername] = useState(null);
	const [loading, setLoading] = useState(false);
	const [gameState, setGameState] = useState('in queue');
	const [maxBets, setMaxBets] = useState(null);
	const [displayWinner, setDisplayWinner] = useState(null);
	const [currentPlayer, setCurrentPlayer] = useState(null);
	const [alreadyBet, setAlreadyBet] = useState(false);
	const { navigate, reset } = props.navigation;
	const [betsState, setBetsState] = useState(null);
	const [tempResults, setTempResults] = useState(null);
	const [tempBetsState, setTempBetsState] = useState(null);
	const [playedCardsState, setPlayedCardsState] = useState(null);
	const [tempCard, setTempCard] = useState(null);
	const [choiceVisible, setChoiceVisible] = useState(false);

	async function getUser() {
		let user = await AsyncStorage.getItem('@ocean_king:user', null);
		let name = await AsyncStorage.getItem('@ocean_king:username', null);
		if (user != null) {
			setUser(user);
			setUsername(name);
		} else {
			reset({ index: 1, routes: [{ name: 'Login' }] });
		}
	}

	useEffect(() => {
		getUser();
		setTestDeviceIDAsync('EMULATOR');
	}, []);

	const handleChange = newState => {
		if (newState === 'active') {
			if (user != null && username != null) {
				getGamePlayers(props.route.params.game);
				getGame(props.route.params.game);

				if (gameState !== 'in queue') {
					if (gameState === 'place bets') {
						getPontuations(props.route.params.game);
						getPlayerCards(props.route.params.game);
					} else if (gameState === 'in game') {
						getPlayerStatus(props.route.params.game);
						getCurrentPlayer(props.route.params.game);
						getPlayerCards(props.route.params.game);
					} else if (gameState === 'finished') {
						getPontuations(props.route.params.game);
					}
				}
			}
		}
	};

	useEffect(() => {
		if (!cards && tempCards) {
			let temp2 = tempCards;
			setTempCards(null);
			setCards(temp2);
		}
	}, [cards]);

	useEffect(() => {
		if (!betsState && tempBetsState && tempResults) {
			let temp3 = tempBetsState;
			setTempBetsState(null);
			setBetsState(temp3);
		}
	}, [betsState, tempBetsState, tempResults]);

	useEffect(() => {
		if (gameState) {
			if (gameState === 'place bets') {
				getPlayerCards(props.route.params.game);
				getPontuations(props.route.params.game);
			} else if (gameState === 'in game') {
				getPlayerStatus(props.route.params.game);
				getCurrentPlayer(props.route.params.game);
			}
		}
	}, [gameState]);

	useEffect(() => {
		if (user != null && username != null) {
			// const socket = io('http://192.168.1.68:3000');
			const socket = io('https://skull-king-game.herokuapp.com');
			store.dispatch({
				type: 'SET_SOCKET',
				socket: socket,
				room: props.route.params.game
			});

			getGamePlayers(props.route.params.game);
			getGame(props.route.params.game);

			if (gameState !== 'in queue') {
				getPlayerStatus(props.route.params.game);
				getCurrentPlayer(props.route.params.game);
				getPlayerCards(props.route.params.game);
			}

			socket.on('user join', function(user) {
				console.log(user + ' join your room');
				getGamePlayers(props.route.params.game);
			});
			socket.on('user leave', function(user) {
				console.log(user + ' leave your room');
				getGamePlayers(props.route.params.game);
			});
			socket.on('place bets', function(max) {
				setGameState('place bets');
				console.log('geting...');
				getPlayerCards(props.route.params.game);
				setCurrentPlayer(null);
				setMaxBets(max);
			});
			socket.on('start round', function() {
				setGameState('in game');
				setCurrentPlayer(null);
				getPlayerCards(props.route.params.game);
			});
			socket.on('new turn', function(player) {
				console.log('first play: ' + player.name);
				getPlayerStatus(props.route.params.game);
				setPlayedCardsState(null);
				setDisplayWinner(null);
				setCurrentPlayer(player._id);
			});
			socket.on('next play', function(player) {
				console.log('next play: ' + player.player.name);
				getPlayerStatus(props.route.params.game);
				setCurrentPlayer(player.player._id);
			});
			socket.on('turn winner', function(player) {
				console.log('winner: ' + player.name);
				setDisplayWinner(player.name);
				setCurrentPlayer(null);
			});
			socket.on('turn finish', function() {
				console.log('turn finish');
				// getPlayerStatus(props.route.params.game);
				setDisplayWinner(null);
				setCurrentPlayer(null);
			});
			socket.on('round finish', function() {
				console.log('round finish');
				getPontuations(props.route.params.game);
				getGame(props.route.params.game);
				setDisplayWinner(null);
				setCurrentPlayer(null);
			});
			socket.on('game finished', function() {
				console.log('game finished');
				setGameState('finished');
				getPontuations(props.route.params.game);
			});
			socket.on('card played', function(card, user) {
				getPlayerStatus(props.route.params.game);
			});

			socket.emit('set nickname', username);
			socket.emit('join room', props.route.params.game, user);

			AppState.addEventListener('change', handleChange);

			return () => {
				AppState.removeEventListener('change', handleChange);
			};
		}
	}, [user, username]);

	async function getPontuations(current_game) {
		await get('/game/pontuations', { game: current_game })
			.then(response => {
				setPontuations(response.data.pontuations);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function getCurrentPlayer(current_game) {
		await get('/game/currentPlayer', { game: current_game })
			.then(response => {
				setCurrentPlayer(response.data.player._id);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function getPlayerCards(current_game) {
		await get('/game/cards', { user: user, game: current_game })
			.then(response => {
				setCards(response.data.cards.cards);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function getPlayerStatus(current_game) {
		await get('/game/playersStatus', { game: current_game })
			.then(response => {
				setBetsState(response.data.bet);
				setTempBetsState(response.data.bet);
				setBetsState(null);
				setPlayedCardsState(response.data.played_cards);
				setTempResults(response.data.temp_results);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function playCard(card, current_game) {
		await post('/game/cards', {
			user: user,
			game: current_game,
			card: card
		})
			.then(response => {
				setLoading(false);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function getGamePlayers(game) {
		await get('/game/gamePlayers', { game: game })
			.then(async response => {
				setLoading(false);
				setPlayers(response.data.game_players);
			})
			.catch(error => {
				console.log(error);
			});
	}

	async function leaveGame() {
		await post('/game/leave', { user: user })
			.then(async response => {
				setLoading(false);
				store
					.getState()
					.socket.socket.emit(
						'leave room',
						store.getState().socket.room,
						user
					);
				store.getState().socket.socket.emit('forceDisconnect');
				store.dispatch({ type: 'REMOVE_SOCKET' });
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch(error => {
				setLoading(false);
			});
	}

	async function getGame(current_game) {
		await get('/game/current', { game: current_game, user: user })
			.then(async response => {
				setLoading(false);
				setGame(response.data.current_game);
				console.log(response.data.current_game.status);
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
					if (response.data.current_game.status === 'in game') {
						await getPlayerCards(response.data.current_game._id);
					}
				}
			})
			.catch(error => {
				setLoading(false);
				console.log(error);
			});
	}

	async function startGame() {
		await post('/game/start', { user: user })
			.then(async response => {
				setLoading(false);
			})
			.catch(error => {
				console.log(error);
				setLoading(false);
			});
	}

	async function placeBet(value) {
		await post('/game/bet', { user: user, game: game._id, value: value })
			.then(response => {
				setAlreadyBet(true);
			})
			.catch(error => {
				console.log(error);
			});
		return;
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<AdMobBanner
				bannerSize='fullBanner'
				adUnitID='ca-app-pub-7606799175531903/7143162423' // Test ID, Replace with your-admob-unit-id
				servePersonalizedAds // true or false
				bannerSize={'smartBannerLandscape'}
			/>
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
					<ActivityIndicator size='large' color='#526b78' />
					<Text style={{ color: '#f1f1f1' }}> Loanding...</Text>
				</View>
			</Modal>
			<Modal
				isVisible={displayWinner !== null}
				coverScreen={true}
				backdropColor={'#212121'}
				backdropOpacity={0.8}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Text style={{ color: '#f1f1f1', fontSize: 25 }}>
						{' '}
						Turn winner: {displayWinner}
					</Text>
				</View>
			</Modal>
			<Modal
				isVisible={choiceVisible}
				coverScreen={true}
				backdropColor={'#212121'}
				backdropOpacity={0.8}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-around'
					}}>
					<TouchableOpacity
						onPress={async () => {
							setCurrentPlayer(null);
							setChoiceVisible(false);
							setTempCard(null);
							await playCard(
								{ color: tempCard.color, value: 'f' },
								game
							);
							setCards(null);
						}}>
						<Image
							source={require('../../assets/cards/f.png')}
							style={{ width: 50, height: 50 }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={async () => {
							setCurrentPlayer(null);
							setChoiceVisible(false);
							setTempCard(null);
							await playCard(
								{ color: tempCard.color, value: 'p' },
								game
							);
							setCards(null);
						}}>
						<Image
							source={require('../../assets/cards/p.png')}
							style={{ width: 50, height: 50 }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				{gameState && gameState === 'in queue' && (
					<View style={styles.container}>
						<View style={styles.row}>
							<Text
								style={{
									fontSize: 30,
									fontWeight: 'bold',
									color: '#f1f1f1'
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
						{user && game && user == game.createdBy._id && (
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
										await startGame();
									}}>
									<Icon
										name='play'
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
										Start game
									</Text>
								</TouchableOpacity>
							</View>
						)}
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center'
								}
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
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
									await leaveGame();
								}}>
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
									}}>
									Leave game
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
				{gameState && gameState === 'place bets' && alreadyBet && (
					<View style={styles.container}>
						<View style={styles.row}>
							<Text
								style={{
									fontSize: 25,
									fontWeight: 'bold',
									color: '#f1f1f1'
								}}>
								Waiting for other players...
							</Text>
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center'
								}
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
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
									await leaveGame();
								}}>
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
									}}>
									Leave game
								</Text>
							</TouchableOpacity>
						</View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									marginBottom: 20
								}
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
									right: 0
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center'
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
								justifyContent: 'space-between'
							}
						]}>
						<View
							style={[
								{
									justifyContent: 'space-between',
									alignItems: 'center',
									flexDirection: 'column',
									flex: 1,
									marginBottom: 20
								}
							]}>
							<View style={styles.row}>
								<Text
									style={{
										fontSize: 25,
										fontWeight: 'bold',
										color: '#f1f1f1',
										marginHorizontal: 10
									}}>
									Place your bet
								</Text>
								<TouchableOpacity
									style={{
										backgroundColor: '#a72121',
										height: 50,
										width: 150,
										borderRadius: 25,
										marginVertical: 10,
										marginHorizontal: 10,
										alignItems: 'center',
										justifyContent: 'center',
										shadowOffset: { width: 0, height: 1 },
										shadowOpacity: 0.8,
										shadowRadius: 2,
										elevation: 5,
										flexDirection: 'row'
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
									<Text
										style={{
											color: 'white',
											margin: 5,
											fontWeight: 'bold'
										}}>
										Leave game
									</Text>
								</TouchableOpacity>
							</View>
							{pontuations &&
								pontuations.map((pont, i) => {
									return (
										<View style={styles.row} key={i}>
											<Text
												style={{
													fontSize: 25,
													fontWeight: 'bold',
													color: '#f1f1f1'
												}}>
												{pont.player.name}:{' '}
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
													margin: 5
												}}
												onPress={async () => {
													await placeBet(i);
												}}>
												<Text
													style={{
														color: '#f1f1f1',
														fontSize: 20
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
									marginBottom: 20
								}
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
									right: 0
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center'
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
								justifyContent: 'space-between'
							}
						]}>
						<View style={styles.row}>
							<Text
								style={{
									fontSize: 25,
									fontWeight: 'bold',
									color: '#f1f1f1',
									marginHorizontal: 10
								}}>
								In game
							</Text>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									height: 50,
									width: 150,
									borderRadius: 25,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row'
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
								<Text
									style={{
										color: 'white',
										margin: 5,
										fontWeight: 'bold'
									}}>
									Leave game
								</Text>
							</TouchableOpacity>
						</View>
						<View
							style={[
								styles.row,
								{
									justifyContent: 'center',
									flexWrap: 'wrap',
									margin: 0
								}
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
												margin: 2
											}}>
											<Text
												style={{
													fontSize: 15,
													fontWeight: 'bold',
													color:
														bet.player._id ===
														currentPlayer
															? '#21b121'
															: '#f1f1f1'
												}}>
												{bet.player.name}{' '}
												{tempResults[bet.player._id]}/
												{bet.value}
											</Text>
											{playedCardsState &&
												playedCardsState.map(
													(card, j) => {
														if (
															card.player._id ===
															bet.player._id
														) {
															hasReturn = true;
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
											{!hasReturn && (
												<Card
													color={'back'}
													value={0}
													overlay={false}
												/>
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
									marginBottom: 20
								}
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
									right: 0
								}}
								pagingEnabled={false}
								contentContainerStyle={{
									flexGrow: 1,
									justifyContent: 'center'
								}}>
								{cards &&
									cards.length !== 0 &&
									cards.map((v, i) => {
										return (
											<View
												key={i}
												style={{ marginHorizontal: 5 }}>
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
															setTempCards(temp);

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
																setCards(null);
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
					<View style={styles.container}>
						{!pontuations && (
							<View style={styles.row}>
								<Text
									style={{
										fontSize: 25,
										fontWeight: 'bold',
										color: '#f1f1f1'
									}}>
									Waiting for pontuations...
								</Text>
							</View>
						)}
						{pontuations &&
							pontuations.map((pont, i) => {
								return (
									<View style={styles.row} key={i}>
										<Text
											style={{
												fontSize: 25,
												fontWeight: 'bold',
												color: '#f1f1f1'
											}}>
											{pont.player.name}: {pont.points}
										</Text>
									</View>
								);
							})}
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									justifyContent: 'center'
								}
							]}>
							<TouchableOpacity
								style={{
									backgroundColor: '#a72121',
									height: 50,
									width: width - 30,
									borderRadius: 25,
									marginVertical: 10,
									marginHorizontal: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row'
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
								<Text
									style={{
										color: 'white',
										margin: 5,
										fontWeight: 'bold'
									}}>
									Leave game
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
