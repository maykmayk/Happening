class eventbriteManager {
	#apiURL = "https://app.ticketmaster.com/discovery/v2/";
	#token = "&size=100&apikey=cYxVnbIXpd4x2Alq2kRUPmmbpVBxpWDG"

    constructor () {

	}
	
	async getRemoteData (path) {
		return fetch(this.#apiURL + path + this.#token)
		.then(response => response.json())
		.then(json => {
			console.log(json);
			return json;
			// Parse the response.
			// Do other things.
		})
		.catch(error => console.error("Error:", error));
	}
    
}

export default eventbriteManager;