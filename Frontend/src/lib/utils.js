import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp) {
  return new Intl.NumberFormat().format(xp) + " XP";
}
