import { createStore, combineReducers } from 'redux';

const INITIAL_STATE = {
	socket: null,
	room: null
};

function socket(state = INITIAL_STATE, action) {
	switch (action.type) {
		case 'SET_SOCKET':
			return { ...state, socket: action.socket, room: action.room };
		case 'REMOVE_SOCKET':
			return { ...state, socket: null, room: null };
		default:
			return state;
	}
}

const reducer = combineReducers({ socket: socket });

const store = createStore(reducer);

export default store;
