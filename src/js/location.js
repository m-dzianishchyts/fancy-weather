// ========== Location logics. ========== ========== ==========
const LOCATION_API_KEY = "d61e260876324cb9a413cbbfc7fc30a2";
const MAPPING_API_KEY = "pk.eyJ1IjoibWF4aWVtYXIiLCJhIjoiY2twYTdnMnBlMHF0ejJubmwxaGMxa2dndiJ9.mgmvit5zyZEKr9WwtK6bQw";

const PLACE_ELEMENT = document.querySelector(".location__place");
const MAP_ELEMENT = document.querySelector("#map");
const COORDINATES_ELEMENT = document.querySelector(".location__coordinates");
const LATITUDE_ELEMENT = document.querySelector(".coordinates__latitude");
const LONGITUDE_ELEMENT = document.querySelector(".coordinates__longitude");
const CITY_FORM = document.querySelector(".search__form");

const LOCATION = { place: "", latitude: "", longitude: "" };

var timeZoneOffset;

async function showPlace(msDelay) {
	PLACE_ELEMENT.style.opacity = 0;
	await delay(msDelay);
	PLACE_ELEMENT.textContent = LOCATION.place;
	PLACE_ELEMENT.style.opacity = 1;
}

async function showCoords(msDelay) {
	COORDINATES_ELEMENT.style.opacity = 0;
	await delay(msDelay);
	LATITUDE_ELEMENT.textContent = convertDecimalDegreesToDmsString(LOCATION.latitude);
	LONGITUDE_ELEMENT.textContent = convertDecimalDegreesToDmsString(LOCATION.longitude);
	COORDINATES_ELEMENT.style.opacity = 1;
}

async function showMap(msDelay) {
	MAP_ELEMENT.style.opacity = 0;
	await delay(msDelay);
	mapboxgl.accessToken = MAPPING_API_KEY;
	let map = new mapboxgl.Map({
		container: 'map', // container ID
		style: 'mapbox://styles/mapbox/dark-v10', // style URL
		center: [LOCATION.longitude, LOCATION.latitude], // starting position [lng, lat]
		interactive: false,
		zoom: 9 // starting zoom
	});
	map.on("load", () => {
		MAP_ELEMENT.style.opacity = 1;
	});
}

async function defineCurrentCoords() {
	const location = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
	LOCATION.latitude = location.coords.latitude;
	LOCATION.longitude = location.coords.longitude;
	document.dispatchEvent(new Event("locationChanged"));
}

async function defineCoordsByCity(inputCity, msDelay) {
	const url = `https://api.opencagedata.com/geocode/v1/json?q=${inputCity}`
		+ `&key=${LOCATION_API_KEY}&language=${locale}&no_annotations=1&limit=1`;
	try {
		const res = await Promise.all([fetch(url), delay(msDelay)]).then((results) => results[0]);
		const data = await res.json();
		const coords = data.results[0].geometry;
		LOCATION.latitude = coords.lat;
		LOCATION.longitude = coords.lng;
		document.dispatchEvent(new Event("locationChanged"));
	} catch (exception) {
		alert(localizedStrings["searchError"][locale])
	}
}

async function makeCityRequest(msDelay) {
	const url = `https://api.opencagedata.com/geocode/v1/geojson?q=${LOCATION.latitude},${LOCATION.longitude}`
		+ `&key=${LOCATION_API_KEY}&language=${locale}`;
	const res = await Promise.all([fetch(url), delay(msDelay)]).then((results) => results[0]);
	const data = await res.json();
	console.log(data);
	const dataComponents = data.features[0].properties.components;
	const city = dataComponents.village ?? dataComponents.town ?? dataComponents.city;
	timeZoneOffset = data.features[0].properties.annotations.timezone.offset_sec;
	LOCATION.place = city + ", " + dataComponents.country;
	document.dispatchEvent(new Event("cityChanged"));
}

function convertDecimalDegreesToDmsString(degrees) {
	const intDegrees = parseInt(degrees);
	const minutes = 60 * (degrees - intDegrees);
	const intMinutes = parseInt(minutes);
	const seconds = 60 * (minutes - intMinutes);
	const intSeconds = parseInt(seconds);
	return intDegrees + "\u00B0 " + intMinutes + "' " + intSeconds + "'' ";
}

CITY_FORM.addEventListener("submit", (event) => {
	defineCoordsByCity(CITY_SEARCH.value, 0);
	event.preventDefault();
	return false;
});
document.addEventListener("localeLoaded", async () => {
	defineCurrentCoords(0);
}, { once: true });
document.addEventListener("locationChanged", async () => {
	await makeCityRequest(0);
	document.dispatchEvent(new Event("propertyChanged"));
})
document.addEventListener("propertyChanged", async () => {
	PLACE_ELEMENT.style.opacity = 0;
	COORDINATES_ELEMENT.style.opacity = 0;
	MAP_ELEMENT.style.opacity = 0;
	await makeCityRequest(0);
	showPlace(1000);
	await showCoords(1000);
	showMap(1000);
});
// ========== End of location logics. ========== ========== ==========