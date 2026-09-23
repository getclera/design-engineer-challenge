"use client";

import { createContext, type ReactNode, useContext } from "react";

type SearchParamsMap = Record<string, string>;

const ServerSearchParamsContext = createContext<SearchParamsMap>({});

interface ServerSearchParamsProviderProps {
	value: SearchParamsMap;
	children: ReactNode;
}

export function ServerSearchParamsProvider({ value, children }: ServerSearchParamsProviderProps) {
	return <ServerSearchParamsContext value={value}>{children}</ServerSearchParamsContext>;
}

ServerSearchParamsProvider.displayName = "ServerSearchParamsProvider";

export function useServerSearchParam(key: string): string | null {
	const params = useContext(ServerSearchParamsContext);
	return params[key] ?? null;
}
