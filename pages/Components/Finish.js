import React from 'react';
import { View, Text } from 'react-native';
import Title from '../Components/Title';
import Button from '../Components/Button';
import Pontuations from '../Components/Pontuations';
import styles from '../../style';

export default function Finish(props) {
	if (
		props.gameState &&
		(props.gameState === 'finished' || props.gameState === 'canceled')
	) {
		return (
			<View style={[styles.container, { alignItems: 'center' }]}>
				{!props.pontuations && (
					<Title title={'Waiting for scores...'} />
				)}
				<Pontuations pontuations={props.pontuations} />
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
								marginTop: 20,
							},
						]}>
						<Button
							icon={'comments'}
							action={() => {
								props.setNewMessage(false);
								props.navigate('Chat', {
									socket: props.socket,
									room: props.room,
									user: props.user,
								});
							}}
							firstColor={
								props.newMessage ? '#2177aa' : '#f1f1f1'
							}
							secondColor={
								props.newMessage ? '#f1f1f1' : '#212121'
							}
							small
						/>
						<Button
							icon={'sign-out'}
							firstColor={'#a72121'}
							secondColor={'#f1f1f1'}
							action={async () => {
								await props.leaveGame();
							}}
							small
						/>
					</View>
				</View>
			</View>
		);
	} else {
		return null;
	}
}
