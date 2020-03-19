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
		red: require('../../assets/cards/red.jpg'),
		blue: require('../../assets/cards/blue.jpg'),
		yellow: require('../../assets/cards/yellow.jpg'),
		black: require('../../assets/cards/black.jpg'),
		flag1: require('../../assets/cards/flag1.jpg'),
		flag2: require('../../assets/cards/flag2.jpg'),
		flag3: require('../../assets/cards/flag3.jpg'),
		flag4: require('../../assets/cards/flag4.jpg'),
		flag5: require('../../assets/cards/flag5.jpg'),
		m1: require('../../assets/cards/m1.jpg'),
		m2: require('../../assets/cards/m2.jpg'),
		p1: require('../../assets/cards/p1.jpg'),
		p2: require('../../assets/cards/p2.jpg'),
		p3: require('../../assets/cards/p3.jpg'),
		p4: require('../../assets/cards/p4.jpg'),
		p5: require('../../assets/cards/p5.jpg'),
		sk: require('../../assets/cards/sk.jpg'),
		0: require('../../assets/cards/v0.png'),
		1: require('../../assets/cards/v1.png'),
		2: require('../../assets/cards/v2.png'),
		3: require('../../assets/cards/v3.png'),
		4: require('../../assets/cards/v4.png'),
		5: require('../../assets/cards/v5.png'),
		6: require('../../assets/cards/v6.png'),
		7: require('../../assets/cards/v7.png'),
		8: require('../../assets/cards/v8.png'),
		9: require('../../assets/cards/v9.png'),
		10: require('../../assets/cards/v10.png'),
		11: require('../../assets/cards/v11.png'),
		12: require('../../assets/cards/v12.png'),
		13: require('../../assets/cards/v13.png'),
		back: require('../../assets/cards/back.png'),
		binary: require('../../assets/cards/binary.jpg'),
		f: require('../../assets/cards/f.png'),
		p: require('../../assets/cards/p.png')
	};
	const opacity = props.overlay ? 0.3 : 1.0;
	return (
		<Image
			source={cards[props.color]}
			style={{ width: 80, height: 130 }}
			containerStyle={{ opacity: opacity }}
			placeholderStyle={{ backgroundColor: 'transparent' }}>
			{(props.color === 'red' ||
				props.color === 'blue' ||
				props.color === 'yellow' ||
				props.color === 'black') && (
				<View>
					<View
						style={{
							marginLeft: 3.5,
							marginTop: 3.5,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 18,
								height: 18
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 58,
							marginTop: 3.5,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 18,
								height: 18
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 58,
							marginTop: 108,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 18,
								height: 18
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 3.5,
							marginTop: 108,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 18,
								height: 18
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
				</View>
			)}
			{props.color == 'binary' && props.value !== '0' && (
				<View>
					<View
						style={{
							marginLeft: 2,
							marginTop: 2,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 22,
								height: 22
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 56,
							marginTop: 2,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 22,
								height: 22
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 56,
							marginTop: 106,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 22,
								height: 22
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
					<View
						style={{
							marginLeft: 2,
							marginTop: 106,
							position: 'absolute'
						}}>
						<Image
							source={cards[props.value]}
							style={{
								width: 22,
								height: 22
							}}
							containerStyle={{ opacity: opacity }}
							placeholderStyle={{
								backgroundColor: 'transparent'
							}}
						/>
					</View>
				</View>
			)}
		</Image>
	);
}
