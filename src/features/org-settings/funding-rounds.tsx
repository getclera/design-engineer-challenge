"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CompanyProfile } from "./company-profile";
import { FIELD_CLASSES, FieldError } from "./settings-fields";
import type { useFundingRounds } from "./use-company-profile";

export function FundingRounds({
	profile,
	readOnly,
	funding,
}: {
	profile: CompanyProfile;
	readOnly: boolean;
	funding: ReturnType<typeof useFundingRounds>;
}) {
	const [adding, setAdding] = useState(false);
	const [problem, setProblem] = useState<string | null>(null);
	const [bad, setBad] = useState<"round" | "amount" | null>(null);
	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
		const missing = !data.round.trim() ? "round" : !data.amount.trim() ? "amount" : null;
		setBad(missing);
		if (missing) {
			(e.currentTarget.elements.namedItem(missing) as HTMLInputElement | null)?.focus();
			return setProblem(missing === "round" ? "Name the round, like Seed" : "Add the amount, like $3M");
		}
		setProblem(null);
		funding.add.mutate(
			{ round: data.round, amount: data.amount, date: data.date, investors: data.investors },
			{
				onSuccess: (round) => {
					setAdding(false);
					toast.success(`${round.round} added`);
				},
				onError: (error) => setProblem(error.message),
			},
		);
	};
	return (
		<div className="flex flex-col gap-2">
			{profile.rounds.length === 0 && (
				<p className="font-v2-body text-sm text-v2-text-tertiary">
					No funding rounds on file yet. Add your first round to show it to candidates.
				</p>
			)}
			<ul className="flex flex-col gap-1.5">
				{profile.rounds.map((round) => (
					<li
						key={round.id}
						className="flex items-center gap-3 rounded-v2-md border border-v2-border-divider px-3 py-2.5 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none"
					>
						<div className="min-w-0 flex-1">
							<p className="flex flex-wrap items-center gap-2 font-medium font-v2-body text-sm text-v2-text-primary">
								{round.round} · {round.amount}
								{round.auto && (
									<span className="rounded-v2-sm border border-v2-border-divider bg-v2-bg-warm px-1.5 font-normal text-2xs text-v2-text-tertiary">
										Auto-detected
									</span>
								)}
							</p>
							{(round.date || round.investors) && (
								<p className="truncate font-v2-body text-v2-text-tertiary text-xs">
									{[round.date, round.investors].filter(Boolean).join(" · ")}
								</p>
							)}
						</div>
						{!readOnly && (
							<button
								type="button"
								onClick={() => funding.remove(round)}
								aria-label={`Remove ${round.round}`}
								className="grid size-8 place-items-center rounded-v2-md text-v2-text-tertiary transition-colors hover:bg-v2-bg-input-solid hover:text-v2-status-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal"
							>
								<Trash size={15} />
							</button>
						)}
					</li>
				))}
			</ul>
			{!readOnly &&
				(adding ? (
					<form
						noValidate
						onSubmit={submit}
						className="grid gap-2 rounded-v2-md bg-v2-bg-warm p-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
					>
						<RoundInput name="round" label="Round" placeholder="Seed" autoFocus invalid={bad === "round"} />
						<RoundInput name="amount" label="Amount" placeholder="$3M" invalid={bad === "amount"} />
						<RoundInput name="date" label="Date" placeholder="Jan 2024" />
						<div className="flex items-end gap-1.5">
							<Button type="submit" size="sm" disabled={funding.add.isPending}>
								Add
							</Button>
							<Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
								Cancel
							</Button>
						</div>
						<div className="sm:col-span-4">
							<RoundInput
								name="investors"
								label="Investors"
								hint="Separate with commas"
								placeholder="Index Ventures, Seedcamp"
							/>
						</div>
						<div className="sm:col-span-4">
							<FieldError id="e-round">{problem ?? undefined}</FieldError>
						</div>
					</form>
				) : (
					<Button variant="ghost" size="sm" className="gap-1.5 self-start" onClick={() => setAdding(true)}>
						<Plus size={14} /> Add round
					</Button>
				))}
		</div>
	);
}

export function RoundInput({
	name,
	label,
	hint,
	placeholder,
	autoFocus,
	invalid,
}: {
	name: string;
	label: string;
	/** Shown under the field, where it stays visible while typing (a placeholder would vanish). */
	hint?: string;
	placeholder: string;
	autoFocus?: boolean;
	invalid?: boolean;
}) {
	const ref = useRef<HTMLInputElement>(null);
	// The form opens from a click on "Add round": the next thing is typing.
	useEffect(() => {
		if (autoFocus) ref.current?.focus();
	}, [autoFocus]);
	return (
		<label className="flex flex-col gap-1 font-medium font-v2-body text-v2-text-secondary text-xs">
			{label}
			<input
				ref={ref}
				name={name}
				placeholder={placeholder}
				aria-invalid={invalid || undefined}
				aria-describedby={invalid ? "e-round" : undefined}
				className={cn(FIELD_CLASSES, "bg-v2-bg-card font-normal")}
			/>
			{hint && <span className="font-normal text-v2-text-tertiary">{hint}</span>}
		</label>
	);
}
