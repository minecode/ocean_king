import React from 'react';
import { TouchableOpacity, Text, Platform, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';

export default function Button(props) {
	const { width } = Dimensions.get('window');

	return (
		<TouchableOpacity
			style={{
				backgroundColor: props.firstColor,
				height: props.small ? 40 : 50,
				width: props.small
					? 40
					: Platform.OS === 'web'
					? 240
					: (width - 45) / 2,
				borderRadius: 25,
				marginLeft: Platform.OS === 'web' ? 10 : 10,
				marginRight: Platform.OS === 'web' ? 10 : 10,
				marginVertical: 10,
				alignItems: 'center',
				justifyContent: 'center',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.8,
				shadowRadius: 2,
				elevation: 5,
				flexDirection: 'row',
			}}
			onPress={props.action}>
			{props.icon && (
				<Icon
					name={props.icon}
					color={props.secondColor}
					type='font-awesome'
					iconStyle={{ margin: 10 }}
				/>
			)}
			{props.text && (
				<Text
					style={{
						color: props.secondColor,
						margin: 5,
						fontWeight: 'bold',
					}}>
					{props.text}
				</Text>
			)}
		</TouchableOpacity>
	);
}
