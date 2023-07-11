// eslint-disable-next-line no-unused-vars
function betterRandom (min = 0, max = 1) {
	return Math.random() * max;
} 

function betterRandomInt (min = 0, max = 1) {
	return Math.round(betterRandom(min, max));
}

function qs (selector) {
	return document.querySelector(selector);
}

function qsa (selector) {
	return document.querySelectorAll(selector);
}

function getBase64(file) {
	return new Promise((resolve, reject) => {
	  const reader = new FileReader();
	  reader.readAsDataURL(file);
	  reader.onload = () => resolve(reader.result);
	  reader.onerror = error => reject(error);
	});
}
  

export { betterRandom, betterRandomInt, qs, qsa, getBase64};