"use client";

import { CaretDown, CaretRight, Lock, SignOut } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { callApi, unwrap } from "@/services/api/client";
import { ImagePick } from "./image-drop";
import type { MyProfile } from "./my-profile";
import { trackSave } from "./save-status";
import { FIELD_CLASSES, FieldError, FieldLabel } from "./settings-fields";
import { useMyProfile, useSaveMyProfile } from "./use-my-profile";

/** Settings › Profile: your photo, name and title, your booking link, and leaving the company. */
export function ProfileSettings({ orgId, companyName }: { orgId: string; companyName: string }) {
	const { data: me } = useMyProfile(orgId);
	const { save, savedAt, errors } = useSaveMyProfile(orgId);
	const [previewOpen, setPreviewOpen] = useState(false);
	if (!me) return null;

	return (
		<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
			<Card>
				<Row title="Profile photo" sub="Shown to teammates and candidates.">
					<div className="flex items-center gap-4">
						<ImagePick
							id="f-photo"
							label="Change your photo"
							shape="round"
							onPick={(avatarUrl) => {
								save("avatarUrl", avatarUrl, { now: true });
								toast.success("Photo updated");
							}}
						>
							<UserAvatar
								name={me.name || me.email}
								src={me.avatarUrl}
								generated={!me.avatarUrl}
								size="lg"
								className="size-16"
							/>
						</ImagePick>
						<p className="font-v2-body text-v2-text-tertiary text-xs">JPEG, PNG, GIF, or WebP.</p>
					</div>
				</Row>
				<Row title="Personal information" sub="How your name shows up.">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<FieldLabel htmlFor="f-me-name" savedAt={savedAt.name}>
								Full name
							</FieldLabel>
							<input
								id="f-me-name"
								value={me.name}
								onChange={(e) =>
									save("name", e.target.value, { invalid: e.target.value.trim() ? undefined : "Add your name" })
								}
								placeholder="Jane Doe"
								autoComplete="name"
								aria-invalid={errors.name ? true : undefined}
								className={FIELD_CLASSES}
							/>
							<FieldError id="e-me-name">{errors.name}</FieldError>
						</div>
						<div className="flex flex-col gap-1.5">
							<FieldLabel htmlFor="f-me-title" savedAt={savedAt.title}>
								Job title
							</FieldLabel>
							<input
								id="f-me-title"
								value={me.title}
								onChange={(e) => save("title", e.target.value)}
								placeholder="e.g. CTO"
								autoComplete="organization-title"
								className={FIELD_CLASSES}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<FieldLabel htmlFor="f-me-email">Email</FieldLabel>
							<div className="relative">
								<input
									id="f-me-email"
									value={me.email}
									readOnly
									className={cn(FIELD_CLASSES, "pr-9 text-v2-text-secondary")}
								/>
								<Lock size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-v2-text-tertiary" />
							</div>
							<p className="font-v2-body text-v2-text-tertiary text-xs">
								Your sign-in email. It can't be changed here.
							</p>
						</div>
					</div>
				</Row>
				<Row title="Calendar link" sub="Candidates book intro calls with you through this link.">
					<CalendarLink me={me} error={errors.calendarLink} savedAt={savedAt.calendarLink} save={save} />
				</Row>
				<Row title={`Leave ${companyName}`} sub="You lose access at once. An owner can invite you back.">
					<Leave orgId={orgId} companyName={companyName} onlyOwner={me.onlyOwner} />
				</Row>
			</Card>
			<aside
				className="flex flex-col gap-2 max-lg:order-first lg:sticky lg:top-4"
				aria-label="How you show up in intros"
			>
				<button
					type="button"
					aria-expanded={previewOpen}
					onClick={() => setPreviewOpen((o) => !o)}
					className="flex items-center justify-between rounded-v2-lg border border-v2-border-divider bg-v2-bg-card px-4 py-2.5 font-medium font-v2-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal lg:hidden"
				>
					How you show up in intros
					{previewOpen ? <CaretDown size={14} /> : <CaretRight size={14} />}
				</button>
				<p className="flex items-center gap-1.5 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider max-lg:hidden">
					<span className="size-1.5 animate-pulse rounded-full bg-v2-brand-green motion-reduce:animate-none" />
					How you show up in intros
				</p>
				<div className={cn(!previewOpen && "max-lg:hidden")}>
					<IntroPreview me={me} companyName={companyName} />
				</div>
			</aside>
		</div>
	);
}

ProfileSettings.displayName = "ProfileSettings";

