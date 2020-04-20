import { Platform } from 'react-native';

async function getUser(reset, expectReturn = false) {
	let user_temp = null;
	if (Platform.OS !== 'web') {
		user_temp = await AsyncStorage.getItem('@ocean_king:user', null);
		name = await AsyncStorage.getItem('@ocean_king:username', null);
	} else {
		user_temp = localStorage.getItem('@ocean_king:user', null);
		name = localStorage.getItem('@ocean_king:username', null);
	}

	if (!expectReturn) {
		if (user_temp != null) {
			reset({ index: 1, routes: [{ name: 'Home' }] });
		}
	} else {
		if (user_temp !== null && name !== null) {
			return {
				user: user_temp,
				username: name,
			};
		} else {
			reset({ index: 1, routes: [{ name: 'Login' }] });
		}
	}
}

export { getUser };
