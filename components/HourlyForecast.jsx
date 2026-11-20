import WeatherIcon from "./WeatherIcon";
import { formatHour, temp } from "@/lib/format";

export default function HourlyForecast({ hours, unit }) {
  if (!hours?.length) return null;

  return (
    <>
      <h3 className="section-title">Next 24 hours</h3>
      <div className="hourly" tabIndex={0} aria-label="Hourly forecast, scroll sideways for more">
        {hours.map((h, i) => (
          <div className="hour" key={h.time} title={h.description}>
            <div className="muted">{i === 0 ? "Now" : formatHour(h.time)}</div>
            <WeatherIcon type={h.icon} isDay={h.isDay} label={h.description} size={32} />
            <div className="hour-temp">{temp(h.temperature, unit)}°</div>
            <div className="rain-chance">
              {h.precipitationChance >= 10 ? `💧${h.precipitationChance}%` : " "}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
