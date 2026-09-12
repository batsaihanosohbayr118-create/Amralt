import {
  Baby,
  Briefcase,
  Bus,
  Car,
  CigaretteOff,
  CircleDot,
  ConciergeBell,
  Coffee,
  CookingPot,
  Dog,
  Fish,
  Flame,
  Goal,
  Martini,
  MicVocal,
  PawPrint,
  Target,
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
  CircleDot,
  Target,
  Goal,
  MicVocal,
  Coffee,
  Briefcase,
  Dog,
  ConciergeBell,
  Bus,
  Martini,
  CigaretteOff,
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
