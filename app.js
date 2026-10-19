const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherStatus = document.getElementById("weather-status");
const weatherSuggestion = document.getElementById("weather-suggestion");

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

// TODO: swap these placeholder links for real recipe pages once they exist.
const RAIN_SNOW_CODES = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];

function getRecipeSuggestion(temperatureF, weatherCode) {
  if (RAIN_SNOW_CODES.includes(weatherCode)) {
    return { text: "Rainy day calls for a loaf of bread and something simmering.", href: "#kitchen" };
  }
  if (temperatureF <= 45) {
    return { text: "Cold out there — perfect weather for slow-baked pastries.", href: "#kitchen" };
  }
  if (temperatureF >= 85) {
    return { text: "Too hot to bake — lean into a no-cook, fridge-chilled dessert.", href: "#kitchen" };
  }
  if (temperatureF >= 60 && temperatureF < 85) {
    return { text: "Mild and easy — it's a pizza night.", href: "#kitchen" };
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