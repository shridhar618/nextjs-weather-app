import WeatherIcon from "./WeatherIcon";
import Forecast from "./Forecast";
import HourlyForecast from "./HourlyForecast";
import { formatDay, formatTime, temp, uvLabel, wind, windDirection } from "@/lib/format";

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span className="label">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function WeatherCard({ data, unit }) {
  const { location, current, today, hourly, forecast } = data;

  return (
    <section className="card" aria-live="polite">
      <div className="card-top">
        <div>
          <h2>{location.name}</h2>
          {location.region && <p className="muted">{location.region}</p>}
          <p className="muted small">
            Local time {formatTime(current.time)} · {formatDay(current.time)}
          </p>
        </div>
        <div className="weather-icon">
          <WeatherIcon type={current.icon} isDay={current.isDay} label={current.description} />
        </div>
      </div>

      <div className="temp-row">
        <span className="temperature">{temp(current.temperature, unit)}°</span>
        <div>
          <p className="condition">{current.description}</p>
          <p className="muted">
            Feels like {temp(current.feelsLike, unit)}° · H {temp(today.max, unit)}° L {temp(today.min, unit)}°
          </p>
        </div>
      </div>

      <div className="details">
        <Detail label="Humidity" value={`${current.humidity}%`} />
        <Detail label="Wind" value={`${wind(current.windSpeed, unit)} ${windDirection(current.windDirection)}`} />
        <Detail label="Chance of rain" value={today.precipitationChance == null ? "—" : `${today.precipitationChance}%`} />
        <Detail label="UV index" value={uvLabel(today.uvIndex)} />
        <Detail label="Pressure" value={`${Math.round(current.pressure)} ${current.units.pressure}`} />
        <Detail label="Cloud cover" value={`${current.cloudCover}%`} />
        <Detail label="Sunrise" value={formatTime(today.sunrise)} />
        <Detail label="Sunset" value={formatTime(today.sunset)} />
      </div>

      <HourlyForecast hours={hourly} unit={unit} />
      <Forecast days={forecast} unit={unit} />
    </section>
  );
}
