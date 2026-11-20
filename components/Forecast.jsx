import WeatherIcon from "./WeatherIcon";
import { formatDay, temp } from "@/lib/format";

export default function Forecast({ days, unit }) {
  if (!days?.length) return null;

  // Shared scale so each day's bar shows where its range sits in the week
  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));
  const span = Math.max(hi - lo, 1);

  return (
    <>
      <h3 className="section-title">Next {days.length} days</h3>
      <ul className="forecast">
        {days.map((day) => (
          <li className="day" key={day.date} title={day.description}>
            <span className="day-name">{formatDay(day.date)}</span>
            <WeatherIcon type={day.icon} label={day.description} size={30} />
            <span className="rain-chance">
              {day.precipitationChance >= 10 ? `💧${day.precipitationChance}%` : ""}
            </span>
            <span className="lo">{temp(day.min, unit)}°</span>
            <span className="range" aria-hidden="true">
              <span
                style={{
                  left: `${((day.min - lo) / span) * 100}%`,
                  right: `${((hi - day.max) / span) * 100}%`,
                }}
              />
            </span>
            <span className="hi">{temp(day.max, unit)}°</span>
          </li>
        ))}
      </ul>
    </>
  );
}
