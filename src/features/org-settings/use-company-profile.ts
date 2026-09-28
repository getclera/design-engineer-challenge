"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { companyKeys } from "@/lib/query-keys";
import { organizations, unwrap } from "@/services/api";
import type { CompanyProfile, FundingRound } from "./company-profile";
import { markDirty, trackSave, UNDO_MS, undoToast } from "./save-status";

const TYPING_DELAY_MS = 600;

export function useCompanyProfile(orgId: string) {
	return useQuery({
		queryKey: companyKeys.full(orgId),
		queryFn: () => organizations.getCompany<CompanyProfile>(orgId).then(unwrap),
	});
}

type Field = keyof CompanyProfile;

/**
 * Autosave, one field at a time, for any object cached under `queryKey` (the company profile, your own profile).
 * The screen updates at once; the request goes out after a pause in typing, or right away for clicks. Leaving the
 * page sends whatever is still waiting.
 */
export function useAutosave<T extends object>(
	queryKey: readonly unknown[],
	patch: (change: Partial<T>) => Promise<unknown>,
	onSaved?: () => void,
) {
	type K = keyof T & string;
	const queryClient = useQueryClient();
	const timers = useRef(new Map<K, ReturnType<typeof setTimeout>>());
	const waiting = useRef(new Map<K, unknown>());
	const [savedAt, setSavedAt] = useState<Partial<Record<K, number>>>({});
	const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
	// The latest callbacks without re-creating `save` (and the flush on unmount) on every render.
	const latest = useRef({ patch, onSaved });
	latest.current = { patch, onSaved };
	const keyString = JSON.stringify(queryKey);

	const send = useCallback(async (field: K, value: unknown) => {
		waiting.current.delete(field);
		markDirty(field, false);
		try {
			await trackSave(latest.current.patch({ [field]: value } as Partial<T>));
			setErrors(({ [field]: _, ...rest }) => rest as Partial<Record<K, string>>);
			setSavedAt((s) => ({ ...s, [field]: Date.now() }));
			latest.current.onSaved?.();
		} catch (error) {
			setErrors((e) => ({ ...e, [field]: error instanceof Error ? error.message : "Couldn't save" }));
		}
	}, []);

	/**
	 * `invalid`: the value can't be saved as typed (a half-written link). The screen still shows it, nothing is sent,
	 * and the message appears only after a pause, so it doesn't nag mid-word.
	 */
	const save = useCallback(
		<F extends K>(field: F, value: T[F], { now = false, invalid }: { now?: boolean; invalid?: string } = {}) => {
			queryClient.setQueryData<T>(JSON.parse(keyString), (old) => old && { ...old, [field]: value });
			setErrors(({ [field]: _, ...rest }) => rest as Partial<Record<K, string>>);
			clearTimeout(timers.current.get(field));
			if (invalid) {
				waiting.current.delete(field);
				markDirty(field, false);
				timers.current.set(
					field,
					setTimeout(() => setErrors((e) => ({ ...e, [field]: invalid })), TYPING_DELAY_MS),
				);
				return;
			}
			waiting.current.set(field, value);
			markDirty(field, true);
			if (now) void send(field, value);
			else
				timers.current.set(
					field,
					setTimeout(() => void send(field, value), TYPING_DELAY_MS),
				);
		},
		[keyString, queryClient, send],
	);

	useEffect(() => {
		const pendingTimers = timers.current;
		const pendingValues = waiting.current;
		return () => {
			for (const timer of pendingTimers.values()) clearTimeout(timer);
			for (const [field, value] of pendingValues) void send(field, value);
		};
	}, [send]);

	return { save, savedAt, errors };
}

export function useSaveCompanyField(orgId: string) {
	return useAutosave<CompanyProfile>(companyKeys.full(orgId), (change) =>
		organizations.updateCompany<CompanyProfile>(orgId, change).then(unwrap),
	);
}

/** "Fill from website": the server answers empty fields only and says which, with what was there before (for Undo). */
export function useFillFromWebsite(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			trackSave(
				fetch(`/api/organizations/${orgId}/company/fill`, { method: "POST" }).then(async (r) => {
					const body = await r.json();
					if (!r.ok) throw new Error(body.error ?? "Couldn't read your website. Try again.");
					return body as { profile: CompanyProfile; filled: Field[]; previous: Partial<CompanyProfile> };
				}),
			),
		onSuccess: ({ profile }) => queryClient.setQueryData(companyKeys.full(orgId), profile),
	});
}

/** Add or remove a funding round. A removal waits out the Undo window before it's sent (or goes at once if you leave). */
export function useFundingRounds(orgId: string) {
	const queryClient = useQueryClient();
	const held = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; send: () => void }>());
	const setRounds = (update: (rounds: FundingRound[]) => FundingRound[]) =>
		queryClient.setQueryData<CompanyProfile>(
			companyKeys.full(orgId),
			(old) => old && { ...old, rounds: update(old.rounds) },
		);

	const add = useMutation({
		mutationFn: (round: Omit<FundingRound, "id" | "auto">) =>
			trackSave(organizations.createFundingRound<FundingRound>(orgId, round).then(unwrap)),
		onSuccess: (round) => setRounds((rounds) => [...rounds, round]),
	});
	const remove = (round: FundingRound) => {
		const before = queryClient.getQueryData<CompanyProfile>(companyKeys.full(orgId))?.rounds ?? [];
		setRounds((rounds) => rounds.filter((r) => r.id !== round.id));
		const send = () => {
			held.current.delete(round.id);
			trackSave(organizations.deleteFundingRound(orgId, round.id).then(unwrap))
				.catch((error: Error) => {
					toast.error(error.message);
					setRounds(() => before);
				})
				.finally(() => queryClient.invalidateQueries({ queryKey: companyKeys.full(orgId) }));
		};
		held.current.set(round.id, { timer: setTimeout(send, UNDO_MS), send });
		undoToast(`${round.round} removed`, () => {
			clearTimeout(held.current.get(round.id)?.timer);
			held.current.delete(round.id);
			setRounds(() => before);
		});
	};

	useEffect(() => {
		const pending = held.current;
		return () => {
			for (const { timer, send } of pending.values()) {
				clearTimeout(timer);
				send();
			}
		};
	}, []);

	return { add, remove };
}
