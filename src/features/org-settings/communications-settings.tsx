"use client";

import { CaretDown, CaretRight, EnvelopeSimple, Hash, Info, SlackLogo, WarningCircle } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Checkbox } from "@v2/components/ui/checkbox";
import { Tag } from "@v2/components/ui/tag";
import { cn } from "@v2/lib/utils";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { organizations, unwrap } from "@/services/api";
import { ViewOnlyNote } from "./company-settings";
import {
	type Channel,
	candidatesGoNowhere,
	DELIVERY_KINDS,
	type Delivery,
	type DeliveryKind,
	FREQUENCIES,
	type MyNotifications,
} from "./delivery";
import { deliveryKey } from "./keys";
import type { MyProfile } from "./my-profile";
import { trackSave, undoToast } from "./save-status";
import { FIELD_CLASSES, FieldLabel, Switch } from "./settings-fields";
import { useMyProfile, useSaveMyProfile } from "./use-my-profile";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Settings › Communications: where new candidates land (company-wide, owners edit), how often, a preview of the
 * message, then your own reminders (everyone edits their own).
 */
export function CommunicationsSettings({
	orgId,
	canEdit,
	ownerName,
	atsHref,
}: {
	orgId: string;
	canEdit: boolean;
	ownerName: string | null;
	atsHref: string;
}) {
	const queryClient = useQueryClient();
	const { data: delivery } = useQuery({
		queryKey: deliveryKey(orgId),
		queryFn: () => organizations.getDeliveryChannels(orgId).then(unwrap) as Promise<unknown> as Promise<Delivery>,
	});
	const { data: me } = useMyProfile(orgId);
	const [previewOpen, setPreviewOpen] = useState(false);

	const change = useMutation({
		mutationFn: (next: Partial<Delivery>) =>
			trackSave(
				organizations.setDeliveryChannels(orgId, next as never).then(unwrap) as Promise<unknown> as Promise<Delivery>,
			),
		onMutate: (next) => queryClient.setQueryData<Delivery>(deliveryKey(orgId), (old) => old && { ...old, ...next }),
		onError: (error) => toast.error(error.message),
		onSettled: () => queryClient.invalidateQueries({ queryKey: deliveryKey(orgId) }),
	});
	const connectSlack = useMutation({
		mutationFn: () => trackSave(organizations.connectSlack(orgId, { userEmail: me?.email ?? "" }).then(unwrap)),
		onSuccess: (state) => toast.success(`Slack connected. New candidates go to ${state.channelName}.`),
		onError: (error) => toast.error(error.message),
		onSettled: () => queryClient.invalidateQueries({ queryKey: deliveryKey(orgId) }),
	});

	if (!delivery) return null;
	const nowhere = candidatesGoNowhere(delivery);
	const tick = (kind: DeliveryKind, channel: Channel, on: boolean) =>
		change.mutate({ grid: { ...delivery.grid, [kind]: { ...delivery.grid[kind], [channel]: on } } });
	const removeEmail = (email: string) => {
		const before = delivery.emails;
		change.mutate({ emails: before.filter((e) => e !== email) });
		undoToast(`Removed ${email}`, () => change.mutate({ emails: before }));
	};

	return (
		<div className="flex flex-col gap-4">
			{!canEdit && <ViewOnlyNote ownerName={ownerName} extra=" Your own Notifications are yours to change." />}
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="flex min-w-0 flex-col gap-4">
					<Block
						title="Where new candidates land"
						sub="Pick where each kind of update lands. We send to every box you tick."
					>
						<div className="mx-5 overflow-x-auto rounded-v2-lg border border-v2-border-divider max-lg:mx-4">
							<table className="w-full min-w-120 border-collapse font-v2-body text-sm">
								<thead>
									<tr className="font-medium text-2xs text-v2-text-secondary uppercase tracking-wider">
										<th scope="col" className="w-2/5 px-4 py-2.5 text-left">
											<span className="sr-only">Update</span>
										</th>
										<th scope="col" className="px-2 py-2.5">
											Slack
										</th>
										<th scope="col" className="px-2 py-2.5">
											Email
										</th>
										<th scope="col" className="px-2 py-2.5">
											<span className="inline-flex items-center gap-1" title="Connect your ATS in Integrations">
												ATS <Info size={12} className="text-v2-text-tertiary" />
											</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{DELIVERY_KINDS.map((kind) => (
										<tr key={kind.key} className="border-v2-border-divider border-t">
											<th scope="row" className="px-4 py-2.5 text-left font-normal text-v2-text-primary">
												{kind.title}
												{kind.sub && <span className="block text-v2-text-tertiary text-xs">{kind.sub}</span>}
											</th>
											{(["slack", "email"] as const).map((channel) => (
												<td key={channel} className="px-2 py-2.5 text-center">
													<Checkbox
														checked={delivery.grid[kind.key][channel]}
														onCheckedChange={(on) => tick(kind.key, channel, on === true)}
														disabled={!canEdit || (channel === "slack" && !delivery.slackChannel)}
														aria-label={`${kind.title} by ${channel === "slack" ? "Slack" : "email"}`}
														className="size-4.5"
													/>
												</td>
											))}
											<td className="px-2 py-2.5 text-center text-v2-text-tertiary">
												{kind.key === "submissions" ? (
													<Checkbox disabled aria-label="ATS not connected" className="size-4.5" />
												) : (
													"–"
												)}
											</td>
										</tr>
									))}
									<tr className="border-v2-border-divider border-t bg-v2-bg-warm align-top text-xs">
										<th scope="row" className="px-4 py-2.5 text-left font-normal text-v2-text-secondary">
											Sends to
										</th>
										<td className="px-2 py-2 text-center">
											{delivery.slackChannel ? (
												<span className="inline-flex items-center gap-1 text-v2-text-primary">
													<Hash size={13} />
													{delivery.slackChannel.replace(/^#/, "")}
												</span>
											) : canEdit ? (
												<Button
													variant="ghost"
													size="compact"
													className="gap-1.5 bg-v2-bg-card"
													onClick={() => connectSlack.mutate()}
													disabled={connectSlack.isPending}
												>
													<SlackLogo size={13} /> {connectSlack.isPending ? "Connecting…" : "Connect Slack"}
												</Button>
											) : (
												<span className="text-v2-text-tertiary">Not connected</span>
											)}
										</td>
										<td className="px-2 py-2 text-center">
											<ul className="flex flex-col items-center gap-1">
												{delivery.emails.map((email) => (
													<li key={email}>
														<Tag
															className="h-6 max-w-44 bg-v2-bg-card px-2 text-xs"
															onDismiss={canEdit ? () => removeEmail(email) : undefined}
															dismissLabel={`Remove ${email}`}
														>
															<span className="truncate">{email}</span>
														</Tag>
													</li>
												))}
												{delivery.emails.length === 0 && <li className="text-v2-text-tertiary">No email yet</li>}
											</ul>
										</td>
										<td className="px-2 py-2 text-center">
											<Link
												href={atsHref}
												className="font-medium text-v2-text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal"
											>
												Connect your ATS
											</Link>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						{nowhere && (
							<p
								role="status"
								className="mx-5 mt-3 flex items-center gap-2 rounded-v2-md bg-v2-status-warning-bg px-3 py-2 font-medium font-v2-body text-v2-status-warning text-xs animate-in fade-in motion-reduce:animate-none max-lg:mx-4"
							>
								<WarningCircle size={14} className="shrink-0" />
								No one gets new candidates. Tick at least one box for Candidate submissions.
							</p>
						)}
						<div className="flex flex-col gap-4 px-5 py-4 max-lg:px-4">
							{canEdit && (
								<AddEmail
									onAdd={(email) => {
										if (delivery.emails.includes(email)) return "Already on the list";
										change.mutate({ emails: [...delivery.emails, email] });
										return null;
									}}
								/>
							)}
							<div className="flex flex-col gap-1.5">
								<FieldLabel>How often</FieldLabel>
								<fieldset aria-label="How often" className="m-0 grid min-w-0 gap-2 border-0 p-0 sm:grid-cols-3">
									{FREQUENCIES.map((f) => (
										<button
											key={f.key}
											type="button"
											aria-pressed={delivery.frequency === f.key}
											disabled={!canEdit && delivery.frequency !== f.key}
											onClick={() => canEdit && change.mutate({ frequency: f.key })}
											className={cn(
												"rounded-v2-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal disabled:cursor-default disabled:opacity-60",
												delivery.frequency === f.key
													? "border-v2-status-active bg-v2-status-success-bg"
													: "border-v2-border-divider bg-v2-bg-card hover:border-v2-border-default",
												!canEdit && "cursor-default",
											)}
										>
											<span className="block font-medium font-v2-body text-sm text-v2-text-primary">{f.title}</span>
											<span className="font-v2-body text-v2-text-tertiary text-xs">{f.sub}</span>
										</button>
									))}
								</fieldset>
							</div>
						</div>
					</Block>
					{me && <Notifications orgId={orgId} me={me} />}
				</div>
				<aside className="flex flex-col gap-2 max-lg:order-first lg:sticky lg:top-4" aria-label="Preview">
					<button
						type="button"
						aria-expanded={previewOpen}
						onClick={() => setPreviewOpen((o) => !o)}
						className="flex items-center justify-between rounded-v2-lg border border-v2-border-divider bg-v2-bg-card px-4 py-2.5 font-medium font-v2-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal lg:hidden"
					>
						Preview
						{previewOpen ? <CaretDown size={14} /> : <CaretRight size={14} />}
					</button>
					<p className="flex items-center gap-1.5 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider max-lg:hidden">
						<span className="size-1.5 animate-pulse rounded-full bg-v2-brand-green motion-reduce:animate-none" />
						Preview
					</p>
					<div className={cn(!previewOpen && "max-lg:hidden")}>
						<MessagePreview delivery={delivery} />
					</div>
				</aside>
			</div>
		</div>
	);
}

CommunicationsSettings.displayName = "CommunicationsSettings";

function Block({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
	return (
		<Card>
			<section aria-label={title}>
				<header className="px-5 pt-4 pb-3 max-lg:px-4">
					<h2 className="font-v2-heading text-lg text-v2-text-primary">{title}</h2>
					<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">{sub}</p>
				</header>
				{children}
			</section>
		</Card>
	);
}

function AddEmail({ onAdd }: { onAdd: (email: string) => string | null }) {
	const [email, setEmail] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const submit = (e: FormEvent) => {
		e.preventDefault();
		const value = email.trim().toLowerCase();
		if (!EMAIL.test(value)) return setProblem("That doesn't look like an email address");
		const refused = onAdd(value);
		setProblem(refused);
		if (!refused) setEmail("");
	};
	return (
		<form noValidate onSubmit={submit} className="flex flex-col gap-1.5">
			<FieldLabel htmlFor="f-new-email">Use a different email address</FieldLabel>
			<div className="flex gap-2">
				<input
					id="f-new-email"
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						setProblem(null);
					}}
					placeholder="hiring@company.com"
					aria-invalid={problem ? true : undefined}
					className={FIELD_CLASSES}
				/>
				<Button type="submit" size="sm" className="h-auto shrink-0" disabled={!email.trim()}>
					Add
				</Button>
			</div>
			{problem && (
				<p role="alert" className="font-v2-body text-v2-status-error text-xs">
					{problem}
				</p>
			)}
		</form>
	);
}

function Notifications({ orgId, me }: { orgId: string; me: MyProfile }) {
	const { save } = useSaveMyProfile(orgId);
	const set = (change: Partial<MyNotifications>) =>
		save("notifications", { ...me.notifications, ...change }, { now: true });
	return (
		<Block title="Notifications" sub="Email reminders sent to you.">
			<ToggleRow
				title="Candidate review reminders"
				sub="Get an email when candidates are waiting for your review."
				checked={me.notifications.reviewReminders}
				onChange={(on) => set({ reviewReminders: on })}
			/>
			<ToggleRow
				title="Only my roles"
				sub="Only remind me about roles where I'm the hiring manager."
				checked={me.notifications.onlyMyRoles}
				disabled={!me.notifications.reviewReminders}
				onChange={(on) => set({ onlyMyRoles: on })}
			/>
		</Block>
	);
}

function ToggleRow({
	title,
	sub,
	checked,
	disabled,
	onChange,
}: {
	title: string;
	sub: string;
	checked: boolean;
	disabled?: boolean;
	onChange: (on: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-4 border-v2-border-divider border-t px-5 py-3 max-lg:px-4">
			<div className="min-w-0 flex-1">
				<p className="font-medium font-v2-body text-sm text-v2-text-primary">{title}</p>
				<p className="font-v2-body text-v2-text-tertiary text-xs">{sub}</p>
			</div>
			<Switch label={title} checked={checked} disabled={disabled} onChange={onChange} />
		</div>
	);
}

/** Example candidates for the preview only. */
const EXAMPLES = [
	["Lena Brandt", "Backend engineer · ex-Flexport"],
	["Tomás Rey", "Backend engineer · ex-Maersk"],
	["Aiko Mori", "Product designer · ex-Figma"],
] as const;

/** The message a new candidate sends, redrawn as boxes are ticked and "How often" changes. */
function MessagePreview({ delivery }: { delivery: Delivery }) {
	const [tab, setTab] = useState<Channel>("email");
	const on = delivery.grid.submissions[tab];
	const count = delivery.frequency === "now" ? 1 : delivery.frequency === "daily" ? 3 : 11;
	const heading =
		delivery.frequency === "now"
			? "New candidate for Founding Backend Engineer"
			: delivery.frequency === "daily"
				? "3 new candidates today"
				: "11 new candidates this week";
	const people = (
		<ul className="flex flex-col gap-1.5">
			{EXAMPLES.slice(0, Math.min(count, 3)).map(([name, line]) => (
				<li key={name} className="flex items-center gap-2 rounded-v2-md border border-v2-border-divider px-2 py-1.5">
					<span className="grid size-6 shrink-0 place-items-center rounded-full bg-v2-brand-teal font-semibold text-2xs text-white">
						{name
							.split(" ")
							.map((w) => w[0])
							.join("")}
					</span>
					<span className="min-w-0">
						<span className="block truncate font-medium text-v2-text-primary text-xs">{name}</span>
						<span className="block truncate text-2xs text-v2-text-tertiary">{line}</span>
					</span>
				</li>
			))}
			{count > 3 && <li className="text-2xs text-v2-text-tertiary">and {count - 3} more</li>}
		</ul>
	);
	return (
		<Card className="font-v2-body">
			<div role="tablist" aria-label="Preview" className="flex gap-0.5 border-v2-border-divider border-b p-1">
				{(
					[
						["email", "Email", EnvelopeSimple],
						["slack", "Slack", SlackLogo],
					] as const
				).map(([key, label, Icon]) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={tab === key}
						onClick={() => setTab(key)}
						className={cn(
							"flex flex-1 items-center justify-center gap-1.5 rounded-v2-md py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal",
							tab === key ? "bg-v2-bg-input-solid font-medium text-v2-text-primary" : "text-v2-text-secondary",
						)}
					>
						<Icon size={13} /> {label}
					</button>
				))}
			</div>
			{!on || (tab === "slack" && !delivery.slackChannel) || (tab === "email" && !delivery.emails.length) ? (
				<p className="px-4 py-6 text-center text-v2-text-tertiary text-xs">
					{tab === "slack" && !delivery.slackChannel
						? "Connect Slack to send here."
						: tab === "email" && !delivery.emails.length
							? "Add an email address to send here."
							: `${tab === "email" ? "Email" : "Slack"} is off for Candidate submissions. Tick the box to send here.`}
				</p>
			) : tab === "email" ? (
				<div className="flex flex-col gap-2.5 p-4 text-xs">
					<p className="text-2xs text-v2-text-tertiary">
						To <b className="font-medium text-v2-text-primary">{delivery.emails.join(", ")}</b>
						<br />
						From Clera
					</p>
					<p className="font-v2-heading text-base text-v2-text-primary leading-snug">{heading}</p>
					{people}
					<span className="self-start rounded-v2-md bg-v2-brand-teal-dark px-2.5 py-1 font-medium text-white">
						Review in Clera
					</span>
				</div>
			) : (
				<div className="flex gap-2.5 p-4 text-xs">
					<span className="grid size-8 shrink-0 place-items-center rounded-v2-md bg-v2-brand-teal font-semibold text-white">
						C
					</span>
					<div className="min-w-0 flex-1">
						<p>
							<b className="font-semibold text-v2-text-primary">Clera</b>{" "}
							<span className="text-2xs text-v2-text-tertiary">{delivery.slackChannel} · 9:00</span>
						</p>
						<p className="mb-1.5 text-v2-text-primary">{heading}</p>
						<div className="border-v2-brand-green border-l-3 pl-2.5">{people}</div>
					</div>
				</div>
			)}
			<p className="border-v2-border-divider border-t px-4 py-2 text-2xs text-v2-text-tertiary">Example candidates</p>
		</Card>
	);
}
