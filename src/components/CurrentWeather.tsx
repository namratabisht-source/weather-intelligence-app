import React from "react";
import { motion } from "motion/react";
import { Thermometer, Wind, Droplets, Compass, Sun, Sunset, Sunrise, Eye, Cloud } from "lucide-react";
import { GeocodingResult, CurrentWeather as ICurrentWeather, DailyForecast } from "../types";
import { getWeatherDetails } from "../utils/weatherUtils";
import WeatherIcon from "./WeatherIcon";

interface CurrentWeatherProps {
  selectedCity: GeocodingResult;
  current: ICurrentWeather;
  daily: DailyForecast;
  tempUnit: "C" | "F";
  windUnit: "kmh" | "mph";
}

export default function CurrentWeather({
  selectedCity,
  current,
  daily,
  tempUnit,
  windUnit,
}: CurrentWeatherProps) {
  const isDay = current.is_day === 1;
  const weatherDetails = getWeatherDetails(current.weather_code, isDay);

  const convertTemp = (c: number) => {
    if (tempUnit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const convertWind = (k: number) => {
    if (windUnit === "mph") {
      return `${Math.round(k * 0.621371)} mph`;
    }
    return `${Math.round(k)} km/h`;
  };

  // Extract sunrise and sunset for today
  const formatTime = (isoTime: string) => {
    if (!isoTime) return "";
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoTime;
    }
  };

  const sunrise = daily?.sunrise?.[0] ? formatTime(daily.sunrise[0]) : "N/A";
  const sunset = daily?.sunset?.[0] ? formatTime(daily.sunset[0]) : "N/A";
  const uvMax = daily?.uv_index_max?.[0] ?? "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-6 md:p-10 bg-[#141414]/70 border border-white/8 shadow-2xl backdrop-blur-xl"
      id="current-weather-hero"
    >
      {/* Delicate vintage visual background lines */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c4a484]/5 rounded-full filter blur-2xl -ml-12 -mb-12 pointer-events-none" />

      {/* Main Structure Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Column: Temperatures & Location */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            {/* Country Badge & Admin Labels */}
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-medium text-slate-300">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c4a484] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c4a484]"></span>
              </span>
              <span>{selectedCity.admin1 ? `${selectedCity.admin1}, ` : ""}{selectedCity.country}</span>
              {selectedCity.country_code && (
                <span className="text-[8px] bg-white/10 text-white font-semibold font-mono ml-1.5 px-1.5 py-0.5 rounded uppercase leading-none">
                  {selectedCity.country_code}
                </span>
              )}
            </div>

            {/* City Title */}
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-wide mt-4 mb-1">
              {selectedCity.name}
            </h2>

            {/* Elevation and Coordinate subtitle */}
            <div className="text-[11px] font-mono text-slate-500 mt-1 flex flex-wrap gap-x-4">
              <span>{selectedCity.latitude.toFixed(4)}° N, {selectedCity.longitude.toFixed(4)}° W</span>
              {selectedCity.elevation !== undefined && (
                <span>ELEV: {Math.round(selectedCity.elevation)}m</span>
              )}
            </div>
          </div>

          {/* Temperature block */}
          <div className="flex items-baseline gap-4 mt-8">
            <span className="text-7xl md:text-8xl font-light font-sans tracking-tighter text-white select-none">
              {convertTemp(current.temperature_2m)}
              <span className="text-3xl md:text-4xl align-top text-[#c4a484]">°{tempUnit}</span>
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-serif italic text-slate-300 flex items-center gap-1.5">
                Feels like <span className="text-white font-sans font-medium">{convertTemp(current.apparent_temperature)}°</span>
              </span>
              <span className="text-xs font-medium text-slate-500 mt-0.5">
                Daily Range: {convertTemp(daily.temperature_2m_min[0])}° - {convertTemp(daily.temperature_2m_max[0])}°
              </span>
            </div>
          </div>

          {/* Current weather note descriptor */}
          <div className="mt-6 flex items-center gap-2.5 bg-white/[0.03] border border-white/5 self-start px-3.5 py-2.5 rounded-xl">
            <WeatherIcon name={weatherDetails.iconName} className="w-4.5 h-4.5 text-[#c4a484]" />
            <span className="text-xs font-semibold text-[#c4a484] uppercase tracking-wider">
              {weatherDetails.label} — <span className="font-normal text-slate-400 capitalize normal-case tracking-normal">{weatherDetails.description}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Key Details grid */}
        <div className="lg:col-span-5 bg-black/40 rounded-2xl p-6 border border-white/5 grid grid-cols-2 gap-5 divide-y divider divide-none">
          
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.04] text-[#c4a484] border border-white/5">
              <Wind className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Wind Speed</div>
              <div className="text-base font-sans font-semibold text-white">{convertWind(current.wind_speed_10m)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.04] text-[#c4a484] border border-white/5">
              <Droplets className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Humidity</div>
              <div className="text-base font-sans font-semibold text-white">{current.relative_humidity_2m}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.04] text-[#c4a484] border border-white/5">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Precipitation</div>
              <div className="text-base font-sans font-semibold text-white">
                {current.precipitation > 0 ? `${current.precipitation} mm` : "None"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.04] text-[#c4a484] border border-white/5">
              <Sun className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: "25s" }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">UV Max today</div>
              <div className="text-base font-sans font-semibold text-white">{uvMax} Index</div>
            </div>
          </div>

          {/* Sunrise/Sunset segment */}
          <div className="flex items-center gap-3 border-t border-white/5 pt-4 col-span-2 mt-2">
            <div className="flex-1 flex items-center gap-3">
              <Sunrise className="w-4.5 h-4.5 text-[#c4a484]" />
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500">Sunrise</div>
                <div className="text-xs font-mono font-semibold text-slate-300">{sunrise}</div>
              </div>
            </div>
            
            <div className="border-l border-white/5 h-8" />
            
            <div className="flex-1 flex items-center gap-3 justify-end text-right">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500">Sunset</div>
                <div className="text-xs font-mono font-semibold text-slate-300">{sunset}</div>
              </div>
              <Sunset className="w-4.5 h-4.5 text-[#c4a484]" />
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
