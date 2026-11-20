import "./globals.css";

export const metadata = {
  title: "Weather Now — Weather Information App",
  description: "Search any city to see current weather, hourly and 6-day forecasts.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e0f2fe" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1324" },
  ],
};

// Runs before the page paints so a saved Light/Dark choice never flashes the other theme.
// Keep the storage key in sync with THEME_KEY in components/ThemeToggle.jsx.
const themeScript = `try{var t=JSON.parse(localStorage.getItem("weather:theme"));if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    // The theme script may add data-theme before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
