import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { AD_MOB_UNIT_ID } from 'react-native-dotenv';
let setTestDeviceIDAsync = null;
let AdMobBanner = null;
if (Platform.OS !== 'web') {
	setTestDeviceIDAsync = require('expo-ads-admob').setTestDeviceIDAsync;
	AdMobBanner = require('expo-ads-admob').AdMobBanner;
}

export default function ADMobBanner(props) {
	useEffect(() => {
		if (Platform.OS !== 'web') {
			setTestDeviceIDAsync('EMULATOR');
		}
	}, []);

	return (
		<>
			{Platform.OS !== 'web' && (
				<AdMobBanner
					bannerSize='fullBanner'
					adUnitID={AD_MOB_UNIT_ID}
					servePersonalizedAds
					bannerSize={'smartBannerLandscape'}
				/>
			)}
		</>
	);
}
