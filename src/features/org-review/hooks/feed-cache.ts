import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { type ReviewItem, type ReviewListData, reviewItemKey } from "../types";

function adjustByRole(byRole: ReviewListData["byRole"], roleId: string | null, delta: number) {
	if (!roleId || !byRole[roleId]) return byRole;
	const pending = Math.max(0, byRole[roleId].pending + delta);
	return { ...byRole, [roleId]: { ...byRole[roleId], pending } };
}

export function removeFromReviewFeed(queryClient: QueryClient, queryKey: QueryKey, item: ReviewItem) {
	const previous = queryClient.getQueryData<ReviewListData>(queryKey);
	if (!previous) return previous;
	const items = previous.items.filter((i) => reviewItemKey(i) !== reviewItemKey(item));
	const removed = previous.items.length - items.length;
	if (removed === 0) return previous;
	const counts = { ...previous.counts, all: Math.max(0, previous.counts.all - removed) };
	counts[item.bucket] = Math.max(0, counts[item.bucket] - 1);
	queryClient.setQueryData<ReviewListData>(queryKey, {
		items,
		totalCount: Math.max(0, previous.totalCount - removed),
		truncated: previous.truncated,
		counts,
		byRole: adjustByRole(previous.byRole, item.roleId, -removed),
		pausedPending: previous.pausedPending,
	});
	return previous;
}

export function insertIntoReviewFeed(queryClient: QueryClient, queryKey: QueryKey, item: ReviewItem) {
	const previous = queryClient.getQueryData<ReviewListData>(queryKey);
	if (!previous) return previous;
	if (previous.items.some((i) => reviewItemKey(i) === reviewItemKey(item))) return previous;
	const counts = { ...previous.counts, all: previous.counts.all + 1 };
	counts[item.bucket] = counts[item.bucket] + 1;
	queryClient.setQueryData<ReviewListData>(queryKey, {
		items: [item, ...previous.items],
		totalCount: previous.totalCount + 1,
		truncated: previous.truncated,
		counts,
		byRole: adjustByRole(previous.byRole, item.roleId, 1),
		pausedPending: previous.pausedPending,
	});
	return previous;
}
