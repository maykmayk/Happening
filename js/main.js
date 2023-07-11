import RemoteDataManager from "./RemoteDataManager.js";
import { qs } from "./utils.js";
import GeocodingManager from "./geocodingManager.js";
import eventbriteManager from "./eventbriteManager.js";
import Event from "./Event.js";

const _app = {};

_app.checkPasswordsMatch = () => {
	return qs("#passwordField").value === qs("#passwordCompleteField").value;
};

_app.checkMailValidity = () => {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(qs("#emailField").value)) {
		return true
	} else {
		return false
	}
}

_app.loginForm_submitHandler = event => {
	event.preventDefault();
	event.stopPropagation();
	let pwField = qs("#passwordLoginField");


	const user = {
		email: qs("#emailLoginField").value,
		password: qs("#passwordLoginField").value,
	};
	
	const rdm = new RemoteDataManager();
	rdm.loginUser(user)
	.then (data => {
		console.log((data));

		if (data.payload.rc !== 1) {
			pwField.classList.add("is-invalid");
			_app.snackBarModal("snackbarNeg", "x_2", "Check your credentials");
		} else {
			window.location.replace("/main.html");
		}
	});

	return false;
};

_app.logoRedirect = () => {
    let logo = qs("#logoHead");
    if (userFound) {
        logo.onclick = function() {
            window.location.replace("/main.html");
        }
    } else {
        window.location.replace("/index.html");
    }
}

_app.registrationForm_submitHandler = event => {
	event.preventDefault();
	event.stopPropagation();
	console.log("invio form", event);
	
	let mail = qs("#emailField");

	mail.classList.remove("is-invalid");

	qs("#passwordField").classList.remove("is-invalid");
	qs("#passwordCompleteField").classList.remove("is-invalid");
	qs("#passwordField").classList.remove("is-valid");
	qs("#passwordCompleteField").classList.remove("is-valid");

	if (!_app.checkPasswordsMatch()) {
		qs("#passwordField").classList.add("is-invalid");
		qs("#passwordCompleteField").classList.add("is-invalid");
		setTimeout(() => {
			_app.snackBarModal("snackbarNeg", "x_2", "Password doesn't Match");
		}, 100);
		return;
	}

	if (!_app.checkMailValidity()) {
		qs("#emailField").classList.add("is-invalid");
		return;
	}

	qs("#emailField").classList.add("is-valid");

	qs("#passwordField").classList.add("is-valid");
	qs("#passwordCompleteField").classList.add("is-valid");

	const user = {
		firstName: qs("#usernameField").value,
		lastName: "",
		email: qs("#emailField").value,
		password: qs("#passwordField").value,
		extraData: {
			avatarURL : "https://customers.lineacontinua.net" + _app.lastUploadedFileURL,
		},
	};
	
	const rdm = new RemoteDataManager();
	rdm.registerUser(user)
	.then(data => {
		console.log(data);

		if (data.payload.rc == 1) {
			_app.snackBarModal("snackbarPos", "check", "Succesfully registered");
			rdm.insert(user)
			_app.switchScene()
			// alert("La tua reg è adnata a buon fine");
		} else if (data.payload.rc === 99) {
			_app.snackBarModal("snackbarNeg", "x_2", "Registration gone wrong");
			// alert(data.payload.errors[0].error);
		}
	});
	return false
};

_app.snackBarModal = (state, icon, msg) => {
	let modalCont = document.querySelector("#toastCont");
	let successSnack = document.createElement("div");
	successSnack.classList.add(state, "d-flex", "align-items-center");
	successSnack.innerHTML = '<img src="/asset/images/icons/' + icon + '.svg" class="me-2"><div>' + msg + '</div>';
	modalCont.appendChild(successSnack);
  
	setTimeout(() => {
		successSnack.style.opacity = "0";
		successSnack.style.transition = "all 0.5s ease-in-out";
		successSnack.addEventListener("transitionend", () => {
			modalCont.removeChild(successSnack);
		});
	  }, 3000);
}

_app.pressedButton = () => {
	var header = document.getElementById("grupSearchSect");
	var btns = header.getElementsByClassName("searchSect");
	for (var i = 0; i < btns.length; i++) {
		btns[i].addEventListener("click", function() {
			var current = document.getElementsByClassName("active");
			current[0].className =
			current[0].className.replace("active", "");
			this.className += " active";
		});
	}
}

