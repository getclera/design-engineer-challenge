"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { useReviewBoard } from "./hooks/use-review-board";

type ReviewBoardValue = ReturnType<typeof useReviewBoard>;

const ReviewBoardContext = createContext<ReviewBoardValue | null>(null);

interface ReviewBoardProviderProps {
	value: ReviewBoardValue;
	children: ReactNode;
}

export function ReviewBoardProvider({ value, children }: ReviewBoardProviderProps) {
	return <ReviewBoardContext.Provider value={value}>{children}</ReviewBoardContext.Provider>;
}

ReviewBoardProvider.displayName = "ReviewBoardProvider";

export function useReviewBoardContext(): ReviewBoardValue {
	const ctx = useContext(ReviewBoardContext);
	if (!ctx) throw new Error("useReviewBoardContext must be used within a ReviewBoardProvider");
	return ctx;
}
