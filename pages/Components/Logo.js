import React from 'react';
import { View } from 'react-native';
import { Image } from 'react-native-elements';
import styles from '../../style';

export default function Logo(props) {
	return (
		<View style={[styles.row, { justifyContent: 'center' }]}>
			<Image
				source={require('../../assets/ocean_king.png')}
				style={{
					width: 200,
					height: 200,
				}}
				placeholderStyle={{ backgroundColor: 'transparent' }}
			/>
		</View>
	);
}
