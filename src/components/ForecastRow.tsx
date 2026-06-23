import React from "react";
import { motion } from "motion/react";
import { DailyForecast } from "../types";
import { getWeatherDetails, formatForecastDate } from "../utils/weatherUtils";
import WeatherIcon from "./WeatherIcon";

interface ForecastRowProps {
  daily: DailyForecast;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  tempUnit: "C" | "F";
}

export default function ForecastRow({
  daily,
  selectedIndex,
  onSelectIndex,
  tempUnit,
}: ForecastRowProps) {
  const convertTemp = (c: number) => {
    if (tempUnit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  return (
    <div id="forecast-days-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif italic text-white tracking-wide flex items-center gap-2">
          <span>7-Day Daily Forecast</span>
          <span className="text-[9px] font-sans font-bold text-[#c4a484] tracking-widest uppercase bg-white/[0.04] border border-white/5 px-2.5 py-1 rounded-full">
            Plan recommendation focus day
          </span>
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar snap-x -mx-1 px-1">
        {daily.time.map((timeStr, index) => {
          const isSelected = index === selectedIndex;
          const maxTemp = daily.temperature_2m_max[index];
          const minTemp = daily.temperature_2m_min[index];
          const weatherCode = daily.weather_code[index];
          const weatherDetails = getWeatherDetails(weatherCode, true);
          const iconName = weatherDetails.iconName;
          const { weekday, dayMonth } = formatForecastDate(timeStr);
          const rainProb = daily.precipitation_probability_max[index] ?? 0;

          return (
            <motion.button
              key={`forecast-day-${timeStr}`}
              onClick={() => onSelectIndex(index)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className={`flex-shrink-0 w-[114px] md:w-[124px] snap-start rounded-xl p-3.5 text-center transition-all outline-none border cursor-pointer ${
                isSelected
                  ? "bg-[#1c1c1c] border-[#c4a484]/40 text-white shadow-2xl shadow-black/60"
                  : "bg-[#141414]/40 border-white/5 hover:border-white/10 text-slate-350"
              }`}
            >
              {/* Day details */}
              <div className="text-xs font-serif uppercase tracking-widest block font-semibold text-slate-200">
                {index === 0 ? "Today" : weekday}
              </div>
              <div className="text-[10px] mt-0.5 text-slate-500 font-mono">
                {dayMonth}
              </div>

              {/* Weather icon display */}
              <div className="my-3 flex justify-center">
                <div
                  className={`p-2 rounded-lg border transition-colors ${
                    isSelected ? "bg-[#c4a484]/12 border-[#c4a484]/20 text-[#c4a484]" : "bg-white/[0.02] border-white/5 text-slate-400"
                  }`}
                >
                  <WeatherIcon name={iconName} className="w-5 h-5" />
                </div>
              </div>

              {/* Temp details */}
              <div className="flex items-baseline justify-center gap-1.5 mt-2">
                <span className="text-sm font-semibold font-sans text-white">
                  {convertTemp(maxTemp)}°
                </span>
                <span className="text-xs font-medium text-slate-500 font-sans">
                  {convertTemp(minTemp)}°
                </span>
              </div>

              {/* Precipitation percentage indicator */}
              <div className="mt-2.5 flex items-center justify-center gap-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    rainCodeColor(rainProb)
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-500">{rainProb}% rain</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Small color guide helper for rain risk
function rainCodeColor(prob: number) {
  if (prob >= 70) return "bg-[#c4a484] animate-pulse";
  if (prob >= 35) return "bg-slate-400";
  return "bg-white/10";
}
