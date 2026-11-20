// Server-side helper: city name -> coordinates -> weather.
// Runs only inside the API route, so the browser never talks to Open-Meteo directly.
import { describeWeather } from "./weatherCodes.js";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 10000;

// Error that carries an HTTP status + a user-friendly title/message
export class WeatherError extends Error {
  constructor(status, title, message) {
    super(message);
    this.status = status;
    this.title = title;
  }
}

const CITY_PATTERN = /^[\p{L}\p{M}\s.,'-]+$/u;

export function validateCity(raw) {
  const city = (raw ?? "").trim();
  if (!city) {
    throw new WeatherError(400, "Please enter a city", "Type a city name in the search box first.");
  }
  if (city.length > 80 || !CITY_PATTERN.test(city)) {
    throw new WeatherError(
      400,
      "Invalid city name",
      "City names should contain only letters, spaces, and characters like - ' . ,"
    );
  }
  return city;
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      throw new WeatherError(
        504,
        "Request timed out",
        "The weather service took too long to respond. Please try again."
      );
    }
    throw new WeatherError(
      502,
      "Couldn't reach the weather service",
      "The weather service is unreachable right now. Please try again later."
    );
  }

  if (!response.ok) {
    throw new WeatherError(
      502,
      "Weather data unavailable",
      `The weather service returned an error (HTTP ${response.status}). Please try again later.`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherError(502, "Unexpected response", "The weather service sent data we couldn't read.");
  }
}

const GEO_GET_URL = "https://geocoding-api.open-meteo.com/v1/get";

function toPlace(p) {
  return {
    id: p.id,
    name: p.name,
    region: [p.admin1, p.country].filter(Boolean).join(", "),
    countryCode: p.country_code ?? null,
    latitude: p.latitude,
    longitude: p.longitude,
  };
}

// Up to `count` matching places, for search suggestions
export async function searchCities(rawQuery, count = 6) {
  const query = (rawQuery ?? "").trim();
  if (query.length < 2 || query.length > 80 || !CITY_PATTERN.test(query)) return [];
  const params = new URLSearchParams({ name: query, count: String(count), language: "en", format: "json" });
  const data = await fetchJson(`${GEO_URL}?${params}`);
  return (data?.results ?? []).map(toPlace);
}

async function findCity(city) {
  const params = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const data = await fetchJson(`${GEO_URL}?${params}`);
  const place = data?.results?.[0];
  if (!place) {
    throw new WeatherError(404, "City not found", `We couldn't find "${city}". Check the spelling and try again.`);
  }
  return toPlace(place);
}

async function findPlaceById(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new WeatherError(400, "Invalid location", "That location link isn't valid. Try searching instead.");
  }
  let data;
  try {
    data = await fetchJson(`${GEO_GET_URL}?id=${id}`);
  } catch (err) {
    // Open-Meteo answers unknown ids with an HTTP error
    if (err instanceof WeatherError && err.status === 502 && err.title === "Weather data unavailable") {
      throw new WeatherError(404, "Location not found", "We couldn't find that location. Try searching instead.");
    }
    throw err;
  }
  if (!data?.id) {
    throw new WeatherError(404, "Location not found", "We couldn't find that location. Try searching instead.");
  }
  return toPlace(data);
}

function parseCoords(rawLat, rawLon) {
  const latitude = Number(rawLat);
  const longitude = Number(rawLon);
  if (
    rawLat === null || rawLon === null || rawLat === "" || rawLon === "" ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180
  ) {
    throw new WeatherError(400, "Invalid coordinates", "Latitude must be -90 to 90 and longitude -180 to 180.");
  }
  return { latitude, longitude };
}

async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    hourly: "temperature_2m,weather_code,is_day,precipitation_probability",
    forecast_hours: "24",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "uv_index_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });
  const data = await fetchJson(`${FORECAST_URL}?${params}`);
  if (!data?.current || !data?.daily?.time?.length) {
    throw new WeatherError(
      502,
      "Weather data unavailable",
      "The forecast for this location is incomplete. Try another city."
    );
  }
  return data;
}

// Turns the raw Open-Meteo responses into the clean shape the UI uses
function shapeResponse(place, data) {
  const c = data.current;
  const u = data.current_units ?? {};
  const d = data.daily;
  const h = data.hourly ?? {};
  const current = describeWeather(c.weather_code);

  return {
    location: {
      id: place.id ?? null,
      name: place.name,
      region: place.region,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: data.timezone,
    },
    current: {
      time: c.time,
      isDay: c.is_day === 1,
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      description: current.description,
      icon: current.icon,
      units: {
        temperature: u.temperature_2m ?? "°C",
        windSpeed: u.wind_speed_10m ?? "km/h",
        pressure: u.pressure_msl ?? "hPa",
      },
    },
    today: {
      max: d.temperature_2m_max?.[0] ?? null,
      min: d.temperature_2m_min?.[0] ?? null,
      sunrise: d.sunrise?.[0] ?? null,
      sunset: d.sunset?.[0] ?? null,
      precipitationChance: d.precipitation_probability_max?.[0] ?? null,
      uvIndex: d.uv_index_max?.[0] ?? null,
    },
    // Next 24 hours, starting with the current hour
    hourly: (h.time ?? []).map((time, i) => {
      const w = describeWeather(h.weather_code?.[i]);
      return {
        time,
        temperature: h.temperature_2m?.[i],
        isDay: h.is_day?.[i] === 1,
        precipitationChance: h.precipitation_probability?.[i] ?? null,
        description: w.description,
        icon: w.icon,
      };
    }),
    // Skip index 0 (today) -> next 6 days
    forecast: d.time.slice(1).map((date, i) => {
      const idx = i + 1;
      const w = describeWeather(d.weather_code[idx]);
      return {
        date,
        max: d.temperature_2m_max[idx],
        min: d.temperature_2m_min[idx],
        precipitationChance: d.precipitation_probability_max?.[idx] ?? null,
        description: w.description,
        icon: w.icon,
      };
    }),
  };
}

async function weatherFor(place) {
  const data = await fetchForecast(place.latitude, place.longitude);
  return shapeResponse(place, data);
}

export async function getWeatherForCity(rawCity) {
  return weatherFor(await findCity(validateCity(rawCity)));
}

export async function getWeatherForPlaceId(rawId) {
  return weatherFor(await findPlaceById(rawId));
}

export async function getWeatherForCoords(rawLat, rawLon) {
  const { latitude, longitude } = parseCoords(rawLat, rawLon);
  return weatherFor({ id: null, name: "Your location", region: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, latitude, longitude });
}
