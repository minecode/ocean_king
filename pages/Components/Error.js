import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../style';

export default function Error(props) {
	return (
		<>
			{props.error !== null && (
				<View
					style={[
						styles.row,
						{
							justifyContent: 'center',
							alignItems: 'center',
						},
					]}>
					<Text style={{ color: 'red', textAlign: 'center' }}>
						{props.error}
					</Text>
				</View>
			)}
		</>
	);
}