_app.callApi = (data) => {
	setTimeout(() => {
		if (!data || !data._embedded || !data._embedded.events) {
			console.error('Errore durante la chiamata API: dati non validi.');
			qs("#suggestSection").innerHTML = ""
			qs("#suggestSection").innerHTML += `
			<div class="noResult">
				Result not found.
			</div>
			<div class="noResultSub mt-2">
				Looks like the concert gods<br> are taking the night off.
			</div>`
			return;
		}
		const firstEvents = data._embedded.events;
		if (firstEvents.length > 1) {
			qs("#suggestSection").innerHTML = ""
			for (let i = 0; i < firstEvents.length-1; i++) {
				if (firstEvents[i].name.substring(0, 3) !== firstEvents[i+1].name.substring(0, 3) && firstEvents[i].dates.start.localDate !== firstEvents[i+1].dates.start.localDate) {
				// if (firstEvents[i].id !== firstEvents[i+1].id) {
					const ev = new Event();
					ev.parse(firstEvents[i]);
					qs("#suggestSection").innerHTML += ev.renderCard();
				}
			}
		} else {
			for (let i = 0; i < firstEvents.length; i++) {
				const ev = new Event();
				ev.parse(firstEvents[i]);
				qs("#suggestSection").innerHTML += ev.renderCard();
			}
		}
	}, 500);
	
}

_app.searchEvent = async () => {
	const location = qs("#location_input").value;
	const keyword = qs("#keyword_input").value;
	const gcm = new GeocodingManager();
  
	try {
		let countryCode = "";
		let latitude = 0;
		let longitude = 0;
	
		if (location === "") {
			qs("#suggestSection").innerHTML = ""
			// const src = new SearchEvent();
			// await src.search(`events.json?&keyword=${keyword}`)
			const ebm = new eventbriteManager();
			await ebm.getRemoteData(`events.json?&keyword=${keyword}`)
			.then(data => {
				_app.callApi(data);
			})
		} else {
			const data = await gcm.getRemoteDataGeoCoding(`/geocode/search?text=${location}&lang=en&limit=10&type=city&`);
			if (data.features && data.features.length > 0) {
				latitude = data.features[0].properties.lat;
				longitude = data.features[0].properties.lon;
				countryCode = data.features[0].properties.country_code;
				if (keyword === "") {
					qs("#suggestSection").innerHTML = ""
					const ebm = new eventbriteManager();
					await ebm.getRemoteData(`events.json?&locale=${countryCode}-${countryCode}&latlong=${latitude},${longitude}&radius=10`)
					.then(data => {
						_app.callApi(data);
					})
				} else {
					qs("#suggestSection").innerHTML = ""
					const ebm = new eventbriteManager();
					await ebm.getRemoteData(`events.json?&keyword=${keyword}&locale=${countryCode}-${countryCode}&latlong=${latitude},${longitude}&radius=10`)
					.then(data => {
						_app.callApi(data);
					})
				}
			}
		}
	} catch (error) {
	  console.log(`Errore durante la chiamata all'API:`, error);
	}
}

