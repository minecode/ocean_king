import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import Card from '../Components/Card';
import styles from '../../style';

export default function ListCards(props) {
	const [hasRef, setHasRef] = useState(false);
	const [ref, setRef] = useState(null);
	const [hasToFollow, setHasToFollow] = useState(false);

	useEffect(() => {
		if (
			props.playedCardsState !== null &&
			props.playedCardsState !== undefined &&
			!props.disabled &&
			props.cards !== null &&
			props.cards !== undefined &&
			props.currentPlayer === props.user
		) {
			let hasReturnTemp = false;
			let tempPlayedCards = props.playedCardsState.sort((a, b) => {
				if (a.createdAt !== undefined && b.createdAt !== undefined) {
					if (a.createdAt < b.createdAt) {
						return -1;
					} else {
						return 1;
					}
				} else {
					if (a.createdAt === undefined) {
						return -1;
					} else {
						return 1;
					}
				}
			});
			tempPlayedCards.map((c, i) => {
				if (!hasReturnTemp) {
					if (
						c.card[0].color === 'yellow' ||
						c.card[0].color === 'red' ||
						c.card[0].color === 'blue' ||
						c.card[0].color === 'black'
					) {
						setHasRef(true);
						setRef(c.card[0].color);
						hasReturnTemp = true;
						return;
					}
				}
			});
		} else {
			setHasRef(false);
			setRef(false);
			setHasToFollow(false);
		}
	}, [
		props.playedCardsState,
		props.disabled,
		props.currentPlayer,
		props.user,
	]);

	useEffect(() => {
		if (hasRef && ref && props.cards) {
			props.cards.map((c1, j) => {
				if (c1.color === ref) {
					setHasToFollow(true);
				}
			});
		}
	}, [hasRef, ref, props.cards]);

	return (
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
				{props.cards &&
					props.cards.length !== 0 &&
					props.cards.map((v, i) => {
						return (
							<View
								key={i}
								style={{
									marginHorizontal: 5,
									elevation: i + 5,
								}}>
								{!props.disabled && (
									<TouchableOpacity
										onPress={async () => {
											if (
												props.currentPlayer ===
												props.user
											) {
												if (
													!(
														hasToFollow &&
														hasRef &&
														ref !== null &&
														v.color !== ref &&
														!(
															v.color !== 'red' &&
															v.color !==
																'yellow' &&
															v.color !==
																'blue' &&
															v.color !== 'black'
														)
													)
												) {
													props.setOpen(true);
													props.setCardToPlay(v);
												}
											}
										}}>
										{props.currentPlayer !== props.user && (
											<Card
												color={v.color}
												value={v.value}
												overlay={true}
											/>
										)}
										{props.currentPlayer === props.user && (
											<Card
												color={v.color}
												value={v.value}
												overlay={
													hasToFollow &&
													hasRef &&
													ref !== null &&
													v.color !== ref &&
													!(
														v.color !== 'red' &&
														v.color !== 'yellow' &&
														v.color !== 'blue' &&
														v.color !== 'black'
													)
												}
											/>
										)}
									</TouchableOpacity>
								)}
								{props.disabled && (
									<Card
										color={v.color}
										value={v.value}
										overlay={false}
									/>
								)}
							</View>
						);
					})}
			</ScrollView>
		</View>
	);
}
