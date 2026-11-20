"use client";

import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 250;

// Search box with as-you-type suggestions (so "Paris, France" and "Paris, Texas"
// can be told apart) and a "use my location" button.
//
// onSearch(query) where query is { city } for free text or { place } for a picked suggestion.
export default function SearchForm({ onSearch, onLocate, loading, locating, onTyping }) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const fetchRef = useRef(null);

  // Fetch suggestions after the user pauses typing
  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      fetchRef.current?.abort();
      const controller = new AbortController();
      fetchRef.current = controller;
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const body = await res.json();
        setSuggestions(body.results ?? []);
        setActive(-1);
      } catch {
        // suggestions are optional; ignore failures and aborts
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => () => fetchRef.current?.abort(), []);

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function pick(place) {
    setText(place.name);
    close();
    onSearch({ place });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (open && active >= 0 && suggestions[active]) return pick(suggestions[active]);
    close();
    onSearch({ city: text });
  }

  function handleKeyDown(e) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      close();
    }
  }

  const showList = open && suggestions.length > 0;

  return (
    <form className="search" onSubmit={handleSubmit} autoComplete="off" noValidate>
      <div className="search-field">
        <label htmlFor="city-input" className="visually-hidden">
          City name
        </label>
        <input
          id="city-input"
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls="city-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `suggestion-${active}` : undefined}
          placeholder="Search a city, e.g. Bengaluru"
          maxLength={80}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            onTyping?.();
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(close, 120)} // let a click on a suggestion land first
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {showList && (
          <ul id="city-suggestions" className="suggestions" role="listbox">
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="flag" aria-hidden="true">{flagEmoji(s.countryCode)}</span>
                <span>
                  <strong>{s.name}</strong>
                  {s.region && <span className="muted">, {s.region}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="locate"
        onClick={onLocate}
        disabled={loading || locating}
        title="Use my location"
        aria-label="Use my location"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v3M12 19v3M2 12h3M19 12h3M12 5a7 7 0 1 1 0 14a7 7 0 1 1 0-14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button type="submit" disabled={loading}>
        {loading ? "Loading…" : "Search"}
      </button>
    </form>
  );
}

function flagEmoji(code) {
  if (!code || code.length !== 2) return "📍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
