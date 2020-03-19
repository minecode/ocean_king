import React from 'react';
import HomeScreen from './pages/Home';
import LoginScreen from './pages/Login';
import GameScreen from './pages/Game';
import JoinScreen from './pages/Join';
import RegisterScreen from './pages/Register';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

const Stack = createStackNavigator();

function StackNavigator() {
	return (
		<Stack.Navigator
			initialRouteName='Login'
			screenOptions={{
				headerTintColor: 'white'
			}}>
			<Stack.Screen
				name='Login'
				component={LoginScreen}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='Join'
				component={JoinScreen}
				options={{
					headerStyle: { backgroundColor: '#212121' },
					headerTitleStyle: { color: 'white' },
					title: 'Join game'
				}}
			/>

			<Stack.Screen
				name='Game'
				component={GameScreen}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='Home'
				component={HomeScreen}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='Register'
				component={RegisterScreen}
				options={{
					headerStyle: { backgroundColor: '#212121' },
					headerTitleStyle: { color: 'white' },
					title: 'Register'
				}}
			/>
		</Stack.Navigator>
	);
}

export default StackNavigator;
