import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';
import Title from '../Components/Title';
import { Icon } from 'react-native-elements';

export default function Pontuations(props) {
	if (props.pontuations) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'flex-start',
					marginVertical: 20,
				}}>
				<View style={[styles.row, { justifyContent: 'flex-start' }]}>
					<Icon
						name={'list'}
						color={'#f1f1f1'}
						type='font-awesome'
						iconStyle={{ margin: 10 }}
					/>
					<Title title={'Pontuations'} />
				</View>
				{props.pontuations.map((pont, i) => {
					return (
						<View
							style={[
								styles.row,
								{
									justifyContent: 'space-between',
								},
							]}
							key={i}>
							<Text
								style={{
									fontSize: 15,
									fontWeight: 'bold',
									color: '#f1f1f1',
									marginHorizontal: 5,
								}}>
								{pont.player.name}:{' '}
							</Text>
							<Text
								style={{
									backgroundColor: '#212121',
									borderRadius: 20,
									paddingHorizontal: 5,
									color: '#f1f1f1',
									fontWeight: 'bold',
								}}>
								{pont.points}
							</Text>
						</View>
					);
				})}
			</View>
		);
	} else {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'space-between',
					marginVertical: 20,
				}}></View>
		);
	}
}
