import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';
import Button from '../Components/Button';
import Card from '../Components/Card';
import Modal from '../Components/Modal';
import ListCards from '../Components/ListCards';
import Gameboard from '../Components/Gameboard';

export default function Game(props) {
	const {
		user,
		socket,
		room,
		gameState,
		maxBets,
		navigate,
		pontuations,
		setNewMessage,
		newMessage,
		leaveGame,
		betsState,
		tempResults,
		playedCardsState,
		currentPlayer,
		setCurrentPlayer,
		cards,
		game,
		setTempCard,
		playCard,
		setChoiceVisible,
		displayWinner,
		open,
		setOpen,
		cardToPlay,
		setCardToPlay,
	} = props;




	if (gameState && gameState === 'in game') {
		return (
			<>
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

					<Gameboard
						currentPlayer={currentPlayer}
						playedCardsState={playedCardsState}
						tempResults={tempResults}
						betsState={betsState}
						displayWinner={displayWinner}
					/>

					<ListCards
						cards={cards}
						disabled={false}
						user={user}
						game={game}
						currentPlayer={currentPlayer}
						setCurrentPlayer={setCurrentPlayer}
						setTempCard={setTempCard}
						playCard={playCard}
						playedCardsState={playedCardsState}
						setChoiceVisible={setChoiceVisible}
						open={open}
						setOpen={setOpen}
						cardToPlay={cardToPlay}
						setCardToPlay={setCardToPlay}
					/>
				</View>
			</>
		);
	} else {
		return null;
	}
}
