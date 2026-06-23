import React from "react";
import * as Icons from "lucide-react";

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ name, className = "w-6 h-6", size }: WeatherIconProps) {
  // Safe resolver for dynamic Lucide-React icons
  const LucideIcon = (Icons as any)[name];

  if (!LucideIcon) {
    return <Icons.Cloud className={className} size={size} />;
  }

  return <LucideIcon className={className} size={size} />;
}
