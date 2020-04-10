import React, { useEffect } from 'react';
import { View } from 'react-native';
import styles from '../../style';
import { SafeAreaView } from 'react-native-safe-area-context';
import ADMobBanner from '../Components/ADMobBanner';
import Version from '../Components/Version';
import Title from '../Components/Title';
import GoogleLogin from '../Components/GoogleLogin';
import Logo from '../Components/Logo';
import CreatedBy from '../Components/CreatedBy';

import { getUser } from '../../utils';

export default function LoginScreen(props) {
	const { reset } = props.navigation;

	useEffect(() => {
		getUser(reset);
	}, []);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ADMobBanner />

			<View style={styles.container}>
				<Logo />
				<Title title={'Login'} />
				<GoogleLogin reset={reset} />
				<CreatedBy />
			</View>

			<Version />
		</SafeAreaView>
	);
}
