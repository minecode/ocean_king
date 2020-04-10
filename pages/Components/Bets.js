import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../../style';
import Button from '../Components/Button';
import ListCards from '../Components/ListCards';
import Title from '../Components/Title';

export default function Bets(props) {
	const {
		gameState,
		alreadyBet,
		user,
		newMessage,
		setNewMessage,
		navigate,
		socket,
		room,
		leaveGame,
		cards,
		maxBets,
		pontuations,
		placeBet,
	} = props;

	if (gameState && gameState === 'place bets' && alreadyBet) {
		return (
			<View style={styles.container}>
				<Title
					title={'Waiting for other players...'}
					style={{ fontSize: 25 }}
				/>

				<View
					style={[
						styles.row,
						{
							marginHorizontal: 0,
							justifyContent: 'center',
							marginBottom: 20,
						},
					]}>
					<Button
						icon={'comments'}
						firstColor={newMessage ? '#2177aa' : '#f1f1f1'}
						secondColor={newMessage ? '#f1f1f1' : '#212121'}
						action={() => {
							setNewMessage(false);
							navigate('Chat', {
								socket: socket,
								room: room,
								user: user,
							});
						}}
						small
					/>
					<Button
						icon={'sign-out'}
						firstColor={'#a72121'}
						secondColor={'#f1f1f1'}
						action={async () => {
							await leaveGame();
						}}
						small
					/>
				</View>

				<ListCards cards={cards} disabled />
			</View>
		);
	} else if (gameState && gameState === 'place bets' && !alreadyBet) {
		return (
			<View
				style={[
					styles.container,
					{
						marginVertical: 0,
						justifyContent: 'space-between',
					},
				]}>
				<View style={[styles.row, { marginTop: 20 }]}>
					<Text
						style={{
							fontSize: 25,
							fontWeight: 'bold',
							color: '#f1f1f1',
							marginHorizontal: 10,
						}}>
						Round {maxBets}
					</Text>
					<Button
						icon={'list'}
						firstColor={'#21b121'}
						secondColor={'#f1f1f1'}
						action={() => {
							navigate('Pontuations', {
								pontuations: pontuations,
							});
						}}
						small
					/>
					<Button
						icon={'comments'}
						action={() => {
							setNewMessage(false);
							navigate('Chat', {
								socket: socket,
								room: room,
								user: user,
							});
						}}
						firstColor={newMessage ? '#2177aa' : '#f1f1f1'}
						secondColor={newMessage ? '#f1f1f1' : '#212121'}
						small
					/>
					<Button
						icon={'sign-out'}
						firstColor={'#a72121'}
						secondColor={'#f1f1f1'}
						action={async () => {
							await leaveGame();
						}}
						small
					/>
				</View>

				<View style={[styles.row, { flexWrap: 'wrap' }]}>
					{maxBets !== null &&
						[...Array(maxBets + 1)].map((v, i) => {
							return (
								<TouchableOpacity
									key={i}
									style={{
										backgroundColor: '#2177aa',
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
					{maxBets !== null &&
						[...Array(10 - maxBets)].map((v, i) => {
							return (
								<TouchableOpacity
									key={i}
									style={{
										backgroundColor: '#41414190',
										height: 40,
										width: 80,
										borderRadius: 20,
										alignItems: 'center',
										justifyContent: 'center',
										margin: 5,
									}}
									disabled>
									<Text
										style={{
											color: '#f1f1f190',
											fontSize: 20,
										}}>
										{parseInt(i + 1 + maxBets)}
									</Text>
								</TouchableOpacity>
							);
						})}
				</View>

				<ListCards cards={cards} disabled />
			</View>
		);
	} else {
		return null;
	}
}
