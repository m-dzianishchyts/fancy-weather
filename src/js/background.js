// ========== Background logic ========== ========== ==========
const IMAGES_API_KEY = "-Xovq0IzFSnWpdPo5d1pc56BMCK5wO3RiQ7dsudNBAo";
const BACKGROUND_ELEMENT = document.querySelector(".background");
const REFRESH_BUTTON = document.querySelector(".refresh-button");

var backgroundUrl;

function defineTimeOfDay(hours) {
	if (hours < 6) {
		return "night";
	}
	if (hours < 12) {
		return "morning";
	}
	if (hours < 18) {
		return "afternoon";
	}
	return "evening";
}

function defineSeason(date) {
	let month = date.getMonth();
	if (month == 11 || month < 2) {
		return "winter";
	}
	if (month < 5) {
		return "spring";
	}
	if (month < 8) {
		return "summer";
	}
	return "fall";
}

async function makeBackgroundRequest(hours, season) {
	let timeOfDay = defineTimeOfDay(hours);
	let query = `nature,${season},${timeOfDay}`;
	console.log("Background query: " + query);
	let url = "https://api.unsplash.com/photos/random?orientation=landscape"
		+ `&query=${query}&fit=crop&w=1920&h=1080&client_id=${IMAGES_API_KEY}`;
	try {
		let res = await fetch(url);
		let data = await res.json();
		let imgProperties = "&fm=jpg&fit=crop&w=1920&h=1080&q=80";
		backgroundUrl = data.urls.raw + imgProperties;
		BACKGROUND_ELEMENT.dispatchEvent(new Event("backgroundChanged"));
	} catch (exception) {
		alert("Unsplash API usage limit reached.");
	}
}

function loadBackground() {
	let newBackground = new Image();
	newBackground.src = backgroundUrl;
	let icon = REFRESH_BUTTON.querySelector(".icon-refresh");
	icon.classList.add("rotate");
	newBackground.onload = function () {
		console.log(newBackground);
		BACKGROUND_ELEMENT.style.backgroundImage = `url(${newBackground.src})`;
		icon.classList.remove("rotate");
	};
}

function updateBackground() {
	let now = getCurrentTimeZoneDate();
	let seconds = now.getSeconds();
	let minutes = now.getMinutes();
	if (minutes === 0 && seconds == 0) {
		let hours = now.getHours();
		let season = defineSeason(now);
		makeBackgroundRequest(hours, season)
	}
}

function initBackground() {
	let now = timeZoneOffset !== undefined ? getCurrentTimeZoneDate() : new Date();
	let hours = now.getHours();
	let season = defineSeason(now);
	makeBackgroundRequest(hours, season)
}

document.addEventListener("DOMContentLoaded", () => {
	initBackground();
	setInterval(updateBackground, 1000);
});
BACKGROUND_ELEMENT.addEventListener("backgroundChanged", loadBackground);
REFRESH_BUTTON.addEventListener("click", initBackground);
// ========== End of Background logic. ========== ========== ==========