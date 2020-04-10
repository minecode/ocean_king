import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';
import Card from '../Components/Card';

export default function Gameboard(props) {
	const { betsState, tempResults, currentPlayer, playedCardsState } = props;

	if (betsState && tempResults) {
		return (
			<View
				style={[
					styles.row,
					{
						justifyContent: 'center',
						flexWrap: 'wrap',
						margin: 0,
					},
				]}>
				{betsState.map((bet, i) => {
					return (
						<View
							key={i}
							style={{
								alignItems: 'center',
								margin: 10,
							}}>
							{bet && (
								<Text
									style={{
										fontSize: 15,
										fontWeight: 'bold',
										color:
											bet.player._id === currentPlayer
												? '#21b121'
												: '#f1f1f1',
									}}>
									{bet.player.name.split(' ')[0]}
								</Text>
							)}
							{playedCardsState &&
								bet &&
								playedCardsState.map((card, j) => {
									if (card.player._id === bet.player._id) {
										return (
											<Card
												key={j}
												color={card.card[0].color}
												value={card.card[0].value}
												overlay={
													props.displayWinner
														? bet.player._id !==
														  props.displayWinner
														: false
												}
											/>
										);
									}
								})}
							{bet && (
								<Text
									style={{
										fontSize: 15,
										fontWeight: 'bold',
										color:
											bet.player._id === currentPlayer
												? '#21b121'
												: '#f1f1f1',
									}}>
									{tempResults[bet.player._id]}/{bet.value}
								</Text>
							)}
						</View>
					);
				})}
			</View>
		);
	} else {
		return null;
	}
}
