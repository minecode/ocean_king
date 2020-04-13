import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import styles from '../../style';

export default function ProfileScreen(props) {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View style={[styles.row, { justifyContent: 'center' }]}>
					<Icon
						name='spinner'
						color={'#f1f1f1'}
						type='font-awesome'
						size={18}
						iconStyle={{
							margin: 10,
						}}
					/>
					<Text style={{ color: '#f1f1f1', fontSize: 30 }}>
						Coming soon...
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
