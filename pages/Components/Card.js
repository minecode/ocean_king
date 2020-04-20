import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import styles from '../../style';
import { post, get, put, remove } from '../../services/api';
import store from '../../store';
import { Image } from 'react-native-elements';

export default function Card(props) {
	let cards = {
		red: require('../../assets/cards/cards/red.png'),
		blue: require('../../assets/cards/cards/blue.png'),
		yellow: require('../../assets/cards/cards/yellow.png'),
		black: require('../../assets/cards/cards/black.png'),
		flag1: require('../../assets/cards/cards/flag.png'),
		flag2: require('../../assets/cards/cards/flag.png'),
		flag3: require('../../assets/cards/cards/flag.png'),
		flag4: require('../../assets/cards/cards/flag.png'),
		flag5: require('../../assets/cards/cards/flag.png'),
		m1: require('../../assets/cards/cards/mermaid_1.png'),
		// m1: require('../../assets/cards/m1.jpg'),
		m2: require('../../assets/cards/cards/mermaid_2.png'),
		// m2: require('../../assets/cards/m2.jpg'),
		p1: require('../../assets/cards/cards/pirate_1.png'),
		// p1: require('../../assets/cards/p1.jpg'),
		p2: require('../../assets/cards/cards/pirate_2.png'),
		// p2: require('../../assets/cards/p2.jpg'),
		p3: require('../../assets/cards/cards/pirate_3.png'),
		// p3: require('../../assets/cards/p3.jpg'),
		p4: require('../../assets/cards/cards/pirate_1.png'),
		// p4: require('../../assets/cards/p4.jpg'),
		p5: require('../../assets/cards/cards/pirate_2.png'),
		// p5: require('../../assets/cards/p5.jpg'),
		sk: require('../../assets/cards/cards/king.png'),
		// sk: require('../../assets/cards/sk.jpg'),
		1: require('../../assets/cards/cards/v1.png'),
		2: require('../../assets/cards/cards/v2.png'),
		3: require('../../assets/cards/cards/v3.png'),
		4: require('../../assets/cards/cards/v4.png'),
		5: require('../../assets/cards/cards/v5.png'),
		6: require('../../assets/cards/cards/v6.png'),
		7: require('../../assets/cards/cards/v7.png'),
		8: require('../../assets/cards/cards/v8.png'),
		9: require('../../assets/cards/cards/v9.png'),
		10: require('../../assets/cards/cards/v10.png'),
		11: require('../../assets/cards/cards/v11.png'),
		12: require('../../assets/cards/cards/v12.png'),
		13: require('../../assets/cards/cards/v13.png'),
		back: require('../../assets/cards/back.png'),
		binary: require('../../assets/cards/cards/scary_mary.png'),
		// binary: require('../../assets/cards/binary.jpg'),
		f: require('../../assets/cards/cards/f.png'),
		// f: require('../../assets/cards/f.png'),
		p: require('../../assets/cards/cards/p.png'),
		// p: require('../../assets/cards/p.png'),
	};
	const opacity = props.overlay ? 0.3 : 1.0;
	return (
		<Image
			source={cards[props.color]}
			style={{
				width: 75.9,
				height: 124.2,
			}}
			// style={{ width: 80, height: 130 }}
			containerStyle={{
				opacity: opacity,
			}}
			placeholderStyle={{ backgroundColor: 'transparent' }}>
			{(props.color === 'red' ||
				props.color === 'blue' ||
				props.color === 'yellow' ||
				props.color === 'black') && (
				<View>
					<View
						style={{
							marginLeft: 2.5,
							marginTop: 3,
							position: 'absolute',
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 20.3,
								height: 20.3,
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent',
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 54.2,
							marginTop: 102,
							position: 'absolute',
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 20.3,
								height: 20.3,
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent',
							}}
						/>
					</View>
				</View>
			)}
			{props.color == 'binary' && props.value !== '0' && (
				<View>
					<View
						style={{
							marginLeft: 2.5,
							marginTop: 3,
							position: 'absolute',
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 20.3,
								height: 20.3,
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent',
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 54.2,
							marginTop: 102,
							position: 'absolute',
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 20.3,
								height: 20.3,
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent',
							}}
						/>
					</View>
				</View>
			)}
		</Image>
	);
}
