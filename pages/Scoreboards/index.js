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
	const [playersView, setPlayersView] = useState(null);

	async function getScores(type) {
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

	useEffect(() => {
		if (view) {
			getScores(view);
		}
	}, [view]);

	useEffect(() => {
		if (playersView) {
			getScores(view);
		}
	}, [playersView]);

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
									Total points
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
											Platform.OS === 'web' ? 10 : null,
										marginVertical: 10,
										alignItems: 'center',
										justifyContent: 'center',
										flexDirection: 'row',
									}}
									onPress={async () => {
										setPlayersView('points');
									}}>
									<Text
										style={{
											color: playersView
												? playersView === 'wins'
													? '#f1f1f130'
													: '#f1f1f1'
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
											Platform.OS === 'web' ? 10 : null,
										marginVertical: 10,
										alignItems: 'center',
										justifyContent: 'center',
										flexDirection: 'row',
									}}
									onPress={() => {
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
								<View
									style={[
										styles.row,
										{
											marginVertical: 5,
										},
									]}
									key={i}>
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
												iconStyle={{ marginRight: 10 }}
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
											{score.name}
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
											{playersView
												? playersView === 'points'
													? score.points
													: score.wins
												: score.points}
										</Text>
									</View>
								</View>
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
												score.scores[0].player &&
												score.scores[0].player.name}
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
												score.scores[0].player &&
												score.scores[0].points}
										</Text>
									</View>
									<View>
										{score.scores &&
											score.scores.map((p, j) => {
												if (j !== 0) {
													return (
														<View
															style={styles.row}
															key={j}>
															<Text
																style={{
																	color:
																		'#f1f1f1',
																}}>
																{p.player.name}
															</Text>
															<Text
																style={{
																	color:
																		'#f1f1f1',
																}}>
																{p.points}
															</Text>
														</View>
													);
												}
											})}
									</View>
								</View>
							);
						})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
