import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Thermometer, CloudRain, Wind, ShieldAlert } from "lucide-react";
import { DailyForecast } from "../types";
import { formatForecastDate } from "../utils/weatherUtils";

interface WeatherChartsProps {
  daily: DailyForecast;
  tempUnit: "C" | "F";
  windUnit: "kmh" | "mph";
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

type TabType = "temp" | "precipitation" | "wind_uv";

export default function WeatherCharts({
  daily,
  tempUnit,
  windUnit,
  selectedIndex,
  onSelectIndex,
}: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("temp");

  const convertTemp = (c: number) => {
    if (tempUnit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const convertWindVal = (k: number) => {
    if (windUnit === "mph") {
      return Math.round(k * 0.621371);
    }
    return Math.round(k);
  };

  // Convert daily forecast list into Recharts friendly structures
  const chartData = daily.time.map((timeStr, index) => {
    const { weekday } = formatForecastDate(timeStr);
    return {
      index,
      dayLabel: weekday,
      dateLabel: timeStr,
      maxTemp: convertTemp(daily.temperature_2m_max[index]),
      minTemp: convertTemp(daily.temperature_2m_min[index]),
      rainProbability: daily.precipitation_probability_max[index] ?? 0,
      windSpeedMax: convertWindVal(daily.wind_speed_10m_max[index]),
      uvIndexMax: daily.uv_index_max[index],
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isDaySelected = data.index === selectedIndex;

      return (
        <div className="bg-[#111111]/95 border border-white/10 text-slate-300 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 z-50 backdrop-blur-md">
          <div className="font-semibold flex items-center justify-between gap-4 border-b border-white/5 pb-1 mb-1 text-slate-400">
            <span>{data.dateLabel} ({data.dayLabel})</span>
            {isDaySelected && (
              <span className="text-[9px] bg-[#c4a484]/15 border border-[#c4a484]/30 font-bold px-1.5 py-0.5 rounded text-[#c4a484] uppercase">
                Focus
              </span>
            )}
          </div>
          {payload.map((item: any, i: number) => {
            let unitStr = "";
            if (item.name.toLowerCase().includes("temp")) unitStr = `°${tempUnit}`;
            else if (item.name.toLowerCase().includes("rain")) unitStr = "%";
            else if (item.name.toLowerCase().includes("wind")) unitStr = ` ${windUnit === "mph" ? "mph" : "km/h"}`;
            else if (item.name.toLowerCase().includes("uv")) unitStr = " Index";

            return (
              <div key={i} className="flex justify-between items-center gap-4">
                <span className="opacity-80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-semibold text-white">{item.value}{unitStr}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined) {
      onSelectIndex(state.activeTooltipIndex);
    }
  };

  return (
    <div className="bg-[#141414]/70 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl space-y-4" id="weather-charts-panel">
      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <h4 className="text-sm font-serif italic text-white tracking-wide">Historical Analysis</h4>
          <p className="text-xs text-slate-500">Select graph nodes or bars to evaluate predictions</p>
        </div>

        <div className="flex bg-black/25 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("temp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "temp"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-[#c4a484]" />
            <span>Temperature</span>
          </button>
          
          <button
            onClick={() => setActiveTab("precipitation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "precipitation"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-355"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-[#5a7082]" />
            <span>Predictions</span>
          </button>

          <button
            onClick={() => setActiveTab("wind_uv")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "wind_uv"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-500 hover:text-[#c4a484]"
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>Solar & Wind</span>
          </button>
        </div>
      </div>

      {/* Render Chart Area */}
      <div className="h-64 sm:h-72 w-full outline-none">
        <AnimatePresence mode="wait">
          {activeTab === "temp" && (
            <motion.div
              key="temp-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c4a484" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#c4a484" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#737373" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#737373" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#999' }} />
                  <Area
                    type="monotone"
                    dataKey="maxTemp"
                    name="Max Temperature"
                    stroke="#c4a484"
                    strokeWidth={1.75}
                    fillOpacity={1}
                    fill="url(#colorMax)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#c4a484" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minTemp"
                    name="Min Temperature"
                    stroke="#737373"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorMin)"
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#737373" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeTab === "precipitation" && (
            <motion.div
              key="precip-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="rainProbability"
                    name="Precipitation Risk"
                    fill="#c4a484"
                    fillOpacity={0.65}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeTab === "wind_uv" && (
            <motion.div
              key="wind-uv-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5e5e5e" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="windSpeedMax"
                    name="Wind Velocity Max"
                    stroke="#8a9ba8"
                    strokeWidth={1.5}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uvIndexMax"
                    name="UV Index Peak"
                    stroke="#c4a480"
                    strokeWidth={1.5}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
