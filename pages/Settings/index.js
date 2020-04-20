import React, { useState, useEffect } from 'react';

import {
	View,
	TouchableOpacity,
	Text,
	ScrollView,
	Dimensions,
	Platform,
	Keyboard,
	RefreshControl,
} from 'react-native';
let AsyncStorage = null;
let Modal = null;
if (Platform.OS !== 'web') {
	AsyncStorage = require('react-native').AsyncStorage;
	Modal = require('react-native-modal').default;
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Input } from 'react-native-elements';
import styles from '../../style';
import { get } from '../../services/api';
import * as GoogleSignIn from 'expo-google-sign-in';

export default function SettingsScreen(props) {
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const { navigate, reset } = props.navigation;
	const { width } = Dimensions.get('window');
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 20,
							marginVertical: 5,
							marginTop: 20,
							justifyContent: 'flex-start',
						},
					]}>
					<TouchableOpacity
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						}}
						onPress={async () => {
							navigate('Profile');
						}}>
						<Icon
							name='user'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold',
							}}>
							Profile
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 20,
							marginVertical: 5,
							justifyContent: 'flex-start',
						},
					]}>
					<TouchableOpacity
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						}}
						onPress={async () => {
							navigate('Rules');
						}}>
						<Icon
							name='list'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold',
							}}>
							Rules
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 20,
							marginVertical: 5,
							justifyContent: 'flex-start',
						},
					]}>
					<TouchableOpacity
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						}}
						onPress={async () => {
							navigate('Credits');
						}}>
						<Icon
							name='copyright'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold',
							}}>
							Credits
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={[
						styles.row,
						{
							marginHorizontal: 20,
							marginVertical: 5,
							justifyContent: 'flex-start',
						},
					]}>
					<TouchableOpacity
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						}}
						onPress={async () => {
							setLoading(true);
							if (__DEV__) {
								console.log('Logout');
							} else {
								try {
									await GoogleSignIn.disconnectAsync();
								} catch (err) {
									setError(err.message);
								}
							}

							if (Platform.OS !== 'web') {
								await AsyncStorage.removeItem(
									'@ocean_king:user'
								);
								await AsyncStorage.removeItem(
									'@ocean_king:username'
								);
							} else {
								localStorage.removeItem('@ocean_king:user');
								localStorage.removeItem('@ocean_king:username');
							}
							setLoading(false);
							reset({
								index: 1,
								routes: [{ name: 'Login' }],
							});
						}}>
						<Icon
							name='sign-out'
							color={'white'}
							type='font-awesome'
							iconStyle={{ margin: 10 }}
						/>
						<Text
							style={{
								color: 'white',
								margin: 5,
								fontWeight: 'bold',
							}}>
							Logout
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
