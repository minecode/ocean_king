import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';

export default function Title(props) {
	return (
		<>
			{props.title && (
				<View
					style={[
						styles.row,
						{ justifyContent: 'center', marginVertical: 20 },
					]}>
					<Text
						style={[
							{
								fontSize: 30,
								fontWeight: 'bold',
								color: '#f1f1f1',
								textAlign: 'center',
							},
							props.style,
						]}>
						{props.title}
					</Text>
				</View>
			)}
		</>
	);
}
