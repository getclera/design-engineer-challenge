"use client";

import { useCallback } from "react";
import type { BooleanSearchTag } from "./boolean-search";

interface GeolocationValue {
	label: string;
	lat: number;
	lng: number;
	radius?: number;
}

interface TalentFilterShape {
	search_term: string;
	boolean_tags: BooleanSearchTag[];
	geolocations: GeolocationValue[];
}

type FilterDispatch<F> = (next: F | ((prev: F) => F)) => void;

function useFilterSetters<F extends TalentFilterShape>(setActiveFilters: FilterDispatch<F>) {
	const setSearchTerm = useCallback(
		(next: string) => setActiveFilters((prev) => ({ ...prev, search_term: next })),
		[setActiveFilters],
	);

	const setMulti = useCallback(
		(key: keyof F) => (next: string[]) => setActiveFilters((prev) => ({ ...prev, [key]: next }) as F), // v2-precheck-ignore as-cast
		[setActiveFilters],
	);

	const setBooleanTags = useCallback(
		(next: BooleanSearchTag[]) => setActiveFilters((prev) => ({ ...prev, boolean_tags: next })),
		[setActiveFilters],
	);

	const setTri = useCallback(
		(key: keyof F) => (next: boolean | null) => setActiveFilters((prev) => ({ ...prev, [key]: next }) as F), // v2-precheck-ignore as-cast
		[setActiveFilters],
	);

	const addGeolocation = useCallback(
		(loc: GeolocationValue) =>
			setActiveFilters((prev) => {
				const exists = prev.geolocations.some((l) => l.lat === loc.lat && l.lng === loc.lng);
				if (exists) return prev;
				return { ...prev, geolocations: [...prev.geolocations, loc] };
			}),
		[setActiveFilters],
	);

	const removeGeolocation = useCallback(
		(idx: number) =>
			setActiveFilters((prev) => ({ ...prev, geolocations: prev.geolocations.filter((_, i) => i !== idx) })),
		[setActiveFilters],
	);

	return {
		setSearchTerm,
		setMulti,
		setBooleanTags,
		setTri,
		addGeolocation,
		removeGeolocation,
	};
}

export type { FilterDispatch, GeolocationValue, TalentFilterShape };
export { useFilterSetters };
