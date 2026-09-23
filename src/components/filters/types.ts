import type { DateInput } from "@v2/utils/date";
import type { ReactNode } from "react";

export interface FilterOption {
	value: string;
	label?: string;
	count?: number;
	pinned?: boolean;
}

export interface BaseFilterProps {
	label: string;
	isActive?: boolean;
	activeFilterCount?: number;
	className?: string;
}

export interface FilterPopoverProps extends BaseFilterProps {
	children: ReactNode;
	large?: boolean;
	contentClassName?: string;
	tooltip?: string;
}

export interface CheckboxFilterProps {
	options: FilterOption[];
	selected: string[];
	onChange: (next: string[]) => void;
	searchable?: boolean;
	showSelectAll?: boolean;
	emptyMessage?: string;
	renderOption?: (option: FilterOption, checked: boolean) => ReactNode;
	selectedFirst?: boolean;
	loading?: boolean;
	maxHeight?: number;
	virtualize?: boolean;
	loadOptions?: (query: string, signal: AbortSignal) => Promise<FilterOption[]>;
	minQueryLength?: number;
	debounceMs?: number;
	selectedLabels?: Record<string, string>;
	cacheKey?: string;
	idlePlaceholder?: string;
}

export interface TriStateFilterProps {
	title: string;
	value: boolean | null;
	onChange: (next: boolean | null) => void;
}

export interface NumericMinFilterProps extends BaseFilterProps {
	value: number | null;
	onChange: (next: number | null) => void;
	min?: number;
	max?: number;
	placeholder?: string;
	helpText?: string;
}

export interface NumericMinMaxFilterProps extends BaseFilterProps {
	minValue: number | null;
	maxValue: number | null;
	onMinChange: (next: number | null) => void;
	onMaxChange: (next: number | null) => void;
	min?: number;
	max?: number;
	placeholder?: string;
	helpText?: string;
}

export interface NumericRangeFilterProps extends BaseFilterProps {
	min: number | null;
	max: number | null;
	onMinChange: (next: number | null) => void;
	onMaxChange: (next: number | null) => void;
	bounds: { min: number; max: number };
	step?: number;
	formatValue?: (n: number) => string;
}

export interface DateRangeFilterProps extends BaseFilterProps {
	dateMin: DateInput | null;
	dateMax: DateInput | null;
	onDateMinChange: (next: Date | null) => void;
	onDateMaxChange: (next: Date | null) => void;
}

export interface SortOption {
	value: string;
	label: string;
	description?: string;
}

export interface SortSelectProps {
	options: readonly SortOption[];
	value: string;
	onChange: (next: string) => void;
	className?: string;
	ariaLabel?: string;
	itemClassName?: string;
}
