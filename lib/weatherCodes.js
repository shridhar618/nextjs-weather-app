// WMO weather codes used by Open-Meteo -> [description, icon type]
// https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
export const WEATHER_CODES = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "partly"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"],
  48: ["Depositing rime fog", "fog"],
  51: ["Light drizzle", "drizzle"],
  53: ["Moderate drizzle", "drizzle"],
  55: ["Dense drizzle", "drizzle"],
  56: ["Light freezing drizzle", "drizzle"],
  57: ["Dense freezing drizzle", "drizzle"],
  61: ["Slight rain", "rain"],
  63: ["Moderate rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Light freezing rain", "rain"],
  67: ["Heavy freezing rain", "rain"],
  71: ["Slight snowfall", "snow"],
  73: ["Moderate snowfall", "snow"],
  75: ["Heavy snowfall", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Slight rain showers", "rain"],
  81: ["Moderate rain showers", "rain"],
  82: ["Violent rain showers", "rain"],
  85: ["Slight snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "thunder"],
  96: ["Thunderstorm with slight hail", "thunder"],
  99: ["Thunderstorm with heavy hail", "thunder"],
};

export function describeWeather(code) {
  const [description, icon] = WEATHER_CODES[code] ?? ["Unknown", "cloudy"];
  return { description, icon };
}
