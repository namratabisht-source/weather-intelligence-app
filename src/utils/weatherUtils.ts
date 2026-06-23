import { WeatherCodeDetails, Recommendation } from "../types";

/**
 * Maps WMO Weather codes to descriptive assets and styles.
 */
export function getWeatherDetails(code: number, isDay: boolean = true): WeatherCodeDetails {
  switch (code) {
    case 0:
      return {
        label: "Clear Sky",
        description: isDay ? "Clear, sunny skies." : "Clear, starry skies.",
        gradientClass: isDay
          ? "from-amber-200 via-orange-100 to-sky-100"
          : "from-slate-900 via-indigo-950 to-slate-800",
        textColorClass: isDay ? "text-amber-950" : "text-amber-100",
        iconName: "Sun",
      };
    case 1:
    case 2:
    case 3:
      return {
        label: code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast",
        description: code === 3 ? "Grey, thick clouds." : "Some pleasant cloud cover.",
        gradientClass: isDay
          ? "from-sky-100 via-teal-50 to-blue-200"
          : "from-slate-800 via-slate-900 to-blue-950",
        textColorClass: isDay ? "text-slate-800" : "text-slate-200",
        iconName: code === 3 ? "Cloud" : "CloudSun",
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        description: "Dense fog with low visibility.",
        gradientClass: isDay
          ? "from-zinc-200 via-slate-100 to-zinc-300"
          : "from-zinc-800 via-slate-900 to-zinc-950",
        textColorClass: isDay ? "text-zinc-800" : "text-zinc-200",
        iconName: "CloudFog",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Drizzle",
        description: "Light, persistent misting rain.",
        gradientClass: isDay
          ? "from-slate-200 via-blue-100 to-slate-200"
          : "from-slate-900 via-indigo-950 to-zinc-900",
        textColorClass: isDay ? "text-slate-800" : "text-blue-200",
        iconName: "CloudDrizzle",
      };
    case 56:
    case 57:
      return {
        label: "Freezing Drizzle",
        description: "Cold freezing drizzle with icy roads.",
        gradientClass: isDay
          ? "from-indigo-100 via-blue-100 to-slate-300"
          : "from-blue-950 via-slate-900 to-zinc-900",
        textColorClass: isDay ? "text-indigo-950" : "text-indigo-200",
        iconName: "CloudSnow",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: "Rainy",
        description: code === 61 ? "Light rain showers." : code === 63 ? "Steady, moderate rain." : "Heavy, pouring rain.",
        gradientClass: isDay
          ? "from-blue-100 via-slate-200 to-blue-300"
          : "from-indigo-950 via-slate-900 to-zinc-900",
        textColorClass: isDay ? "text-slate-900" : "text-blue-100",
        iconName: "CloudRain",
      };
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        description: "Icy rain freezing on contact.",
        gradientClass: isDay
          ? "from-blue-200 via-indigo-100 to-slate-300"
          : "from-slate-900 via-stone-900 to-blue-950",
        textColorClass: isDay ? "text-indigo-900" : "text-indigo-100",
        iconName: "CloudSnow",
      };
    case 71:
    case 73:
    case 75:
      return {
        label: "Snowfall",
        description: code === 71 ? "Light, fluffy snow." : code === 73 ? "Steady, heavy snow." : "Dense, major snow accumulation.",
        gradientClass: isDay
          ? "from-sky-50 via-blue-50 to-zinc-200"
          : "from-zinc-900 via-slate-800 to-indigo-950",
        textColorClass: isDay ? "text-sky-950" : "text-sky-100",
        iconName: "Snowflake",
      };
    case 77:
      return {
        label: "Snow Grains",
        description: "Tiny, crumbly snow grains.",
        gradientClass: isDay
          ? "from-slate-100 via-teal-50 to-zinc-200"
          : "from-stone-904 to-zinc-950",
        textColorClass: isDay ? "text-slate-800" : "text-zinc-100",
        iconName: "Snowflake",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Passing Showers",
        description: "Heavy periodic downpours.",
        gradientClass: isDay
          ? "from-blue-100 via-indigo-50 to-slate-200"
          : "from-indigo-950 via-slate-900 to-blue-900",
        textColorClass: isDay ? "text-indigo-950" : "text-blue-200",
        iconName: "CloudRain",
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        description: "Heavy, intermittent snow showers.",
        gradientClass: isDay
          ? "from-sky-150 via-indigo-50 to-zinc-100"
          : "from-slate-950 via-slate-900 to-blue-905",
        textColorClass: isDay ? "text-blue-900" : "text-blue-100",
        iconName: "Snowflake",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        description: "Thunder and lightning. Avoid high structures.",
        gradientClass: isDay
          ? "from-slate-350 via-blue-300 to-zinc-400"
          : "from-slate-950 via-purple-950 to-indigo-950",
        textColorClass: isDay ? "text-slate-950" : "text-purple-200",
        iconName: "CloudLightning",
      };
    default:
      return {
        label: "Unknown Conditions",
        description: "No weather condition mapped.",
        gradientClass: "from-slate-100 to-zinc-100",
        textColorClass: "text-slate-800",
        iconName: "Cloud",
      };
  }
}

