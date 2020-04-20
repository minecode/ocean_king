import React, { useState, useEffect } from 'react';
import {
	SafeAreaView,
	ScrollView,
	View,
	Text,
	RefreshControl,
	TouchableOpacity,
} from 'react-native';
import styles from '../../style';
import { get } from '../../services/api';
import { Icon } from 'react-native-elements';
import Card from '../Components/Card';
import Modal from '../Components/Modal';

export default function RoundsScreen(props) {
	const [loading, setLoading] = useState(false);
	const [rounds, setRounds] = useState(null);
	const [visible, setVisible] = useState(false);
	const [plays, setPlays] = useState(null);
	const [winner, setWinner] = useState(null);

	useEffect(() => {
		getRounds();
	}, []);

	async function asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	}

	async function getRounds() {
		setLoading(true);
		await get('/game/rounds', { game: props.route.params.game })
			.then(async (response) => {
				setLoading(false);
				setRounds(response.data.rounds);
			})
			.catch((error) => {
				// console.log(error);
				setLoading(false);
			});
	}

	async function onRefresh() {
		getRounds();
	}

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
				<View
					style={{
						marginVertical: 20,
					}}>
					{rounds &&
						rounds.map((round, i) => {
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
									<View style={styles.row}>
										<Text
											style={{
												fontSize: 15,
												color: '#f1f1f1',
												fontWeight: 'bold',
												marginBottom: 5,
											}}>
											Round {round.roundNumber}
										</Text>
									</View>
									{round.rel_plays.map((play, j) => {
										return (
											<TouchableOpacity
												style={[
													styles.row,
													{
														backgroundColor:
															'#f1f1f120',
														paddingVertical: 5,
														paddingHorizontal: 10,
														borderRadius: 20,
														marginVertical: 5,
													},
												]}
												onPress={() => {
													setPlays(play);
													setWinner(round.winner[j]);
													setVisible(true);
												}}
												key={j}>
												<View
													style={{
														flexDirection: 'row',
														alignItems: 'center',
													}}>
													<Text
														style={{
															color: '#f1f1f1',
														}}>
														Turn {j + 1}
													</Text>
													<Icon
														name='arrow-right'
														color={'white'}
														type='font-awesome'
														size={10}
														iconStyle={{
															marginHorizontal: 5,
														}}
													/>
													<Text
														style={{
															color: '#f1f1f1',
														}}>
														{round.winner[j].name}
													</Text>
												</View>
												<Icon
													name='plus'
													color={'white'}
													type='font-awesome'
													size={15}
													iconStyle={{
														marginHorizontal: 5,
													}}
												/>
											</TouchableOpacity>
										);
									})}
								</View>
							);
						})}
				</View>
			</ScrollView>
			<Modal
				visible={visible}
				content={
					<View
						style={{
							flexDirection: 'column',
							flex: 1,
						}}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'flex-end',
								marginHorizontal: 20,
							}}>
							<TouchableOpacity
								style={{
									width: 40,
									height: 40,
									borderRadius: 80,
									backgroundColor: '#f1f1f1',
									alignItems: 'center',
									justifyContent: 'center',
								}}
								onPress={() => {
									setPlays(null);
									setWinner(null);
									setVisible(false);
								}}>
								<Icon
									name='times'
									color={'#212121'}
									type='font-awesome'
									size={20}
									iconStyle={{
										margin: 10,
									}}
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
									marginTop: 50,
								},
							]}>
							{plays &&
								winner &&
								plays.card &&
								plays.card.map((card, k) => {
									return (
										<View
											key={k}
											style={{
												alignItems: 'center',
												margin: 10,
											}}>
											<Text
												style={{
													color:
														plays.player[k] !==
														winner.player
															? '#f1f1f1'
															: '#21b121',
													fontWeight:
														plays.player[k] !==
														winner.player
															? 'normal'
															: 'bold',
												}}>
												{plays.name[k].split(' ')[0]}
											</Text>
											<Card
												color={card[0].color}
												value={card[0].value}
												overlay={false}
											/>
										</View>
									);
								})}
						</View>
					</View>
				}
			/>
		</SafeAreaView>
	);
}