_app.recommended = async () => {
	let fy = document.querySelector(".searchSect:nth-child(1)");
	let it = document.querySelector(".searchSect:nth-child(2)");
	let week = document.querySelector(".searchSect:nth-child(3)");
	let month = document.querySelector(".searchSect:nth-child(4)");

	function searchEvents(e) {
		const ebm = new eventbriteManager();
		if (e) {
			if (e.target.innerText == "🧭 Near You") {
				if ("geolocation" in navigator) {
					navigator.geolocation.getCurrentPosition(
					(position) => {
						const latitude = position.coords.latitude;
						const longitude = position.coords.longitude;
						qs("#suggestSection").innerHTML = `<img src="/asset/images/loadingGif.gif" class="loadingAnim">`;
						ebm.getRemoteData(`events.json?&locale=it-it&latlong=${latitude},${longitude}&radius=10`)
						.then(data => {
							_app.callApi(data);
						})
					},
					(error) => {
						console.error("Error getting user location:", error);
						qs("#suggestSection").innerHTML += `
						<div class="noResult">
							Geolalization Failed.
						</div>
						<div class="noResultSub mt-2">
						Looks like the geolocalization fairies<br> are on vacation today.
						</div>`
						}
					);
				} else {
					console.error("Geolocation is not supported by this browser.");
				}
			} else if (e.target.innerText == "🔥 Top Picks") {
				qs("#suggestSection").innerHTML = `<img src="/asset/images/loadingGif.gif" class="loadingAnim text-center">`;
				ebm.getRemoteData(`events.json?sort=random`)
				.then(data => {
					_app.callApi(data);
				})
			} else if (e.target.innerText == "📌 This Week") {
				  const today = new Date();
				  const weekTime = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
				  const startDate = today.toISOString().split('T')[0];
				  const endDate = weekTime.toISOString().split('T')[0];
	
				  qs("#suggestSection").innerHTML = `<img src="/asset/images/loadingGif.gif" class="loadingAnim text-center">`;
				  ebm.getRemoteData(`events.json?startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T23:59:59Z`)
				.then(data => {
					_app.callApi(data);
				})
			} else if (e.target.innerText == "🗓️ This Month") {
				  const today = new Date();
				  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
				  const startDate = today.toISOString().split('T')[0];
				  const endDate = lastDayOfMonth.toISOString().split('T')[0];
		  
				  qs("#suggestSection").innerHTML = `<img src="/asset/images/loadingGif.gif" class="loadingAnim text-center">`;
				  ebm.getRemoteData(`events.json?startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T23:59:59Z`)
				.then(data => {
					_app.callApi(data);
				})
			}
		} else {
			if ("geolocation" in navigator) {
				navigator.geolocation.getCurrentPosition(
				(position) => {
					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;
					qs("#suggestSection").innerHTML = `<img src="/asset/images/loadingGif.gif" class="loadingAnim text-center">`;
					ebm.getRemoteData(`events.json?&locale=it-it&latlong=${latitude},${longitude}&radius=10`)
					.then(data => {
						_app.callApi(data);
					})
				},
				(error) => {
					console.error("Error getting user location:", error);
					qs("#suggestSection").innerHTML += `
					<div class="noResult">
						Geolalization Failed.
					</div>
					<div class="noResultSub mt-2">
					Looks like the geolocalization fairies<br> are on vacation today.
					</div>`
					}
				);
			} else {
				console.error("Geolocation is not supported by this browser.");
			}
		}
	}
	searchEvents();
	  
	fy.addEventListener("click", searchEvents);
	it.addEventListener("click", searchEvents);
	week.addEventListener("click", searchEvents);
	month.addEventListener("click", searchEvents);
}

_app.focusSearch = () => {
	let buttonRedirect = qs(".redirectButton")
	let inputFirst = qs("#location_input");
	buttonRedirect.addEventListener("click", redirect);
	function redirect() {
		let offset = 40;
		let rect = inputFirst.getBoundingClientRect(); 
		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		let top = rect.top + scrollTop - offset;
		window.scrollTo({ top, behavior: 'smooth' });
		inputFirst.focus();
	}

	let buttonSearch = qs("#keyword_button")
	let result = qs("#suggestSection")
	buttonSearch.addEventListener("click", resultRedirect);
	function resultRedirect() {
		setTimeout(() => {
			result.scrollIntoView({ behavior: 'smooth' });
		}, 1000)
	} 
}

_app.bookMarkAnimation = () => {
	// animation
	let arrowSide = qs("#arrowSide")
	let rotation = 0;
	arrowSide.addEventListener("click", () => {
	if (rotation === -90) {
		rotation = 0;
		qs("#sideCard").classList.remove("d-none")
	} else {
		rotation = -90;
		qs("#sideCard").classList.add("d-none")
	}
	arrowSide.style.transform = `rotate(${rotation}deg)`;
	});
}

_app.saveCard = (cardData) => {
	const rdm = new RemoteDataManager();
	rdm.getList("card").then(item => {
		const savedCards = item.payload.items;
		console.log(savedCards)
		
		if (savedCards.length > 0) {
			let checkCard = false;
			savedCards.forEach(card => {
				if (card.cardId == cardData.cardId || card.eventName == cardData.eventName) {
					checkCard = true;
				}
			});
			if (checkCard) {
				_app.snackBarModal("snackbarNeg", "x_2", "Alredy Saved");
				return false
			}
		}

		rdm.insert(cardData).then(data => {
				console.log(data);
				if (data.payload.rc == 1) {
					_app.snackBarModal("snackbarPos", "check", "Event Saved!");
					console.log("La carta è stata salvata correttamente.");
					_app.renderCards(data.payload.items);
				}
			});
		})
}

