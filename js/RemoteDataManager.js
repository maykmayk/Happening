class RemoteDataManager {
	#remoteURL = "https://customers.lineacontinua.net/api/node-user/";
	#userKey = "m.devita@ied.edu";

	constructor () {

	}

	#createRequest (item = null, nodeType = null) {
		const request = {
			__nctoken__: localStorage.getItem("__nctoken__") || "",
			__ukey__: this.#userKey,
			payload: {},
		};

		if (item !== null) {
			request.payload.item = item;
		}

		if (nodeType !== null) {
			request.payload.filters = {
				nodeType,
			};
		}

		return request;
	}

	delete (itemToDelete) {
		const request = this.#createRequest(itemToDelete);
		return this.#sendRequest("delete", request);
	}

	getList (nodeType = null) {
		const request = this.#createRequest(null, nodeType);
		return this.#sendRequest("get-list", request);
	}

	async getUserFromToken () {
		const request = this.#createRequest();

		return fetch("https://customers.lineacontinua.net/api/session/get-user", {
			body: JSON.stringify(request),
			method: "POST",
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});
	}

	insert (itemToInsert) {
		const request = this.#createRequest(itemToInsert);
		return this.#sendRequest("insert", request);
	}

	async loginUser (user = null) {
		if (user === null) {
			throw new Error("Can't login null user");
		}

		return fetch("https://customers.lineacontinua.net/api/user/login", {
			body: JSON.stringify(this.#createRequest(user)),
			method: "POST",
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			localStorage.setItem("__nctoken__", data.__nctoken__);
			return data;
		})
		.catch(error => {
			console.error(error);
		});
	}

	async logoutUser () {
		const request = this.#createRequest();
		
		return fetch("https://customers.lineacontinua.net/api/session/abandon", {
			body: JSON.stringify(request),
			method: "POST",
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			localStorage.setItem("__nctoken__", "");
			return data;
		})
		.catch(error => {
			console.error(error);
		});
	}

	async registerUser (user = null) {
		if (user === null) {
			throw new Error("Can't insert null item");
		}

		return fetch("https://customers.lineacontinua.net/api/user/register", {
			body: JSON.stringify(this.#createRequest(user)),
			method: "POST",
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});
	}

	#sendRequest (endPoint, request) {
		return fetch(`${this.#remoteURL}${endPoint}`, {
			body: JSON.stringify(request),
			method: "POST",
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			// console.log({data});
			return data;
		})
		.catch(err => {
			console.error(err);
			alert("Mi spiace, si è verificato un errore, è sicuramente colpa tua.");
		});
	}

	update (itemToUpdate) {
		const request = this.#createRequest(itemToUpdate);
		return this.#sendRequest("update", request);
	}

	async uploadFiles (input) {
		const url = "https://customers.lineacontinua.net/api/user/upload-profile-picture";
		const files = input.files;
		const formData = new FormData();

		formData.append("destFolder", input.dataset.destFolder || "");
		formData.append("saveName", input.dataset.saveName || "");
		
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			formData.append("files[]", file);
		}

		const clientId = localStorage.getItem("NousCore.api.clientId") || "NA";
		const accessToken = localStorage.getItem("__nctoken__") || "NA";
		const requestToken = localStorage.getItem("__nctoken__") || "";
		const userKey = this.#userKey || "";
		
		const timestamp = new Date().getTime();

		formData.append("__nctoken__", requestToken);
		formData.append("__ukey__", userKey);
		formData.append("payload[clientId]", clientId);
		formData.append("payload[accessToken]", accessToken);
		formData.append("payload[timestamp]", timestamp);

		const response = await fetch(url, {
			method: "POST",
			body: formData
		});
		
		const jsonData = await response.json();

		return jsonData;
	}
}

export default RemoteDataManager;