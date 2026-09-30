import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** --v2-brand-green (#039365) as RGB channels, for motion code that can't read CSS variables. */
export const BRAND_GREEN_RGB = "3 147 101";
