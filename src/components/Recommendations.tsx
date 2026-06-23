import React from "react";
import { motion } from "motion/react";
import { Plane, Footprints, Shirt, HeartPulse, ShieldCheck, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { Recommendation } from "../types";

interface RecommendationsProps {
  recommendations: Recommendation[];
  dateLabel: string;
}

export default function Recommendations({ recommendations, dateLabel }: RecommendationsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "travel":
        return <Plane className="w-4.5 h-4.5 text-[#c4a484]" />;
      case "outdoor":
        return <Footprints className="w-4.5 h-4.5 text-slate-400" />;
      case "clothing":
        return <Shirt className="w-4.5 h-4.5 text-[#c4a484]" />;
      case "health":
        return <HeartPulse className="w-4.5 h-4.5 text-slate-400" />;
      default:
        return <Sparkles className="w-4.5 h-4.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: "excellent" | "caution" | "warning") => {
    switch (status) {
      case "excellent":
        return {
          bg: "bg-emerald-950/25 text-emerald-400 border-emerald-950/60",
          icon: <ShieldCheck className="w-3 h-3" />,
          label: "Optimal",
        };
      case "caution":
        return {
          bg: "bg-amber-950/25 text-amber-400 border-amber-955/60",
          icon: <AlertTriangle className="w-3 h-3" />,
          label: "Caution Advised",
        };
      case "warning":
        return {
          bg: "bg-rose-950/25 text-rose-400 border-rose-955/60",
          icon: <AlertCircle className="w-3 h-3 animate-pulse" />,
          label: "Adverse Risk",
        };
    }
  };

  return (
    <div className="space-y-4" id="recommendations-box">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif italic text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c4a483]" />
            <span>Weather Intelligence Plan</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans">Automated strategical profiles configured for {dateLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {recommendations.map((rec, index) => {
          const badge = getStatusBadge(rec.status);
          return (
            <motion.div
              key={rec.category}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-[#141414]/70 p-5 rounded-2xl border border-white/5 hover:border-[#c4a484]/30 transition-all flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3.5 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/[0.03] border border-white/5 rounded-xl">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <span className="font-serif font-semibold text-white text-sm">
                      {rec.title}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Recommendations Details Bullet List */}
                <ul className="space-y-2.5 mt-2">
                  {rec.details.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-450 leading-relaxed font-sans">
                      <span className="text-[#c4a484] font-bold select-none">•</span>
                      <span className="text-slate-400">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitability Score Bar */}
              <div className="mt-6 pt-3.5 border-t border-white/5">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-500 uppercase tracking-widest text-[9px]">Suitability index</span>
                  <span className="font-mono text-xs text-[#c4a484] font-semibold">{rec.score}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rec.status === "excellent"
                        ? "bg-[#c4a484]"
                        : rec.status === "caution"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${rec.score}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
