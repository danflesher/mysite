const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherStatus = document.getElementById("weather-status");
const weatherSuggestion = document.getElementById("weather-suggestion");

const PREHEAT_SESSION_KEY = "miseAndMomentumPreheated";
const PREHEAT_DURATION_MS = 1800;

function runPreheatIntro() {
  const preheat = document.getElementById("preheat");
  if (!preheat) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sessionStorage.getItem(PREHEAT_SESSION_KEY) || reduceMotion) {
    preheat.remove();
    return;
  }
  sessionStorage.setItem(PREHEAT_SESSION_KEY, "true");

  const tempEl = document.getElementById("preheat-temp");
  const startTemp = 170;
  const endTemp = 350;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / PREHEAT_DURATION_MS, 1);
    tempEl.textContent = Math.round(startTemp + (endTemp - startTemp) * progress);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    preheat.classList.add("is-hidden");
    setTimeout(() => preheat.remove(), 500);
  }

  preheat.addEventListener("click", dismiss);
  setTimeout(dismiss, PREHEAT_DURATION_MS + 400);
}

runPreheatIntro();

function getWeatherCondition(weatherCode) {
  if (weatherCode === 0) return { emoji: "☀️", label: "Clear skies" };
  if ([1, 2].includes(weatherCode)) return { emoji: "🌤️", label: "Partly cloudy" };
  if (weatherCode === 3) return { emoji: "☁️", label: "Overcast" };
  if ([45, 48].includes(weatherCode)) return { emoji: "🌫️", label: "Foggy" };
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return { emoji: "🌦️", label: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return { emoji: "🌧️", label: "Rainy" };
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return { emoji: "❄️", label: "Snowy" };
  if ([95, 96, 99].includes(weatherCode)) return { emoji: "⛈️", label: "Thunderstorms" };
  return { emoji: "⛅", label: "Current conditions" };
}

const THUNDER_CODES = [95, 96, 99];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];
const RAIN_CODES = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
const FOG_CODES = [45, 48];

function getRecipeSuggestion(temperatureF, weatherCode) {
  if (THUNDER_CODES.includes(weatherCode)) {
    return { text: "Thunder rolling? Stay in with a bowl of carrot risotto.", href: "meals.html" };
  }
  if (SNOW_CODES.includes(weatherCode)) {
    return { text: "Snow day calls for an oven marathon — brioche sticky buns or a pain suisse.", href: "pastries.html" };
  }
  if (RAIN_CODES.includes(weatherCode)) {
    return { text: "Rainy out there — perfect for a slow-simmered pork katsu curry.", href: "meals.html" };
  }
  if (FOG_CODES.includes(weatherCode)) {
    return { text: "Foggy and moody — comfort food weather. Parmesan-crusted chicken over miso mascarpone pasta hits the spot.", href: "meals.html" };
  }
  if (temperatureF <= 45) {
    return { text: "Cold out there — good weather for a slow afternoon of baking, like a chocolate stout cake.", href: "pastries.html" };
  }
  if (temperatureF >= 85) {
    return { text: "Too hot for the oven — the vacherin's your move: chilled meringue, berries, and cr\u00e8me anglaise.", href: "pastries.html" };
  }
  if (temperatureF >= 60 && temperatureF < 85) {
    return { text: "Mild and easy — it's a pizza night.", href: "pizza.html" };
  }
  return { text: "Good weather for whatever sounds good tonight.", href: "#kitchen" };
}

async function loadWeather(latitude, longitude) {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,weather_code",
    temperature_unit: "fahrenheit",
  });

  const response = await fetch(weatherUrl);
  if (!response.ok) throw new Error("Weather request failed");

  const { current } = await response.json();
  const condition = getWeatherCondition(current.weather_code);
  const temperature = Math.round(current.temperature_2m);
  weatherIcon.textContent = condition.emoji;
  weatherTemperature.textContent = `${temperature}°F`;
  weatherStatus.textContent = condition.label;

  const suggestion = getRecipeSuggestion(temperature, current.weather_code);
  weatherSuggestion.innerHTML = "";
  weatherSuggestion.append(`${suggestion.text} `);
  const link = document.createElement("a");
  link.href = suggestion.href;
  link.textContent = "See the kitchen";
  weatherSuggestion.append(link);
}

function showWeatherError(message) {
  weatherIcon.textContent = "⛅";
  weatherStatus.textContent = message;
  weatherSuggestion.textContent = "";
}

if (!navigator.geolocation) {
  showWeatherError("Weather is unavailable in this browser.");
} else {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => loadWeather(coords.latitude, coords.longitude).catch(() => showWeatherError("Weather is unavailable right now.")),
    () => showWeatherError("Allow location access to see today's craving."),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}