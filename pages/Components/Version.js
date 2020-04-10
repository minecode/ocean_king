import React from 'react';
import { View, Text, Platform } from 'react-native';
import styles from '../../style';

export default function Version(props) {
	return (
		<View
			style={[
				styles.row,
				{
					justifyContent: 'flex-start',
					marginBottom: 20,
				},
			]}>
			<Text style={{ color: '#a1a1a1' }}>
				{Platform.OS === 'web' && 'web'} v202004101500
			</Text>
		</View>
	);
}
