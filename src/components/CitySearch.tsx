import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, RotateCcw, Compass } from "lucide-react";
import { GeocodingResult } from "../types";

interface CitySearchProps {
  onSelectCity: (city: GeocodingResult) => void;
  selectedCity: GeocodingResult | null;
}

const PRESETS = [
  { name: "New York", country: "United States", country_code: "US", latitude: 40.7128, longitude: -74.0060, id: 5128581 },
  { name: "London", country: "United Kingdom", country_code: "GB", latitude: 51.5074, longitude: -0.1278, id: 2643743 },
  { name: "Paris", country: "France", country_code: "FR", latitude: 48.8566, longitude: 2.3522, id: 2988507 },
  { name: "Tokyo", country: "Japan", country_code: "JP", latitude: 35.6762, longitude: 139.6503, id: 1850147 },
  { name: "Sydney", country: "Australia", country_code: "AU", latitude: -33.8688, longitude: 151.2093, id: 2147714 },
];

export default function CitySearch({ onSelectCity, selectedCity }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<GeocodingResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("weather_intelligence_recent");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setIsDropdownOpen(true);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
      );
      if (!res.ok) {
        throw new Error("Failed to connect to the geocoding service. Ensure you are online.");
      }
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setResults([]);
        setErrorMsg(`City "${query}" not found. Try spelling it differently (e.g. "Paris" or "Los Angeles").`);
      }
    } catch (err: any) {
      setResults([]);
      setErrorMsg(err.message || "Something went wrong searching for location.");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically as user types (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setErrorMsg(null);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch();
    }, 550);

    return () => clearTimeout(timer);
  }, [query]);

  const selectCity = (city: GeocodingResult) => {
    onSelectCity(city);
    setIsDropdownOpen(false);
    setQuery("");

    // Update history
    const filtered = history.filter((x) => x.id !== city.id);
    const updated = [city, ...filtered].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem("weather_intelligence_recent", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    try {
      localStorage.removeItem("weather_intelligence_recent");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto z-50 animate-fade-in" id="city-search" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-5 text-[#c4a484]">
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#c4a484]" /> : <Search className="w-4.5 h-4.5 stroke-[1.5]" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search city (e.g., Paris, London, Tokyo)"
          className="w-full pl-12 pr-10 py-3.5 bg-[#111] border border-white/10 rounded-full text-[#e5e5e5] placeholder-slate-500 text-sm focus:outline-none focus:border-[#c4a484] transition-colors shadow-lg"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setErrorMsg(null);
            }}
            className="absolute right-4 text-slate-500 hover:text-slate-350 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown List */}
      {isDropdownOpen && (
        <div className="absolute w-full mt-2 bg-[#111111] rounded-2xl border border-white/5 shadow-2xl overflow-hidden z-50">
          {/* Recent History or Presets if input empty */}
          {!query.trim() && (
            <div>
              {history.length > 0 ? (
                <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex justify-between items-center px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#c4a484]" /> Recent Queries
                    </span>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="hover:text-[#c4a484] transition text-[10px] font-bold tracking-wider"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {history.map((city) => (
                      <button
                        key={`history-${city.id}`}
                        type="button"
                        onClick={() => selectCity(city)}
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-slate-350 text-sm hover:bg-white/5 hover:text-white transition text-left"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#c4a484]/70 flex-shrink-0" />
                          <span className="font-medium">{city.name}</span>
                          <span className="text-xs text-slate-500">
                            {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
                          </span>
                        </span>
                        {city.country_code && (
                          <span className="text-[9px] bg-white/10 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                            {city.country_code}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="p-3">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <Compass className="w-3.5 h-3.5 text-[#c4a484] animate-pulse" /> Popular Destinations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-1">
                  {PRESETS.map((city) => (
                    <button
                      key={`preset-${city.id}`}
                      type="button"
                      onClick={() => selectCity(city)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 text-sm hover:bg-white/5 hover:text-[#c4a484] font-medium transition text-left"
                    >
                      <MapPin className="w-4 h-4 text-[#c4a484]/75 flex-shrink-0" />
                      <div>
                        <div className="leading-5 font-serif">{city.name}</div>
                        <div className="text-[10px] text-slate-500 leading-3">{city.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Result List */}
          {query.trim() && (
            <div className="py-2">
              {loading && results.length === 0 && (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500 gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#c4a484]" />
                  Locating targets...
                </div>
              )}

              {errorMsg && (
                <div className="px-4 py-6 text-center text-sm text-amber-500 bg-amber-950/20 border border-amber-950/40 mx-2 my-1 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {!loading && !errorMsg && results.length > 0 && (
                <div className="px-1 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Select Location Match
                  </div>
                  {results.map((city) => (
                    <button
                      key={`result-${city.id}`}
                      type="button"
                      onClick={() => selectCity(city)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-slate-300 text-sm hover:bg-white/5 hover:text-white transition text-left"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin className="w-4 h-4 text-[#c4a484] flex-shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{city.name}</span>
                        {city.admin1 && (
                          <span className="text-xs text-slate-500 truncate hidden sm:inline">
                            {city.admin1}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 truncate">— {city.country}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {city.country_code && (
                          <span className="text-[9px] bg-white/10 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                            {city.country_code}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