_app.saveSystem = (icon) => {
	const card = icon.closest(".cardEvent");
	const cardId = card.id;
	const eventName = card.querySelector("#eventName").textContent;

	const cardImg = card.querySelector("#cardImg").src;
	const cardSales = card.querySelector("#evSale").src;
	const cardAlert = card.querySelector("#ageAlert").src;
	const eventLink = card.querySelector("#hrefLink").getAttribute("href");
	const eventPrice = card.querySelector("#eventPrice").textContent;
	const cardData = {
		nodeType: "card",
		cardId,
		eventName,
		cardImg,
		cardSales,
		cardAlert,
		eventLink,
		eventPrice
	};

	_app.saveCard(cardData);
	
}

_app.renderCards= (savedCards) => {
	const ev = new Event();

	Object.keys(savedCards).forEach(cardId => {
		const cardData = savedCards[cardId];
		const cardSide = ev.renderCardSide(cardData.cardId, cardData.eventName, cardData.cardImg, cardData.cardSales, cardData.cardAlert, cardData.eventPrice, cardData.eventLink);
		qs("#sideCard").innerHTML += cardSide;
		qs("#savedCardsMob")
		if (qs("#savedCardsMob")) {
			qs("#savedCardsMob").innerHTML += cardSide
		}
	});
}

_app.getSavedCards = () => {
	window.addEventListener("load", () => {
		const rdm = new RemoteDataManager();

		rdm.getList("card").then(data => {
			const savedCards = data.payload.items || [];

			_app.renderCards(savedCards);
		});
	});
}

_app.regAndLogEnd = () => {
	var alredyReg = qs("#alredyReg");
	if (alredyReg) {
		alredyReg.onclick = function() {
			qs("#regForm").classList.remove("d-block");
			qs("#regForm").classList.add("d-none");
			qs("#logForm").classList.remove("d-none");
			qs("#logForm").classList.add("d-block");
		};
	}
	var needReg = qs("#needReg");
	if (needReg) {
		needReg.onclick = function() {
			qs("#regForm").classList.remove("d-none");
			qs("#regForm").classList.add("d-block");
			qs("#logForm").classList.remove("d-block");
			qs("#logForm").classList.add("d-none");
		};
	}

	var registrationForm = qs("#registrationForm");
	if (registrationForm) {
		_app.pictureField = qs("#imgUploadField");
		if (_app.pictureField) {
			_app.pictureField.addEventListener("change", _app.pictureField_changeHandler);
		}
		_app.registrationForm = registrationForm;
		_app.registrationForm.addEventListener("submit", _app.registrationForm_submitHandler);
	}

	var loginForm = qs("#loginForm");
	if (loginForm) {
		_app.loginForm = loginForm;
		_app.loginForm.addEventListener("submit", _app.loginForm_submitHandler);
	}
}

_app.vanillaTilt = () => {
	VanillaTilt.init(document.querySelectorAll(".infoDashboard"), {
		max: 20,
		speed: 400
	});
	VanillaTilt.init(document.querySelector(".buttonBanner"), {
		max: 20,
		speed: 400
	});
	VanillaTilt.init(document.querySelector(".buttonMainSide"), {
		max: 20,
		speed: 400
	});
}

_app.enterButton = event => {
	if (event.key === "Enter") {
		_app.searchEvent();
	}
}

_app.pictureField_changeHandler = event => {
	const rdm = new RemoteDataManager();

	rdm.uploadFiles(event.target)
	.then(data => {
		console.log("uploadFiles", data);
		_app.lastUploadedFileURL = data.payload.items[0].filePath;
	});
};

_app.openSideMenu = () => {
	qs("#mySidenav").style.width = "250px";
	document.body.classList.add("overflow-hidden");
	let overlay = document.createElement("div");
	overlay.classList.add("overlay-2");
	document.body.appendChild(overlay);
  }
  
_app.closeSideMenu = () => {
	qs("#mySidenav").style.width = "0";
	document.body.classList.remove("overflow-hidden");
	let overlay = document.querySelector(".overlay-2");
	if (overlay) {
	  	document.body.removeChild(overlay);
	}
}

_app.buttonsEvent = (event) => {
	if(event.target.classList.contains("iconOnImgBook")){
		console.log("eccolo");
		_app.saveSystem(event.target);
	} else if (event.target.classList.contains("removeEventSide")) {
		let safetyCheck = confirm("Vuoi veramente eliminare l'evento dai salvati?")
		if (safetyCheck) {
			const cardElement = event.target.closest(".cardEventSide");
			const cardId = cardElement.id;
			const rdm = new RemoteDataManager();
			rdm.getList("card").then(item => {
				const savedCards = item.payload.items;
				console.log(savedCards)
				savedCards.forEach(card => {
					if (card.cardId == cardId) {
						rdm.delete(card)
						cardElement.remove()
					}
				})
			})
		} return
	}
}

