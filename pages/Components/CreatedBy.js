import React from 'react';
import { View, TouchableOpacity, Linking, Text } from 'react-native';
import styles from '../../style';

export default function CreatedBy(props) {
	return (
		<View style={[styles.row, { justifyContent: 'center', marginTop: 20 }]}>
			<TouchableOpacity
				onPress={() => {
					Linking.openURL('https://github.com/fabiohfab');
				}}>
				<Text style={{ color: '#f1f1f1' }}>
					Created by Fábio Henriques
				</Text>
			</TouchableOpacity>
		</View>
	);
}
