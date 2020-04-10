import React from 'react';
import { SafeAreaView } from 'react-native';
import Pontuations from '../Components/Pontuations';

export default function PontuationsScreen(props) {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<Pontuations pontuations={props.route.params.pontuations} />
		</SafeAreaView>
	);
}
