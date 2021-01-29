import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';
import Button from '../Components/Button';
import { get } from '../../services/api';

export default function Queue(props) {
	const {
		gameState,
		players,
		game,
		user,
		newMessage,
		setNewMessage,
		navigate,
		socket,
		room,
		startGame,
		leaveGame,
	} = props;
	const [invites, setInvites] = useState([])

	useEffect(() => {

		getNotificationsUsers();

	}, [])

	const getNotificationsUsers = async () => {
		await get('/game/pn', {})
			.then(async (response) => {
				console.log(response.data)
				setInvites(response.data.notifications)
			})
			.catch((error) => {
				console.log(error);
			});
	}
	if (gameState && gameState === 'in queue') {
		return (
			<View style={[styles.container, { alignItems: 'center' }]}>
				{/* List of players */}
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


				<View>
					<View style={styles.row}>
						<Text
							style={{
								fontSize: 30,
								fontWeight: 'bold',
								color: '#f1f1f1',
							}}>
							Invite
						</Text>
					</View>

					{invites &&
						invites.length !== 0 &&
						invites.map((p, i) => {
							if (p.user) {
								return (
									<View style={styles.row} key={i}>
										<Text style={{ color: '#f1f1f1' }}>
											{p.user.name}
										</Text>
									</View>
								);
							}

						})}

				</View>


				{/* Chat button */}
				<View style={[styles.row, { marginTop: 20 }]}>
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
					/>
				</View>

				{/* Start button */}
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
							<Button
								icon={'play'}
								firstColor={'#27496d'}
								secondColor={'#f1f1f1'}
								action={async () => {
									await startGame();
								}}
							/>
						</View>
					)}

				{/* Leave button */}
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 0,
							justifyContent: 'center',
						},
					]}>
					<Button
						icon={'sign-out'}
						firstColor={'#a72121'}
						secondColor={'#f1f1f1'}
						action={async () => {
							await leaveGame();
						}}
					/>
				</View>
			</View>
		);
	} else {
		return null;
	}
}
