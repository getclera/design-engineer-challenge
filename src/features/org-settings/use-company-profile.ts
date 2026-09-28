"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { companyKeys } from "@/lib/query-keys";
import { organizations, unwrap } from "@/services/api";
import type { CompanyProfile } from "./company-profile";
import { markDirty, trackSave } from "./save-status";

const TYPING_DELAY_MS = 600;

export function useCompanyProfile(orgId: string) {
	return useQuery({
		queryKey: companyKeys.full(orgId),
		queryFn: () => organizations.getCompany<CompanyProfile>(orgId).then(unwrap),
	});
}

type Field = keyof CompanyProfile;

/**
 * Autosave, one field at a time. The screen updates at once (the candidate card too); the request goes out after
 * a pause in typing, or right away for clicks. Leaving the page sends whatever is still waiting.
 */
export function useSaveCompanyField(orgId: string) {
	const queryClient = useQueryClient();
	const timers = useRef(new Map<Field, ReturnType<typeof setTimeout>>());
	const waiting = useRef(new Map<Field, unknown>());
	const [savedAt, setSavedAt] = useState<Partial<Record<Field, number>>>({});
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	const send = useCallback(
		async (field: Field, value: unknown) => {
			waiting.current.delete(field);
			markDirty(field, false);
			try {
				await trackSave(organizations.updateCompany<CompanyProfile>(orgId, { [field]: value }).then(unwrap));
				setErrors(({ [field]: _, ...rest }) => rest);
				setSavedAt((s) => ({ ...s, [field]: Date.now() }));
			} catch (error) {
				setErrors((e) => ({ ...e, [field]: error instanceof Error ? error.message : "Couldn't save" }));
			}
		},
		[orgId],
	);

	/**
	 * `invalid`: the value can't be saved as typed (a half-written link). The screen still shows it, nothing is sent,
	 * and the message appears only after a pause, so it doesn't nag mid-word.
	 */
	const save = useCallback(
		<K extends Field>(
			field: K,
			value: CompanyProfile[K],
			{ now = false, invalid }: { now?: boolean; invalid?: string } = {},
		) => {
			queryClient.setQueryData<CompanyProfile>(companyKeys.full(orgId), (old) => old && { ...old, [field]: value });
			setErrors(({ [field]: _, ...rest }) => rest);
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
		[orgId, queryClient, send],
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
