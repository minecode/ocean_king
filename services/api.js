import { create } from 'apisauce';

const api = create({
	baseURL: 'https://skull-king-game.herokuapp.com/'
});

api.addAsyncResponseTransform(async response => {
	if (!response.ok) {
		throw response;
	}
});

async function post(endpoint, params) {
	return await api
		.post(endpoint, JSON.stringify(params), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function get(endpoint, params) {
	return await api
		.get(endpoint, params, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function put(endpoint, params) {
	return await api
		.put(endpoint, JSON.stringify(params), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function remove(endpoint, params) {
	return await api
		.delete(endpoint, JSON.stringify(params), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

export { post, get, put, remove };
