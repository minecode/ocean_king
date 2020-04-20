import React from 'react';
import { Platform, View, StatusBar, Dimensions } from 'react-native';
let ModalNative = null;
if (Platform.OS !== 'web') {
	ModalNative = require('react-native-modal').default;
}

export default function Modal(props) {
	const { height, width } = Dimensions.get('window');
	return (
		<>
			{Platform.OS !== 'web' && (
				<ModalNative
					isVisible={props.visible}
					deviceHeight={height + StatusBar.currentHeight}
					coverScreen={false}
					backdropColor={'#212121'}
					backdropOpacity={0.8}>
					{props.content}
				</ModalNative>
			)}
			{Platform.OS === 'web' && props.visible && (
				<View
					style={[
						{
							width: width,
							height: height,
							position: 'absolute',
							alignContent: 'center',
							justifyContent: 'center',
							backgroundColor: '#21212180',
						},
					]}>
					{props.content}
				</View>
			)}
		</>
	);
}