function Row({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
	return (
		<section
			aria-label={title}
			className="grid gap-3 border-v2-border-divider border-t px-5 py-4.5 first:border-t-0 md:grid-cols-[12.5rem_minmax(0,1fr)] md:gap-4 max-lg:px-4"
		>
			<div>
				<h2 className="font-v2-heading text-base text-v2-text-primary">{title}</h2>
				<p className="mt-0.5 text-pretty font-v2-body text-v2-text-tertiary text-xs">{sub}</p>
			</div>
			<div className="min-w-0">{children}</div>
		</section>
	);
}

function CalendarLink({
	me,
	error,
	savedAt,
	save,
}: {
	me: MyProfile;
	error?: string;
	savedAt?: number;
	save: ReturnType<typeof useSaveMyProfile>["save"];
}) {
	if (!me.contactId)
		return (
			<p className="font-v2-body text-sm text-v2-text-tertiary">
				You're not the contact for any role yet. An owner sets this in Members › Contacts.
			</p>
		);
	return (
		<div data-field="calendar" className="flex flex-col gap-1.5 rounded-v2-md">
			<FieldLabel htmlFor="f-me-calendar" savedAt={savedAt}>
				Booking link
			</FieldLabel>
			<input
				id="f-me-calendar"
				type="url"
				inputMode="url"
				value={me.calendarLink ?? ""}
				onChange={(e) => {
					const value = e.target.value;
					save("calendarLink", value, {
						invalid:
							value.trim() && !/^https:\/\/\S+\.\S+/.test(value.trim())
								? "Paste the full link, starting with https://"
								: undefined,
					});
				}}
				placeholder="https://cal.com/…"
				aria-invalid={error ? true : undefined}
				className={FIELD_CLASSES}
			/>
			<FieldError id="e-me-calendar">{error}</FieldError>
			{me.roles.length > 0 && (
				<div className="flex flex-wrap items-center gap-1.5 font-v2-body text-xs">
					<span className="text-v2-text-tertiary">Used for</span>
					{me.roles.map((role) => (
						<span
							key={role.id}
							className="rounded-v2-sm border border-v2-border-divider bg-v2-bg-warm px-1.5 py-px text-v2-text-secondary"
						>
							{role.position}
						</span>
					))}
				</div>
			)}
		</div>
	);
}

/** Can't be undone from here, so it asks once, in place: no dialog. */
function Leave({ orgId, companyName, onlyOwner }: { orgId: string; companyName: string; onlyOwner: boolean }) {
	const [asking, setAsking] = useState(false);
	const cancelRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (asking) cancelRef.current?.focus();
	}, [asking]);
	const leave = useMutation({
		mutationFn: () =>
			trackSave(
				callApi<{ success: boolean }, undefined>(`/api/organizations/${orgId}/me`, undefined, {
					method: "DELETE",
				}).then(unwrap),
			),
		// You no longer have access to anything here: start over from the home page.
		onSuccess: () => window.location.assign("/"),
		onError: (error) => toast.error(error.message),
	});
	if (onlyOwner)
		return (
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="ghost" size="sm" disabled className="gap-1.5 text-v2-status-error">
					<SignOut size={14} /> Leave
				</Button>
				<p className="font-v2-body text-v2-text-tertiary text-xs">
					You're the only owner. Make someone else an owner first.
				</p>
			</div>
		);
	if (!asking)
		return (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setAsking(true)}
				className="gap-1.5 border-v2-status-error/35 text-v2-status-error hover:bg-v2-status-error/8"
			>
				<SignOut size={14} /> Leave
			</Button>
		);
	return (
		<div
			role="alertdialog"
			aria-label={`Leave ${companyName}?`}
			className="flex flex-wrap items-center gap-2 rounded-v2-lg bg-v2-status-error/7 px-3 py-2 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
		>
			<p className="mr-auto font-v2-body text-sm text-v2-text-primary">Leave {companyName}? You'll lose access.</p>
			<Button ref={cancelRef} variant="ghost" size="sm" onClick={() => setAsking(false)} className="bg-v2-bg-card">
				Cancel
			</Button>
			<Button
				variant="unstyled"
				size="sm"
				onClick={() => leave.mutate()}
				disabled={leave.isPending}
				className="inline-flex items-center rounded-v2-md bg-v2-status-error font-medium text-white hover:opacity-90"
			>
				{leave.isPending ? "Leaving…" : "Leave"}
			</Button>
		</div>
	);
}

/** The intro email candidates get: your name, title and photo, and a booking button only if you have a link. */
function IntroPreview({ me, companyName }: { me: MyProfile; companyName: string }) {
	const first = me.name.trim().split(/\s+/)[0];
	return (
		<Card className="flex flex-col gap-2.5 p-4 font-v2-body text-xs">
			<p className="text-2xs text-v2-text-tertiary">
				To <b className="font-medium text-v2-text-primary">a candidate</b>
				<br />
				From Clera, on behalf of {companyName}
			</p>
			<p className="font-v2-heading text-base text-v2-text-primary leading-snug">
				{first || "Someone"} from {companyName} would like to meet you
			</p>
			<p className="text-v2-text-secondary">Pick a time that works for you.</p>
			{me.calendarLink ? (
				<span className="self-start rounded-v2-md bg-v2-brand-teal-dark px-2.5 py-1 font-medium text-white">
					Book a call
				</span>
			) : (
				<span className="text-v2-text-muted italic">No calendar link: no booking button</span>
			)}
			<div className="flex items-center gap-2.5 border-v2-border-divider border-t pt-2.5">
				<UserAvatar name={me.name || me.email} src={me.avatarUrl} generated={!me.avatarUrl} size="sm" />
				<div className="min-w-0">
					<p className="truncate font-medium text-sm text-v2-text-primary">
						{me.name || <span className="text-v2-text-muted italic">Your name</span>}
					</p>
					<p className="truncate text-v2-text-tertiary">
						{me.title || <span className="italic">Job title</span>} · {companyName}
					</p>
				</div>
			</div>
		</Card>
	);
}