_app.switchScene = () => {
	qs("#regForm").classList.remove("d-block");
	qs("#regForm").classList.add("d-none");
	qs("#logForm").classList.remove("d-none");
	qs("#logForm").classList.add("d-block");
}

_app.logOut_clickHandler = () => {
	const rdm = new RemoteDataManager();
	rdm.logoutUser()
	.then(data => {
		document.location = "/login.html"
	})
}

_app.moodBubbles = () => {
	let body = qs("body");
	body.classList.add("overflow-hidden")
	let getMeTo = qs("#mainSect")
	getMeTo.scrollIntoView({behavior: 'smooth'}, true);

	let moodBubble = document.getElementById("moodBubble");
	moodBubble.classList.remove("d-none");
	let emojiId = qs("#emojiUser")

	let emojis = ["😊","😴","😍","😎","🤔","🙃"];

	for (var i = 0; i < 6; i++) {
		var colDiv = document.createElement("div");
		colDiv.classList.add("col");
		colDiv.classList.add("emojiBubble");
		moodBubble.appendChild(colDiv);
		colDiv.innerHTML = emojis[i];
		
		colDiv.addEventListener("click", function() {
			emojiId.classList.add("me-1")
			emojiId.innerHTML = this.innerHTML;
			moodBubble.innerHTML = "";
			moodBubble.classList.add("d-none");
			body.classList.remove("overflow-hidden")
		});
	}
}
 
_app.userName = async () => {
	const rdm = new RemoteDataManager();
	let userEmail = "";
	let userName = "";
	let mailUserFieldDash = qs("#mailUser");
	let UserFieldDash = qs("#userNameDash");
	// let mailUserFieldDashMob = qs("#userNameMob");
	// let UserFieldDashMob = qs("#mailUserMob");
	let previewImage = qs("#imgUser");
	let previewImageMob = qs("#imgUserMob");
	
	await rdm.getUserFromToken()
	.then(data => {
		userEmail = data.payload.items[0].email;
		if (userEmail !== undefined) {
			mailUserFieldDash.innerHTML = userEmail
			mailUserMob.innerHTML = userEmail
		}
		userName = data.payload.items[0].firstName;
		if (userName !== undefined) {
			UserFieldDash.innerHTML = userName.toUpperCase()
			userNameMob.innerHTML = userName
		}

		let urlAvatar = data.payload.items[0].extraData.avatarURL;
		if (urlAvatar) {
			previewImage.classList.remove("iconUser");
			previewImage.classList.add("iconUserImg");
			previewImage.src = urlAvatar;

			previewImageMob.classList.remove("iconUser");
			previewImageMob.classList.add("iconUserImg");
			previewImageMob.src = urlAvatar;
		}

		previewImage.addEventListener("click", _app.moodBubbles)
	})
	.catch(error => {
		console.error(error);
	});	

	// let userName = localStorage.getItem("username")
	// UserFieldDash.innerHTML = userName

	
	
}

_app.startUp = () => {
	const rdm = new RemoteDataManager();

	rdm.getUserFromToken()
	.then (data => {
		console.log("getUserFromToken", data);
		_app.dataUser = data
	});

	if (window.location.pathname.includes("login.html")) {
		_app.regAndLogEnd();
	}

	if (window.location.pathname.includes("main.html")) {
		_app.keywordbutton = qs("#keyword_button")
		_app.keywordbutton.addEventListener("click", _app.searchEvent)

		_app.locationInp = qs("#location_input");
		_app.keywordInp = qs("#keyword_input");
		_app.locationInp.addEventListener("keypress", _app.enterButton);
		_app.keywordInp.addEventListener("keypress", _app.enterButton);

		_app.logoutBtn = qs("#logoutBtn")
		_app.logoutBtn.addEventListener("click", _app.logOut_clickHandler)

		_app.openSideMenuBtn = qs("#openMenuMob");
		_app.openSideMenuBtn.addEventListener("click", _app.openSideMenu)

		_app.closeSideMenuBtn = qs("#closebtn");
		_app.closeSideMenuBtn.addEventListener("click", _app.closeSideMenu)
		
		document.addEventListener("click", _app.buttonsEvent);
		_app.recommended();
		_app.focusSearch();
		_app.bookMarkAnimation();
		_app.userName();
		_app.pressedButton();
		_app.getSavedCards();
		_app.vanillaTilt();
	}
};

_app.startUp();
