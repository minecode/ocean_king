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

export default function CreditsScreen(props) {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}></ScrollView>
		</SafeAreaView>
	);
}
