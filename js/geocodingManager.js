class GeocodingManager {
    #apiURL = "https://api.geoapify.com/v1";
    #token = "apiKey=b1726e14955a43ffb29e9b9894352432";
  
    constructor() {}
  
    async getRemoteDataGeoCoding(path) {
      const response = await fetch(this.#apiURL + path + this.#token);
      const data = await response.json();
  
      return data;
    }
  }
  
  export default GeocodingManager;