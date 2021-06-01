// =========== Locale logics. =========== =========== ===========
const LOCALE_KEY = "locale";
const LOCALE_SELECT = document.querySelector(".locale-select");

const MAIN_ELEMENT = document.querySelector(".main");
const CITY_SEARCH = document.querySelector(".search__city");
const CITY_SUBMIT = document.querySelector(".search__submit");
const WEATHER_FEELS_LIKE_TEMP_LABEL = document.querySelector(".weather__feels-like-temperature_wrapper .label");
const WEATHER_WIND_LABEL = document.querySelector(".weather__wind_wrapper .label");
const WEATHER_HUMIDITY_LABEL = document.querySelector(".weather__humidity_wrapper .label");
const WEATHER_WIND_SPEED_UNIT = document.querySelector(".weather__wind-speed_unit");
const LOCATION_LATITUDE_LABEL = document.querySelector(".coordinates__latitude_wrapper .label");
const LOCATION_LONGITUDE_LABEL = document.querySelector(".coordinates__longitude_wrapper .label");

const UNITS_TO_SPEED_MAPPER = { metric: "mps", imperial: "mph" }

function getUnitsLocale() {
	let units = localStorage.getItem("units");
	units ?? (units = "metric");
	return units;
}

function getLocale() {
	let locale = localStorage.getItem(LOCALE_KEY);
	locale ?? (locale = "en");
	return locale;
}

var localizedStrings = {
	feelsLike: {
		"en": "Feels like",
		"ru": "Ощущается как"
	},
	wind: {
		"en": "Wind",
		"ru": "Ветер"
	},
	mps: {
		"en": "m/s",
		"ru": "м/с"
	},
	mph: {
		"en": "m/h",
		"ru": "миль/ч"
	},
	humidity: {
		"en": "Humidity",
		"ru": "Влажность"
	},
	search: {
		"en": "Search",
		"ru": "Поиск"
	},
	citySearchPlaceholder: {
		"en": "Search city",
		"ru": "Введите название города"
	},
	latitude: {
		"en": "Latitude",
		"ru": "Широта"
	},
	longitude: {
		"en": "Longitude",
		"ru": "Долгота"
	},
	searchError: {
		"en": "An error occurred while searching for the city. Check the input or try again later.",
		"ru": "Во время поиска города произошла ошибка. Проверьте введённые данные или попробуйте позже."
	}
}

async function setLocalizedStrings(msDelay) {
	MAIN_ELEMENT.style.opacity = 0;
	await delay(msDelay);
	CITY_SEARCH.placeholder = localizedStrings["citySearchPlaceholder"][locale];
	CITY_SUBMIT.value = localizedStrings["search"][locale];
	WEATHER_FEELS_LIKE_TEMP_LABEL.textContent = localizedStrings["feelsLike"][locale] + ":";
	WEATHER_WIND_LABEL.textContent = localizedStrings["wind"][locale] + ":";
	WEATHER_WIND_SPEED_UNIT.textContent = localizedStrings[UNITS_TO_SPEED_MAPPER[getUnitsLocale()]][locale];
	WEATHER_HUMIDITY_LABEL.textContent = localizedStrings["humidity"][locale] + ":";
	LOCATION_LATITUDE_LABEL.textContent = localizedStrings["latitude"][locale] + ":";
	LOCATION_LONGITUDE_LABEL.textContent = localizedStrings["longitude"][locale] + ":";
	MAIN_ELEMENT.style.opacity = 1;
}

LOCALE_SELECT.addEventListener("change", (event => {
	let newLocale = event.target.value;
	if (newLocale != null) {
		locale = newLocale;
		localStorage.setItem(LOCALE_KEY, locale);
		document.dispatchEvent(new Event("localeChanged"));
	}
}));

var locale = getLocale();
LOCALE_SELECT.value = locale;
document.addEventListener("DOMContentLoaded", () => {
	setLocalizedStrings(0);
	document.dispatchEvent(new Event("localeLoaded"));
}, { once: true });
document.addEventListener("localeChanged", () => {
	setLocalizedStrings(1000);
	document.dispatchEvent(new Event("propertyChanged"));
});
// =========== End of locale logics. =========== ===========
