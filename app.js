const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherStatus = document.getElementById("weather-status");

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
  weatherIcon.textContent = condition.emoji;
  weatherTemperature.textContent = `${Math.round(current.temperature_2m)}°F`;
  weatherStatus.textContent = condition.label;
}

function showWeatherError(message) {
  weatherIcon.textContent = "⛅";
  weatherStatus.textContent = message;
}

if (!navigator.geolocation) {
  showWeatherError("Weather is unavailable in this browser.");
} else {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => loadWeather(coords.latitude, coords.longitude).catch(() => showWeatherError("Weather is unavailable right now.")),
    () => showWeatherError("Allow location access to see local weather."),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}