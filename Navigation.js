import React from 'react';
import HomeScreen from './pages/Home';
import LoginScreen from './pages/Login';
import GameScreen from './pages/Game';
import JoinScreen from './pages/Join';
import ChatScreen from './pages/Chat';
import RulesScreen from './pages/Rules';
import CreditsScreen from './pages/Credits';
import SettingsScreen from './pages/Settings';
import PontuationsScreen from './pages/Pontuations';
import ScoreboardsScreen from './pages/Scoreboards';
import ProfileScreen from './pages/Profile';
import RoundsScreen from './pages/Rounds';
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators, HeaderStyleInterpolators, TransitionPresets } from '@react-navigation/stack';

const Stack = createStackNavigator();

const config = TransitionSpecs.FadeOutToBottomAndroidSpec;

export default function StackNavigator() {
	return (
		<Stack.Navigator
			initialRouteName='Login'
			screenOptions={{
				headerTintColor: 'white',
				...TransitionPresets.RevealFromBottomAndroid,
			}}
			>
			<Stack.Screen
				name='Login'
				component={LoginScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name='Join'
				component={JoinScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Join game',
				}}
			/>
			<Stack.Screen
				name='Chat'
				component={ChatScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Chat',
				}}
			/>
			<Stack.Screen
				name='Rules'
				component={RulesScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Rules',
				}}
			/>
			<Stack.Screen
				name='Credits'
				component={CreditsScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Credits',
				}}
			/>
			<Stack.Screen
				name='Settings'
				component={SettingsScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Options',
				}}
			/>
			<Stack.Screen
				name='Scoreboards'
				component={ScoreboardsScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Scoreboards',
				}}
			/>
			<Stack.Screen
				name='Game'
				component={GameScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name='Home'
				component={HomeScreen}
				options={{
					headerShown: false,
				}}
				
			/>
			<Stack.Screen
				name='Pontuations'
				component={PontuationsScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Scores',
				}}
			/>
			<Stack.Screen
				name='Profile'
				component={ProfileScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Profile',
				}}
			/>
			<Stack.Screen
				name='Rounds'
				component={RoundsScreen}
				options={{
					headerStyle: {
						backgroundColor: '#212121',
					},
					headerTitleStyle: { color: 'white' },
					title: 'Rounds',
				}}
			/>
		</Stack.Navigator>
	);
}

