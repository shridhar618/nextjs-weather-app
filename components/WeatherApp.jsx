"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SearchForm from "./SearchForm";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import WeatherCard from "./WeatherCard";
import UnitToggle from "./UnitToggle";
import RecentSearches from "./RecentSearches";
import ThemeToggle from "./ThemeToggle";
import { load, save } from "@/lib/storage";

const RECENT_KEY = "weather:recent";
const UNIT_KEY = "weather:unit";
const MAX_RECENT = 5;

// A query is one of:
//   { city: "London" }                 free text, best match
//   { place: { id, name, region } }    an exact place (suggestion, recent search, ?id= link)
//   { coords: { lat, lon } }           browser geolocation or ?lat=&lon= link
function toParams(query) {
  if (query.place) return new URLSearchParams({ id: String(query.place.id) });
  if (query.coords) return new URLSearchParams({ lat: String(query.coords.lat), lon: String(query.coords.lon) });
  return new URLSearchParams({ city: query.city.trim() });
}

function labelFor(query) {
  if (query.place) return query.place.name;
  if (query.coords) return "your location";
  return query.city.trim();
}

// Put the current place in the address bar so the page can be reloaded or shared
function syncUrl(params) {
  const url = params ? `${window.location.pathname}?${params}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

// status: "idle" | "loading" | "success" | "error"
export default function WeatherApp() {
  const [status, setStatus] = useState("idle");
  const [lastQuery, setLastQuery] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");
  const [recent, setRecent] = useState([]);
  const [locating, setLocating] = useState(false);
  const controllerRef = useRef(null);

  // Switch to the night background when it's night in the searched city
  useEffect(() => {
    const isNight = status === "success" && data && !data.current.isDay;
    document.body.classList.toggle("night", Boolean(isNight));
  }, [status, data]);

  // Show a message if the connection drops
  useEffect(() => {
    const goOffline = () => {
      setError({ title: "You're offline", message: "Your internet connection was lost. Reconnect to search again." });
      setStatus("error");
    };
    window.addEventListener("offline", goOffline);
    return () => window.removeEventListener("offline", goOffline);
  }, []);

  // Cancel any in-flight request when the component unmounts
  useEffect(() => () => controllerRef.current?.abort(), []);

  // retryable = show a "Try again" button (only for server / network problems)
  function fail(title, message, retryable = false) {
    setError({ title, message, retryable });
    setStatus("error");
  }

  function remember(location) {
    if (!location.id) return; // "Your location" has no stable id
    setRecent((prev) => {
      const next = [
        { id: location.id, name: location.name, region: location.region },
        ...prev.filter((p) => p.id !== location.id),
      ].slice(0, MAX_RECENT);
      save(RECENT_KEY, next);
      return next;
    });
  }

  const search = useCallback(async (query) => {
    if (query.city !== undefined && !query.city.trim()) {
      return fail("Please enter a city", "Type a city name in the search box first.");
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return fail("You're offline", "Check your internet connection and try again.", true);
    }

    // Cancel the previous request so an older response can't overwrite a newer search
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLastQuery(query);
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/weather?${toParams(query)}`, { signal: controller.signal });

      let body = null;
      try {
        body = await res.json();
      } catch {
        // response wasn't JSON (e.g. a proxy error page)
      }

      if (!res.ok || !body || body.error) {
        const e = body?.error;
        return fail(
          e?.title ?? "Weather data unavailable",
          e?.message ?? `The server returned an error (HTTP ${res.status}). Please try again.`,
          res.status >= 500 || !body
        );
      }

      setData(body);
      setStatus("success");
      remember(body.location);
      syncUrl(
        body.location.id
          ? new URLSearchParams({ id: String(body.location.id) })
          : toParams(query)
      );
    } catch (err) {
      if (err.name === "AbortError") return; // replaced by a newer search
      fail("Couldn't connect", "We couldn't reach the server. Check your connection and try again.", true);
    }
  }, []);

  // On first load: restore preferences, then open whatever place the URL points to
  useEffect(() => {
    setUnit(load(UNIT_KEY, "C") === "F" ? "F" : "C");
    const saved = load(RECENT_KEY, []);
    setRecent(Array.isArray(saved) ? saved.filter((p) => p?.id && p?.name).slice(0, MAX_RECENT) : []);

    const params = new URLSearchParams(window.location.search);
    if (params.get("id")) search({ place: { id: params.get("id"), name: "saved location" } });
    else if (params.get("lat") && params.get("lon")) search({ coords: { lat: params.get("lat"), lon: params.get("lon") } });
    else if (params.get("city")) search({ city: params.get("city") });
  }, [search]);

  function changeUnit(u) {
    setUnit(u);
    save(UNIT_KEY, u);
  }

  function removeRecent(id) {
    setRecent((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(RECENT_KEY, next);
      return next;
    });
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      return fail("Location unavailable", "Your browser doesn't support finding your location. Search for a city instead.");
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        search({
          coords: { lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4) },
        });
      },
      (err) => {
        setLocating(false);
        fail(
          "Couldn't get your location",
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser settings, or search for a city."
            : "Your location couldn't be determined. Try again or search for a city."
        );
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Weather Now</h1>
          <p className="subtitle">Current conditions and forecast for any city</p>
        </div>
        <div className="header-controls">
          <UnitToggle unit={unit} onChange={changeUnit} />
          <ThemeToggle />
        </div>
      </header>

      <SearchForm
        onSearch={search}
        onLocate={locate}
        loading={status === "loading"}
        locating={locating}
        onTyping={() => status === "error" && setStatus(data ? "success" : "idle")}
      />

      <RecentSearches places={recent} onPick={(place) => search({ place })} onRemove={removeRecent} />

      <div className="status">
        {locating && <Loading label="Finding your location…" />}
        {!locating && status === "loading" && lastQuery && <Loading label={`Fetching weather for ${labelFor(lastQuery)}…`} />}
        {status === "error" && error && (
          <ErrorMessage
            title={error.title}
            message={error.message}
            onRetry={error.retryable && lastQuery ? () => search(lastQuery) : undefined}
          />
        )}
      </div>

      {status === "success" && data && <WeatherCard data={data} unit={unit} />}

      {status === "idle" && !locating && (
        <p className="hint">Search for a city like “Mumbai”, “Paris” or “New York”, or tap the location button.</p>
      )}

      <footer className="app-footer">
        Weather data by{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>{" "}
        · built with Next.js
      </footer>
    </main>
  );
}
