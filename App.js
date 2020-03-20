import React from 'react';
import Navigator from './Navigation';
import { StatusBar, View, AppRegistry, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import store from './store';

function App() {
	return (
		<View style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar backgroundColor='#212121' barStyle='light-content' />
				<NavigationContainer>
					<Provider store={store}>
						<Navigator />
					</Provider>
				</NavigationContainer>
			</SafeAreaProvider>
		</View>
	);
}

AppRegistry.registerComponent('App', () => App);

if (Platform.OS === 'web') {
	AppRegistry.runApplication('App', {
		rootTag: document.getElementById('root')
	});
}

export default App;
