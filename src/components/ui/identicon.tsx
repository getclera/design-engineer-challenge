"use client";

import { cn } from "@v2/lib/utils";
import { useMemo } from "react";

const IDENTICON_COLORS = [
	"text-v2-identicon-1",
	"text-v2-identicon-2",
	"text-v2-identicon-3",
	"text-v2-identicon-4",
	"text-v2-identicon-5",
	"text-v2-identicon-6",
];

const GRID = 5;
const HALF_COLUMNS = 3;
const FILL_THRESHOLD = 0.5;

function hashSeed(seed: string): number {
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function nextRandom(state: number): number {
	let next = state;
	next ^= next << 13;
	next ^= next >>> 17;
	next ^= next << 5;
	return next >>> 0;
}

function buildPattern(seed: string): { colorClass: string; cells: { x: number; y: number; opacity: number }[] } {
	const cells: { x: number; y: number; opacity: number }[] = [];
	const hash = hashSeed(seed) || 1;
	const colorClass = IDENTICON_COLORS[hash % IDENTICON_COLORS.length];
	let state = hash;
	for (let x = 0; x < HALF_COLUMNS; x++) {
		for (let y = 0; y < GRID; y++) {
			state = nextRandom(state);
			if (state / 0xffffffff < FILL_THRESHOLD) continue;
			state = nextRandom(state);
			const opacity = 0.55 + (state % 3) * 0.2;
			cells.push({ x, y, opacity });
			if (x < HALF_COLUMNS - 1) cells.push({ x: GRID - 1 - x, y, opacity });
		}
	}
	return { colorClass, cells };
}

interface IdenticonProps {
	seed: string;
	className?: string;
}

function Identicon({ seed, className }: IdenticonProps) {
	const { colorClass, cells } = useMemo(() => buildPattern(seed), [seed]);

	return (
		<svg
			viewBox={`0 0 ${GRID} ${GRID}`}
			className={cn("size-[72%]", colorClass, className)}
			aria-hidden="true"
			focusable="false"
		>
			{cells.map((cell) => (
				<rect
					key={`${cell.x}-${cell.y}`}
					x={cell.x}
					y={cell.y}
					width={1}
					height={1}
					fill="currentColor"
					opacity={cell.opacity}
				/>
			))}
		</svg>
	);
}
Identicon.displayName = "Identicon";

export { Identicon };
