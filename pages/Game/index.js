import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	ScrollView,
	AppState,
	Platform,
	RefreshControl,
	Text,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { Icon, Image } from 'react-native-elements';
import { post, get } from '../../services/api';

import { getUser } from '../../utils';
import ADMobBanner from '../Components/ADMobBanner';
import Modal from '../Components/Modal';
import Queue from '../Components/Queue';
import Bets from '../Components/Bets';
import Game from '../Components/Game';
import Button from '../Components/Button';
import Finish from '../Components/Finish';
import Card from '../Components/Card';

export default function GameScreen(props) {
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
	const [newMessage, setNewMessage] = useState(false);
	const [open, setOpen] = useState(false);
	const [cardToPlay, setCardToPlay] = useState(null);

	const { navigate, reset } = props.navigation;

	useEffect(() => {
		getLocalUser();
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
			getGame(room);
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
				setDisplayWinner(player._id);
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

	async function getLocalUser() {
		const { user, username } = await getUser(reset, true);
		setUser(user);
		setUsername(username);
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
			<ADMobBanner />

			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				<Queue
					gameState={gameState}
					players={players}
					game={game}
					user={user}
					newMessage={newMessage}
					setNewMessage={setNewMessage}
					navigate={navigate}
					socket={socket}
					room={room}
					startGame={startGame}
					leaveGame={leaveGame}
				/>
				<Bets
					gameState={gameState}
					alreadyBet={alreadyBet}
					user={user}
					newMessage={newMessage}
					setNewMessage={setNewMessage}
					navigate={navigate}
					socket={socket}
					room={room}
					leaveGame={leaveGame}
					cards={cards}
					maxBets={maxBets}
					pontuations={pontuations}
					placeBet={placeBet}
				/>

				<Game
					user={user}
					socket={socket}
					room={room}
					gameState={gameState}
					maxBets={maxBets}
					navigate={navigate}
					pontuations={pontuations}
					setNewMessage={setNewMessage}
					newMessage={newMessage}
					leaveGame={leaveGame}
					betsState={betsState}
					tempResults={tempResults}
					playedCardsState={playedCardsState}
					currentPlayer={currentPlayer}
					setCurrentPlayer={setCurrentPlayer}
					cards={cards}
					game={game}
					setTempCard={setTempCard}
					playCard={playCard}
					displayWinner={displayWinner}
					setChoiceVisible={setChoiceVisible}
					open={open}
					setOpen={setOpen}
					cardToPlay={cardToPlay}
					setCardToPlay={setCardToPlay}
				/>

				<Finish
					user={user}
					socket={socket}
					room={room}
					gameState={gameState}
					pontuations={pontuations}
					newMessage={newMessage}
					setNewMessage={setNewMessage}
					navigate={navigate}
					leaveGame={leaveGame}
				/>
			</ScrollView>

			<Modal
				visible={open && cardToPlay !== null}
				content={
					<View
						style={{
							flexDirection: 'column',
							alignItems: 'center',
						}}>
						<View style={{ marginBottom: 20 }}>
							<Card
								color={cardToPlay !== null && cardToPlay.color}
								value={cardToPlay !== null && cardToPlay.value}
							/>
						</View>

						<Button
							icon={'times'}
							text={'Cancel'}
							firstColor={'#a72121'}
							secondColor={'#f1f1f1'}
							action={() => {
								setOpen(false);
								setCardToPlay(null);
							}}
						/>
						<Button
							icon={'check'}
							text={'Confirm'}
							firstColor={'#21b121'}
							secondColor={'#f1f1f1'}
							action={async () => {
								const v = cardToPlay;
								if (currentPlayer === user) {
									let temp = cards;
									const index = temp.indexOf(v);
									if (index > -1) {
										temp.splice(index, 1);
									}
									// setTempCards(temp);

									if (v.color === 'binary') {
										setTempCard(v);
										setOpen(false);
										setCardToPlay(null);
										setChoiceVisible(true);
									} else {
										setCurrentPlayer(null);
										setOpen(false);
										setCardToPlay(null);
										await playCard(v, game);

										// setCards(null);
									}
								}
							}}
						/>
					</View>
				}
			/>

			<Modal
				visible={choiceVisible}
				content={
					<>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 20,
							}}>
							<TouchableOpacity
								style={{ marginHorizontal: 25 }}
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
								style={{ marginHorizontal: 25 }}
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
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-around',
							}}>
							<Button
								icon={'times'}
								text={'Cancel'}
								firstColor={'#a72121'}
								secondColor={'#f1f1f1'}
								action={() => {
									setChoiceVisible(false);
								}}
							/>
						</View>
					</>
				}
			/>
		</SafeAreaView>
	);
}
