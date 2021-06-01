// ========== Weather logics. ========== ========== ==========
const WEATHER_API_KEY = "b94da00be03839bea7038fe97107e5c7";

const UNITS_KEY = "units";
const UNITS_OPTIONS = document.querySelectorAll(".units__options .units__option");

const DEGREES_TO_UNITS_MAPPER = { c: "metric", f: "imperial" };
const UNITS_TO_DEGREES_MAPPER = { metric: "c", imperial: "f" };

function getUnits() {
	let units = localStorage.getItem(UNITS_KEY);
	units ?? (units = "metric");
	let degrees = UNITS_TO_DEGREES_MAPPER[units];
	UNITS_OPTIONS.forEach(unitsOption => {
		if (unitsOption.textContent == degrees) {
			unitsOption.style.backgroundColor = "#666";
		} else {
			unitsOption.style.backgroundColor = "#888";
		}
	})
	return units;
}

var currentWeather;
var forecast;
var weatherUpdateIntervalId;

const CURRENT_WEATHER_CONTAINER = document.querySelector(".weather__now");
const FORECAST_CONTAINER = document.querySelector(".weather__forecast");

async function makeOneCallWeatherRequest() {
	let url = `https://api.openweathermap.org/data/2.5/onecall`
		+ `?lat=${LOCATION.latitude}&lon=${LOCATION.longitude}`
		+ `&lang=${locale}&units=${units}&appid=${WEATHER_API_KEY}`
		+ '&exclude=minutely,hourly,alerts';
	let res = await fetch(url);
	let data = await res.json();
	currentWeather = data.current;
	forecast = data.daily;
}

async function showCurrentWeather(ms) {
	await delay(ms);
	let timeOfDay = getTimeOfDayOption();
	let iconElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__icon");
	let temperatureElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__temperature");
	let feelsLikeTemperatureElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__feels-like-temperature");
	let windSpeedElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__wind-speed");
	let windDirectionElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__wind-direction");
	let humidityElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__humidity");
	let descriptionElement = CURRENT_WEATHER_CONTAINER.querySelector(".weather__description");
	iconElement.classList.add("wi", `wi-owm-${timeOfDay}-${currentWeather.weather[0].id}`);
	temperatureElement.textContent = parseInt(currentWeather.temp, 10);
	feelsLikeTemperatureElement.textContent = parseInt(currentWeather.feels_like, 10);
	windSpeedElement.textContent = parseInt(currentWeather.wind_speed, 10);
	windDirectionElement.classList.add("wi", "wi-wind", `from-${parseInt(currentWeather.wind_deg, 10)}-deg`);
	humidityElement.textContent = parseInt(currentWeather.humidity);
	descriptionElement.textContent = capitalize(currentWeather.weather[0].description);
}

async function showForecast(ms) {
	await delay(ms);
	let forecastDays = FORECAST_CONTAINER.querySelectorAll(".weather__all-day-forecast");
	for (let i = 0; i < forecastDays.length; i++) {
		const forecastDay = forecastDays[i];
		const forecastDayData = forecast[i + 1];
		let dayOfWeekElement = forecastDay.querySelector(".weather__forecast_day-of-week");
		let temperatureElement = forecastDay.querySelector(".weather__temperature");
		let iconElement = forecastDay.querySelector(".weather__icon");
		dayOfWeekElement.textContent = formatWeekDayFromUtc(forecastDayData.dt * 1000);
		temperatureElement.textContent = parseInt(forecastDayData.temp.day, 10);
		iconElement.classList.add("wi", `wi-owm-day-${forecastDayData.weather[0].id}`);
	}
}

function formatWeekDayFromUtc(utc) {
	let date = getCurrentTimeZoneDate(utc);
	let dayOfWeekFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
	return dayOfWeekFormatter.format(date);
}

function getTimeOfDayOption() {
	let now = getCurrentTimeZoneDate();
	let hours = now.getHours();
	if (hours > 6 && hours < 12) {
		return "day";
	}
	return "night";
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

async function updateWeather() {
	let now = new Date();
	let seconds = now.getSeconds();
	let minutes = now.getMinutes();
	if (minutes === 0 && seconds == 0) {
		CURRENT_WEATHER_CONTAINER.style.opacity = 0;
		await makeOneCallWeatherRequest();
		await showCurrentWeather(0);
		await showForecast(0);
		CURRENT_WEATHER_CONTAINER.style.opacity = 1;
	}
}

function isBlank(str) {
	return !str || /^[\s]*$/.test(str);
}

function setUpUnitsListeners() {
	for (let unitsOption of UNITS_OPTIONS) {
		unitsOption.addEventListener("click", () => {
			localStorage.setItem(UNITS_KEY, DEGREES_TO_UNITS_MAPPER[unitsOption.textContent]);
			units = getUnits();
			document.dispatchEvent(new Event("propertyChanged"));
		})
	}
}

setUpUnitsListeners();
var units = getUnits();
document.addEventListener("propertyChanged", async () => {
	if (weatherUpdateIntervalId !== undefined) {
		clearInterval(weatherUpdateIntervalId);
	}
	CURRENT_WEATHER_CONTAINER.style.opacity = 0;
	FORECAST_CONTAINER.style.opacity = 0;
	await makeOneCallWeatherRequest();
	await showCurrentWeather(1000);
	await showForecast(0);
	CURRENT_WEATHER_CONTAINER.style.opacity = 1;
	FORECAST_CONTAINER.style.opacity = 1;
	weatherUpdateIntervalId = setInterval(updateWeather, 1000);
});
// ========== End of weather logics. ========== ========== ==========