// Inline SVG weather icons — no image files or icon libraries needed.

function Sun() {
  return (
    <g>
      <circle cx="32" cy="32" r="12" fill="#FFD166" />
      <g stroke="#FFD166" strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="12" />
        <line x1="32" y1="52" x2="32" y2="58" />
        <line x1="6" y1="32" x2="12" y2="32" />
        <line x1="52" y1="32" x2="58" y2="32" />
        <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
        <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
        <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
        <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
      </g>
    </g>
  );
}

function Moon() {
  return <path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z" fill="#F1F5F9" />;
}

function Cloud({ fill = "#E2E8F0", dy = 0 }) {
  return (
    <path
      transform={`translate(0 ${dy})`}
      d="M20 46h26a10 10 0 0 0 0-20 14 14 0 0 0-27-2A11 11 0 0 0 20 46z"
      fill={fill}
    />
  );
}

function Drops() {
  return (
    <g stroke="#60A5FA" strokeWidth="3" strokeLinecap="round">
      <line x1="24" y1="50" x2="21" y2="58" />
      <line x1="34" y1="50" x2="31" y2="58" />
      <line x1="44" y1="50" x2="41" y2="58" />
    </g>
  );
}

function Drizzle() {
  return (
    <g fill="#93C5FD">
      <circle cx="24" cy="54" r="2" />
      <circle cx="34" cy="56" r="2" />
      <circle cx="44" cy="54" r="2" />
    </g>
  );
}

function Flakes() {
  return (
    <g fill="#FFFFFF">
      <circle cx="24" cy="54" r="2.6" />
      <circle cx="34" cy="58" r="2.6" />
      <circle cx="44" cy="54" r="2.6" />
    </g>
  );
}

function Bolt() {
  return <path d="M34 46l-6 10h6l-4 8 10-12h-6l4-6z" fill="#FACC15" />;
}

function Fog() {
  return (
    <g stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round">
      <line x1="12" y1="26" x2="52" y2="26" />
      <line x1="8" y1="36" x2="48" y2="36" />
      <line x1="16" y1="46" x2="56" y2="46" />
    </g>
  );
}

function IconBody({ type, isDay }) {
  switch (type) {
    case "clear":
      return isDay ? <Sun /> : <Moon />;
    case "partly":
      return (
        <>
          {isDay ? (
            <g transform="translate(-6 -8) scale(0.75)"><Sun /></g>
          ) : (
            <g transform="translate(-4 -6) scale(0.7)"><Moon /></g>
          )}
          <Cloud />
        </>
      );
    case "cloudy":
      return (
        <>
          <Cloud fill="#CBD5E1" dy={-4} />
          <Cloud fill="#E2E8F0" dy={2} />
        </>
      );
    case "fog":
      return <Fog />;
    case "drizzle":
      return (
        <>
          <Cloud fill="#CBD5E1" dy={-6} />
          <Drizzle />
        </>
      );
    case "rain":
      return (
        <>
          <Cloud fill="#94A3B8" dy={-6} />
          <Drops />
        </>
      );
    case "snow":
      return (
        <>
          <Cloud fill="#E2E8F0" dy={-6} />
          <Flakes />
        </>
      );
    case "thunder":
      return (
        <>
          <Cloud fill="#64748B" dy={-8} />
          <Bolt />
        </>
      );
    default:
      return <Cloud />;
  }
}

export default function WeatherIcon({ type, isDay = true, label, size = 96 }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label ?? type}
    >
      <IconBody type={type} isDay={isDay} />
    </svg>
  );
}
