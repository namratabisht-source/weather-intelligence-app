import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudSun, RefreshCw, AlertTriangle, HelpCircle, Thermometer, Info, Sun, Sparkles, MapPin } from "lucide-react";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastRow from "./components/ForecastRow";
import WeatherCharts from "./components/WeatherCharts";
import Recommendations from "./components/Recommendations";
import { GeocodingResult, WeatherData, Recommendation } from "./types";
import { generateRecommendations } from "./utils/weatherUtils";

const DEFAULT_CITY: GeocodingResult = {
  id: 5128581,
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  country: "United States",
  country_code: "US",
  admin1: "New York",
  timezone: "America/New_York",
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorArr, setErrorArr] = useState<string | null>(null);

  // Unit controllers
  const [tempUnit, setTempUnit] = useState<"C" | "F">(() => {
    return (localStorage.getItem("weather_unit_temp") as "C" | "F") || "C";
  });
  const [windUnit, setWindUnit] = useState<"kmh" | "mph">(() => {
    return (localStorage.getItem("weather_unit_wind") as "kmh" | "mph") || "kmh";
  });

  // Selected forecast day index (0 = Today, 1 = Day 2, ..., 6 = Day 7)
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Sync unit switches in local state
  const toggleTempUnit = () => {
    const next = tempUnit === "C" ? "F" : "C";
    setTempUnit(next);
    localStorage.setItem("weather_unit_temp", next);
  };

  const toggleWindUnit = () => {
    const next = windUnit === "kmh" ? "mph" : "kmh";
    setWindUnit(next);
    localStorage.setItem("weather_unit_wind", next);
  };

  // Main API data synchronization orchestrator
  const fetchWeather = async (city: GeocodingResult) => {
    setLoading(true);
    setErrorArr(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to fetch weather forecast payload from server.");
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
      setSelectedIndex(0); // auto-reset focus to today
    } catch (err: any) {
      console.error(err);
      setErrorArr(err.message || "Failed to load meteorological forecast from external servers. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Perform fetching on city selection
  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
    }
  }, [selectedCity]);

  // Compute recommendations dynamically for the currently active selected forecast day index
  let recommendations: Recommendation[] = [];
  let recommendationDayLabel = "";
  if (weatherData && weatherData.daily && weatherData.daily.time[selectedIndex]) {
    const daily = weatherData.daily;
    recommendations = generateRecommendations({
      tempMax: daily.temperature_2m_max[selectedIndex],
      tempMin: daily.temperature_2m_min[selectedIndex],
      uvIndex: daily.uv_index_max[selectedIndex],
      rainProb: daily.precipitation_probability_max[selectedIndex],
      windSpeed: daily.wind_speed_10m_max[selectedIndex],
      weatherCode: daily.weather_code[selectedIndex],
    });

    try {
      const d = new Date(daily.time[selectedIndex] + "T00:00:00");
      recommendationDayLabel = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (selectedIndex === 0) {
        recommendationDayLabel = `Today, ${recommendationDayLabel}`;
      }
    } catch {
      recommendationDayLabel = daily.time[selectedIndex];
    }
  }

  return (
    <div className="min-h-screen text-[#e5e5e5] bg-[#050505] flex flex-col justify-between pb-12" id="app">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40" id="global-header">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c4a484] rounded-sm flex items-center justify-center text-black shadow-md shadow-[#c4a484]/10">
              <CloudSun className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h1 className="text-xl font-serif tracking-widest uppercase text-white leading-none">Aether Intel</h1>
              <p className="text-[9px] text-[#c4a484] font-bold uppercase tracking-[0.2em] mt-1">Sophisticated Meteorological Guard</p>
            </div>
          </div>

          {/* Unit Toggle controls */}
          <div className="flex items-center gap-2">
            {/* Temp Unit Toggle Switch */}
            <button
              onClick={toggleTempUnit}
              title="Toggle Celsius/Fahrenheit"
              className="flex items-center gap-1.5 bg-[#141414] border border-white/10 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-[#c4a484] hover:border-[#c4a484]/35 transition-colors cursor-pointer"
            >
              <Thermometer className="w-3.5 h-3.5 text-slate-500" />
              <span>Unit: °{tempUnit}</span>
            </button>

            {/* Wind Unit Toggle Switch */}
            <button
              onClick={toggleWindUnit}
              title="Toggle Wind Speed unit"
              className="flex bg-[#141414] border border-white/10 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-[#c4a484] hover:border-[#c4a484]/35 transition-colors cursor-pointer"
            >
              <span>{windUnit === "kmh" ? "km/h" : "mph"}</span>
            </button>

            {/* Manual Refresh Trigger */}
            {selectedCity && (
              <button
                onClick={() => fetchWeather(selectedCity)}
                disabled={loading}
                title="Refresh Weather Data"
                className="p-2 bg-[#141414] border border-white/10 rounded-lg hover:text-[#c4a484] hover:bg-[#1f1f1f] disabled:opacity-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#c4a484]" : "text-slate-400"}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-6 flex-1 w-full space-y-6">
        {/* Search layout segment */}
        <section className="space-y-2">
          <CitySearch onSelectCity={setSelectedCity} selectedCity={selectedCity} />
        </section>

        {/* Info banners if error happens */}
        {errorArr && (
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-serif italic text-rose-200">System Link offline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{errorArr}</p>
            <button
              onClick={() => selectedCity && fetchWeather(selectedCity)}
              className="px-5 py-2 bg-rose-900 hover:bg-rose-850 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && !weatherData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
              id="global-spinner"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-[#c4a484] animate-spin" />
                <CloudSun className="w-6 h-6 text-[#c4a484] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-serif italic text-white">Downloading Atmospheric Models</h3>
                <p className="text-xs text-slate-500 font-mono">Resolving geocoded grids & solar constants...</p>
              </div>
            </motion.div>
          )}

          {!errorArr && weatherData && selectedCity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 focus:outline-none"
              id="dashboard"
            >
              {/* Primary Current Weather Display */}
              <CurrentWeather
                selectedCity={selectedCity}
                current={weatherData.current}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />

              {/* 7-day selector blocks */}
              <ForecastRow
                daily={weatherData.daily}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
                tempUnit={tempUnit}
              />

              {/* Grid block containing Charts and travel layout recommendations side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left side: Advanced analysis graphs */}
                <div className="lg:col-span-7">
                  <WeatherCharts
                    daily={weatherData.daily}
                    tempUnit={tempUnit}
                    windUnit={windUnit}
                    selectedIndex={selectedIndex}
                    onSelectIndex={setSelectedIndex}
                  />
                </div>

                {/* Right side: Recommender system cards */}
                <div className="lg:col-span-5">
                  <Recommendations
                    recommendations={recommendations}
                    dateLabel={recommendationDayLabel}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern custom branding sub-footer */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto w-full px-4 md:px-6 opacity-30 text-[9px] uppercase tracking-[0.3em] gap-2">
        <div>Real-time intelligence • Open-Meteo API v1.4</div>
        <div>© 2026 Aether Environmental Systems</div>
      </footer>
    </div>
  );
}
