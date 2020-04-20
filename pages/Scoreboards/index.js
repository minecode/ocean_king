import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	ScrollView,
	Dimensions,
	Platform,
	Keyboard,
	RefreshControl,
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
import { get } from '../../services/api';

export default function ScoreboardsScreen(props) {
	const [scores, setScores] = useState(null);
	const [loading, setLoading] = useState(false);
	const [view, setView] = useState('players');
	const [playersView, setPlayersView] = useState('points');

	async function getScores(type) {
		setLoading(true);
		if (type === 'players') {
			await get('/game/scoreboards/scores', {})
				.then(async (response) => {
					setLoading(false);
					setScores(
						response.data.sort((a, b) => {
							if (playersView === 'points') {
								return -(a.points - b.points);
							} else if (playersView === 'wins') {
								return -(a.wins - b.wins);
							} else if (playersView === 'right_bets') {
								return -(
									a.right_bets / (a.games * 10) -
									b.right_bets / (b.games * 10)
								);
							} else if (playersView === 'max_score') {
								return -(a.max_score - b.max_score);
							}
						})
					);
				})
				.catch((error) => {
					// console.log(error);
					setLoading(false);
				});
		} else {
			let url =
				type === 'players'
					? playersView
						? type + '/' + playersView
						: type + '/points'
					: type;
			await get('/game/scoreboards/' + url, {})
				.then(async (response) => {
					setLoading(false);
					setScores(response.data);
				})
				.catch((error) => {
					// console.log(error);
					setLoading(false);
				});
		}
	}

	useEffect(() => {
		if (view) {
			getScores(view);
		}
	}, [view]);

	async function onRefresh() {
		getScores(view);
	}

	const { width } = Dimensions.get('window');

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				{view && (
					<View>
						<View
							style={[
								styles.row,
								{
									marginHorizontal: 0,
									// marginTop: 20,
									justifyContent:
										Platform.OS === 'web'
											? 'center'
											: 'space-between',
								},
							]}>
							<TouchableOpacity
								style={{
									backgroundColor:
										view === 'players'
											? '#27496d'
											: '#27496d80',
									height: 50,
									width:
										Platform.OS === 'web'
											? 240
											: (width - 45) / 2,
									borderRadius: 25,
									marginLeft: Platform.OS === 'web' ? 0 : 15,
									marginRight:
										Platform.OS === 'web' ? 10 : null,
									marginVertical: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={async () => {
									setView('players');
								}}>
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
										fontWeight: 'bold',
									}}>
									Players
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={{
									backgroundColor:
										view === 'games'
											? '#27496d'
											: '#27496d80',
									height: 50,
									width:
										Platform.OS === 'web'
											? 240
											: (width - 45) / 2,
									borderRadius: 25,
									marginLeft:
										Platform.OS === 'web' ? 10 : null,
									marginRight: Platform.OS === 'web' ? 0 : 15,
									marginVertical: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row',
								}}
								onPress={() => {
									setView('games');
								}}>
								<Icon
									name='list'
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
									Games
								</Text>
							</TouchableOpacity>
						</View>
						{view === 'players' && (
							<View>
								<View
									style={[
										styles.row,
										{
											marginHorizontal: 0,
											// marginTop: 20,
											justifyContent:
												Platform.OS === 'web'
													? 'center'
													: 'space-between',
										},
									]}>
									<TouchableOpacity
										style={{
											height: 50,
											width:
												Platform.OS === 'web'
													? 240
													: (width - 45) / 2,
											marginLeft:
												Platform.OS === 'web' ? 0 : 15,
											marginRight:
												Platform.OS === 'web'
													? 10
													: null,
											marginTop: 10,
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'row',
										}}
										onPress={async () => {
											let new_scores = scores.sort(
												(a, b) => {
													return -(
														a.points - b.points
													);
												}
											);
											setScores(new_scores);
											setPlayersView('points');
										}}>
										<Text
											style={{
												color: playersView
													? playersView === 'points'
														? '#f1f1f1'
														: '#f1f1f130'
													: '#f1f1f1',
												margin: 5,
												fontWeight: 'bold',
											}}>
											Points
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={{
											height: 50,
											width:
												Platform.OS === 'web'
													? 240
													: (width - 45) / 2,
											marginLeft:
												Platform.OS === 'web' ? 0 : 15,
											marginRight:
												Platform.OS === 'web'
													? 10
													: null,
											marginTop: 10,
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'row',
										}}
										onPress={() => {
											let new_scores = scores.sort(
												(a, b) => {
													return -(a.wins - b.wins);
												}
											);
											setScores(new_scores);
											setPlayersView('wins');
										}}>
										<Text
											style={{
												color: playersView
													? playersView === 'wins'
														? '#f1f1f1'
														: '#f1f1f130'
													: '#f1f1f130',
												margin: 5,
												fontWeight: 'bold',
											}}>
											Wins
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={[
										styles.row,
										{
											marginHorizontal: 0,
											// marginTop: 20,
											justifyContent:
												Platform.OS === 'web'
													? 'center'
													: 'space-between',
										},
									]}>
									<TouchableOpacity
										style={{
											height: 50,
											width:
												Platform.OS === 'web'
													? 240
													: (width - 45) / 2,
											marginLeft:
												Platform.OS === 'web' ? 0 : 15,
											marginRight:
												Platform.OS === 'web'
													? 10
													: null,
											marginBottom: 10,
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'row',
										}}
										onPress={async () => {
											let new_scores = scores.sort(
												(a, b) => {
													return -(
														a.right_bets /
															(a.games * 10) -
														b.right_bets /
															(b.games * 10)
													);
												}
											);
											setScores(new_scores);
											setPlayersView('right_bets');
										}}>
										<Text
											style={{
												color: playersView
													? playersView ===
													  'right_bets'
														? '#f1f1f1'
														: '#f1f1f130'
													: '#f1f1f1',
												margin: 5,
												fontWeight: 'bold',
											}}>
											Right bets
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={{
											height: 50,
											width:
												Platform.OS === 'web'
													? 240
													: (width - 45) / 2,
											marginLeft:
												Platform.OS === 'web' ? 0 : 15,
											marginRight:
												Platform.OS === 'web'
													? 10
													: null,
											marginBottom: 10,
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'row',
										}}
										onPress={() => {
											let new_scores = scores.sort(
												(a, b) => {
													return -(
														a.max_score -
														b.max_score
													);
												}
											);
											setScores(new_scores);
											setPlayersView('max_score');
										}}>
										<Text
											style={{
												color: playersView
													? playersView ===
													  'max_score'
														? '#f1f1f1'
														: '#f1f1f130'
													: '#f1f1f130',
												margin: 5,
												fontWeight: 'bold',
											}}>
											Max scores
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>
				)}
				<View
					style={{
						marginVertical: 20,
					}}>
					{view &&
						view === 'players' &&
						scores &&
						scores.map((score, i) => {
							return (
								<TouchableOpacity
									style={[
										styles.row,
										{
											marginVertical: 5,
										},
									]}
									key={i}
									onPress={() => {
										props.navigation.navigate('Profile', {
											user: score.player._id,
										});
									}}>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
										}}>
										{i < 3 && (
											<Icon
												name='trophy'
												color={
													i === 0
														? '#CCA700'
														: i === 1
														? '#C0C0C0'
														: i === 2
														? '#cd853f'
														: '#f1f1f1'
												}
												type='font-awesome'
												iconStyle={{
													marginRight: 10,
												}}
											/>
										)}
										<Text
											style={{
												color:
													i === 0
														? '#CCA700'
														: i === 1
														? '#C0C0C0'
														: i === 2
														? '#cd853f'
														: '#f1f1f1',
												fontWeight:
													i < 3 ? 'bold' : 'normal',
												fontSize:
													i === 0
														? 22
														: i === 1
														? 20
														: i === 2
														? 18
														: 15,
											}}>
											{score.player && score.player.name}
										</Text>
									</View>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
										}}>
										<Text
											style={{
												color:
													i === 0
														? '#CCA700'
														: i === 1
														? '#C0C0C0'
														: i === 2
														? '#cd853f'
														: '#f1f1f1',
												fontWeight:
													i < 3 ? 'bold' : 'normal',
												fontSize:
													i === 0
														? 22
														: i === 1
														? 20
														: i === 2
														? 18
														: 15,
											}}>
											{playersView &&
												playersView === 'points' &&
												score.points}
											{playersView &&
												playersView === 'wins' &&
												score.wins}
											{playersView &&
												playersView === 'right_bets' &&
												(
													100 *
													(score.right_bets /
														(score.games * 10))
												).toFixed(1) + '%'}

											{playersView &&
												playersView === 'max_score' &&
												score.max_score}
										</Text>
									</View>
								</TouchableOpacity>
							);
						})}
				</View>
				<View style={{ marginBottom: 20 }}>
					{view &&
						view === 'games' &&
						scores &&
						scores.map((score, i) => {
							return (
								<View
									style={{
										marginTop: i !== 0 ? 20 : 0,
										borderRadius: 20,
										marginHorizontal: 10,
										padding: 10,
										backgroundColor: '#f1f1f110',
									}}
									key={i}>
									<TouchableOpacity
										onPress={() => {
											props.navigation.navigate(
												'Rounds',
												{
													game: score._id,
												}
											);
										}}>
										<View style={{ flexDirection: 'row' }}>
											<View style={{ flex: 8 }}>
												<View style={[styles.row]}>
													<Text
														style={{
															color: '#f1f1f1',
															fontWeight: 'bold',
															fontSize: 15,
														}}>
														{score &&
															score.scores &&
															score.scores[0] &&
															score.scores[0]
																.player &&
															score.scores[0]
																.player.name}
													</Text>
													<Text
														style={{
															color: '#f1f1f1',
															fontWeight: 'bold',
															fontSize: 15,
														}}>
														{score &&
															score.scores &&
															score.scores[0] &&
															score.scores[0]
																.player &&
															score.scores[0]
																.points}
													</Text>
												</View>
												<View>
													{score.scores &&
														score.scores.map(
															(p, j) => {
																if (j !== 0) {
																	return (
																		<View
																			style={
																				styles.row
																			}
																			key={
																				j
																			}>
																			<Text
																				style={{
																					color:
																						'#f1f1f1',
																				}}>
																				{
																					p
																						.player
																						.name
																				}
																			</Text>
																			<Text
																				style={{
																					color:
																						'#f1f1f1',
																				}}>
																				{
																					p.points
																				}
																			</Text>
																		</View>
																	);
																}
															}
														)}
												</View>
											</View>
											<View
												style={{
													flex: 1,
													justifyContent: 'center',
												}}>
												<Icon
													name='arrow-right'
													color={'#f1f1f1'}
													type='font-awesome'
													size={18}
													iconStyle={{
														margin: 10,
													}}
												/>
											</View>
										</View>
									</TouchableOpacity>
								</View>
							);
						})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