/**
 * Generate automated, high-fidelity recommendations based on weather parameters.
 */
export function generateRecommendations(params: {
  tempMax: number;
  tempMin: number;
  uvIndex: number;
  rainProb: number;
  windSpeed: number;
  weatherCode: number;
}): Recommendation[] {
  const { tempMax, tempMin, uvIndex, rainProb, windSpeed, weatherCode } = params;
  const avgTemp = (tempMax + tempMin) / 2;

  // Let's figure out rain conditions
  const isRainy = rainProb > 30 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFoggy = [45, 48].includes(weatherCode);

  const recommendations: Recommendation[] = [];

  // 1. TRAVEL & COMMUTING
  let travelScore = 100;
  const travelTips: string[] = [];
  let travelStatus: "excellent" | "caution" | "warning" = "excellent";

  if (isStormy) {
    travelScore = 20;
    travelStatus = "warning";
    travelTips.push("Severe thunderstorms: High likelihood of flight delays and localized water logging.");
    travelTips.push("Drive with extreme caution; pool water can cause hydroplaning.");
    travelTips.push("Secure outdoor objects and check for public transport closures.");
  } else if (isSnowy) {
    travelScore = 30;
    travelStatus = "warning";
    travelTips.push("Icy/snowy roads: Carry tire chains or choose alternate transit.");
    travelTips.push("Prepare for potential delays or flight schedule shifts.");
    travelTips.push("Avoid sharp mountain passes or black ice locations early morning.");
  } else if (isFoggy) {
    travelScore = 50;
    travelStatus = "caution";
    travelTips.push("Very low horizontal visibility: Use fog lights and keep safe distance.");
    travelTips.push("Minor flight delay risk is possible; review live flight counters.");
  } else if (isRainy) {
    travelScore = 70;
    travelStatus = "caution";
    travelTips.push("Wet tarmac: Slightly increase braking distance on highways.");
    travelTips.push("Carry rain shields for luggage or public transit walking segments.");
  } else if (windSpeed > 30) {
    travelScore = 65;
    travelStatus = "caution";
    travelTips.push("Strong winds (up to " + Math.round(windSpeed) + " km/h): Hold steering tight on open bridges.");
    travelTips.push("Avoid light trailer towing or cycling on blustery lanes.");
  } else {
    travelScore = 95;
    travelStatus = "excellent";
    travelTips.push("Optimum travel weather: Safe roads and transparent skies.");
    travelTips.push("Perfect window for long scenic drives or high-altitude trains.");
  }
  recommendations.push({
    title: "Travel & Commuting",
    category: "travel",
    score: travelScore,
    status: travelStatus,
    details: travelTips,
  });

  // 2. OUTDOOR ACTIVITIES
  let outdoorScore = 100;
  const outdoorTips: string[] = [];
  let outdoorStatus: "excellent" | "caution" | "warning" = "excellent";

  if (isStormy || (isRainy && avgTemp < 10)) {
    outdoorScore = 15;
    outdoorStatus = "warning";
    outdoorTips.push("Hazardous outdoors: Avoid open ridges, parks, or metallic structures.");
    outdoorTips.push("Damp, freezing air increases hypothermia risk during workouts.");
    outdoorTips.push("Postpone hiking, golf, or runs. Opt for indoor conditioning instead.");
  } else if (isSnowy) {
    outdoorScore = 40;
    outdoorStatus = "caution";
    outdoorTips.push("Excellent status for ski/snowboarding. Wear goggles due to snow glare.");
    outdoorTips.push("Walking tracks might contain hidden ice patches; wear studded grips.");
  } else if (isRainy) {
    outdoorScore = 55;
    outdoorStatus = "caution";
    outdoorTips.push("Drizzle/rain present: Mountain trails will be muddy and slippery.");
    outdoorTips.push("Choose indoor climbing, waterparks, or museum exploration.");
    outdoorTips.push("If running, wear waterproof tracking shoes to stay dry.");
  } else if (tempMax > 33) {
    outdoorScore = 50;
    outdoorStatus = "caution";
    outdoorTips.push("High heat alert (" + Math.round(tempMax) + "°C): Intense physical load may provoke solar stroke.");
    outdoorTips.push("Schedule jogs/cycling strictly before 8:00 AM or after sunset.");
    outdoorTips.push("Ideal day to choose dynamic indoor pools or beach swimming.");
  } else if (tempMin < 0) {
    outdoorScore = 60;
    outdoorStatus = "caution";
    outdoorTips.push("Sub-zero chill limits outdoor stays. Wear a full windproof shell.");
    outdoorTips.push("Warm up extensively before runs to prevent muscle pulled strains.");
  } else {
    outdoorScore = 95;
    outdoorStatus = "excellent";
    outdoorTips.push("Incredibly pleasant: Perfect for high-intensity trekking, cycling, or picnics.");
    outdoorTips.push("Ambient conditions for outdoor yoga, photography, or dining.");
  }

  recommendations.push({
    title: "Outdoor Activities",
    category: "outdoor",
    score: outdoorScore,
    status: outdoorStatus,
    details: outdoorTips,
  });

  // 3. APPAREL & CLOTHING
  let clothingScore = 100;
  const clothingTips: string[] = [];
  let clothingStatus: "excellent" | "caution" | "warning" = "excellent";

  if (tempMin < 5) {
    clothingStatus = "caution";
    clothingTips.push("Heavy thermal protection needed. Add synthetic or wool base layers.");
    clothingTips.push("Windblown cold: Pack gloves, a knitted beanie, and fleece neck warmers.");
    if (isSnowy) {
      clothingTips.push("Water-repellent insulated boots are mandatory to block frozen moisture.");
    }
  } else if (tempMin >= 5 && tempMax < 18) {
    clothingStatus = "excellent";
    clothingTips.push("Adaptable double-layer style: A lightweight sweater paired with a windbreaker.");
    clothingTips.push("For morning commutes, carry a fleece coat or a utility jacket.");
  } else if (tempMax >= 18 && tempMax < 28) {
    clothingStatus = "excellent";
    clothingTips.push("Light apparel: Breathable linen, premium cotton tees, or light summer chinos.");
    clothingTips.push("Wear comfortable walking shoes or open sandals.");
  } else {
    clothingStatus = "caution";
    clothingTips.push("Extremely hot: Choose pale, loose-fitted clothes that reflect solar radiation.");
    clothingTips.push("Wear broad sunglasses with certified UV filters and a wide-brimmed sun hat.");
  }

  if (isRainy || isStormy) {
    clothingStatus = "warning";
    clothingTips.push("Pack a premium windproof umbrella or high-breathable Gore-Tex shell jacket.");
  }

  recommendations.push({
    title: "Clothing & Apparel",
    category: "clothing",
    score: clothingScore,
    status: clothingStatus,
    details: clothingTips,
  });

  // 4. SAFETY & HEALTH
  let healthScore = 100;
  const healthTips: string[] = [];
  let healthStatus: "excellent" | "caution" | "warning" = "excellent";

  if (uvIndex >= 6) {
    healthScore = Math.max(30, 100 - uvIndex * 10);
    healthStatus = uvIndex >= 8 ? "warning" : "caution";
    healthTips.push("Elevated UV danger (" + uvIndex + "): Sunburn happens in less than 20 mins.");
    healthTips.push("Re-apply broad-spectrum sunscreen with SPF 50+ every two hours.");
    healthTips.push("Stay shaded during peak solar radiation (11:00 AM to 4:00 PM).");
  } else {
    healthTips.push("UV levels are low to mild. Dynamic outdoor play is very safe.");
  }

  if (tempMax > 32) {
    healthScore = Math.min(healthScore, 60);
    healthStatus = "warning";
    healthTips.push("High heat strain: Consume at least 3-4 liters of water with electrolytes.");
    healthTips.push("Avoid salty food or heavy caffeinated products to limit dehydration.");
  } else if (tempMin < 0) {
    healthScore = Math.min(healthScore, 65);
    healthStatus = "caution";
    healthTips.push("Hypothermia alert: Do not stay still outdoors for longer than 30 minutes.");
    healthTips.push("Apply rich moisturizing lotion to protect exposed face parts from dry cold wind.");
  }

  if (isFoggy) {
    healthStatus = "caution";
    healthTips.push("High moisture dampness can aggregate asthma. Travel with clean inhalers.");
  }

  recommendations.push({
    title: "Health & Safety",
    category: "health",
    score: healthScore,
    status: healthStatus,
    details: healthTips,
  });

  return recommendations;
}

/**
 * Format string representing date (e.g., "2026-06-22") to human-readable date.
 */
export function formatForecastDate(dateStr: string): {
  weekday: string;
  dayMonth: string;
} {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayMonth = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return { weekday, dayMonth };
  } catch (e) {
    return { weekday: "Day", dayMonth: dateStr };
  }
}
