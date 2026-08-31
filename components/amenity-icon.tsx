import {
  Baby,
  Car,
  CookingPot,
  Fish,
  Flame,
  PawPrint,
  Thermometer,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import { createElement } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  Wifi,
  Car,
  UtensilsCrossed,
  CookingPot,
  Thermometer,
  Waves,
  Baby,
  PawPrint,
  Fish,
  Flame,
};

export function getAmenityIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}

export function AmenityIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = getAmenityIcon(name);
  return createElement(Icon, { className });
}
