"use client";

import { CaretDown, CheckCircle, Plus, WarningCircle } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { resolveEffectiveHmContact, resolveRoleIntroReadiness } from "@v2/features/company-contacts";
import { invalidateOrgDashboard } from "@v2/features/org-review";
import { useRolesList } from "@v2/features/org-roles";
import { cn } from "@v2/lib/utils";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { companyKeys, roleKeys } from "@/lib/query-keys";
import { reviewFeedQueryOptions } from "@/lib/review-feed";
import { type ContactOption, companyContacts, organizations, unwrap } from "@/services/api";
import { looksLikeUrl } from "./company-profile";
import { focusField } from "./focus-field";
import { trackSave, undoToast } from "./save-status";
import { FIELD_CLASSES } from "./settings-fields";
import { firstName, fullName, plural, useFirstFocus } from "./people";
import { MenuItem, SectionCard } from "./settings-fields";

/* ---------------------------------------------------------------- hiring managers */

export function HiringManagers({ orgId, canEdit }: { orgId: string; canEdit: boolean }) {
	const queryClient = useQueryClient();
	const { data: contacts = [] } = useQuery({
		queryKey: companyKeys.contactOptions(orgId),
		queryFn: () => companyContacts.listActive(orgId).then(unwrap),
	});
	const { data: roles = [] } = useRolesList(orgId, false);
	const { data: feed } = useQuery(reviewFeedQueryOptions(orgId));
	const [adding, setAdding] = useState<string | null>(null);
	const ordered = [...roles].sort((a, b) => Number(a.status === "paused") - Number(b.status === "paused"));

	const assign = useMutation({
		mutationFn: ({ roleId, contactId }: { roleId: string; contactId: string }) =>
			trackSave(organizations.updateRole(orgId, roleId, { companyContactId: contactId }).then(unwrap)),
		onError: (error) => toast.error(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.organizationRolesAll(orgId) });
			invalidateOrgDashboard(queryClient);
		},
	});
	const pick = (roleId: string, roleName: string, contact: ContactOption, previous: string | null) => {
		assign.mutate({ roleId, contactId: contact.id });
		undoToast(`${fullName(contact)} takes intro calls for ${roleName}`, () => {
			if (previous) assign.mutate({ roleId, contactId: previous });
		});
	};

	return (
		<SectionCard
			title="Contacts"
			sub="People at your company we should know about: primary point of contact, who to CC on intros, and more."
		>
			<div
				aria-hidden="true"
				className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)] gap-3 border-v2-border-divider border-t bg-v2-bg-warm px-5 py-2 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider max-md:hidden"
			>
				<span>Role</span>
				<span>Candidates meet</span>
				<span>Calendar link</span>
			</div>
			{ordered.map((role) => {
				const paused = role.status === "paused";
				const hm = resolveEffectiveHmContact(contacts, role.companyContactId);
				const ready = resolveRoleIntroReadiness(contacts, role.companyContactId).ready;
				const waiting = feed?.byRole[role.id]?.pending ?? 0;
				return (
					<div
						key={role.id}
						data-scope={role.id}
						className={cn("border-v2-border-divider border-t", paused && "opacity-60")}
					>
						<div className="grid items-center gap-3 px-5 py-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)] max-lg:px-4">
							<div className="min-w-0">
								<p className="truncate font-medium font-v2-body text-sm text-v2-text-primary">{role.position}</p>
								<p className="font-v2-body text-v2-text-tertiary text-xs">
									{paused ? "Paused" : waiting ? `${waiting} waiting on you` : "Nobody waiting"}
								</p>
							</div>
							<div data-field="hm" data-scope={role.id} className="min-w-0 rounded-v2-md">
								<PersonPicker
									contacts={contacts}
									current={hm}
									disabled={!canEdit || paused}
									onPick={(c) => c.id !== hm?.id && pick(role.id, role.position, c, hm?.id ?? null)}
									onAddNew={() => setAdding(role.id)}
								/>
							</div>
							<div data-field="calendar" data-scope={role.id} className="min-w-0 rounded-v2-md">
								{paused ? (
									<span className="font-v2-body text-sm text-v2-text-tertiary">Role paused</span>
								) : !hm ? (
									<Missing>Pick who takes the calls</Missing>
								) : ready ? (
									<span className="flex min-w-0 items-center gap-1.5 font-v2-body text-sm text-v2-text-secondary">
										<CheckCircle size={15} className="shrink-0 text-v2-brand-green" />
										<span className="truncate">{hm.calendarLink?.replace(/^https?:\/\//, "")}</span>
									</span>
								) : (
									<CalendarLinkField orgId={orgId} contact={hm} waiting={waiting} canEdit={canEdit} />
								)}
							</div>
						</div>
						{adding === role.id && (
							<NewHiringManager
								orgId={orgId}
								onCancel={() => setAdding(null)}
								onAdded={(contact) => {
									setAdding(null);
									assign.mutate({ roleId: role.id, contactId: contact.id });
									// The new person has no link yet: put the cursor where it goes.
									setTimeout(() => focusField("calendar", role.id), 400);
								}}
							/>
						)}
					</div>
				);
			})}
			<p className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-v2-border-divider border-t px-5 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-4">
				<span className="tabular-nums">
					{plural(contacts.length, "contact")} · {contacts.filter((c) => c.calendarLink).length} ready for introductions
				</span>
				<span>Ready = calendar link added. One link per person, used for every role they take.</span>
			</p>
		</SectionCard>
	);
}

function Missing({ children }: { children: ReactNode }) {
	return (
		<span className="flex items-center gap-1.5 font-medium font-v2-body text-v2-status-warning text-xs">
			<WarningCircle size={14} className="shrink-0" />
			{children}
		</span>
	);
}

function PersonPicker({
	contacts,
	current,
	disabled,
	onPick,
	onAddNew,
}: {
	contacts: ContactOption[];
	current: ContactOption | null;
	disabled: boolean;
	onPick: (contact: ContactOption) => void;
	onAddNew: () => void;
}) {
	const [open, setOpen] = useState(false);
	const trigger = (
		<button
			type="button"
			disabled={disabled}
			className="inline-flex max-w-full items-center gap-2 rounded-v2-md border border-v2-border-divider bg-v2-bg-card py-1 pr-2 pl-1 font-v2-body text-sm transition-colors hover:border-v2-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal disabled:cursor-default disabled:hover:border-v2-border-divider"
		>
			{current ? (
				<>
					<UserAvatar name={fullName(current)} generated size="xs" className="shrink-0" />
					<span className="truncate">{fullName(current)}</span>
				</>
			) : (
				<span className="px-1.5 text-v2-text-tertiary">Choose someone</span>
			)}
			{!disabled && <CaretDown size={12} className="shrink-0 text-v2-text-tertiary" />}
		</button>
	);
	if (disabled) return trigger;
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent align="start" tone="grey" className="w-64 p-1">
				<div role="menu" aria-label="Hiring manager">
					{contacts.map((contact) => (
						<MenuItem
							key={contact.id}
							selected={contact.id === current?.id}
							onSelect={() => {
								setOpen(false);
								onPick(contact);
							}}
							icon={<UserAvatar name={fullName(contact)} generated size="xs" />}
							title={fullName(contact)}
							sub={`${contact.title ?? contact.email}${contact.calendarLink ? "" : " · no calendar link"}`}
						/>
					))}
					<div className="my-1 h-px bg-v2-border-divider" />
					<MenuItem
						onSelect={() => {
							setOpen(false);
							onAddNew();
						}}
						icon={<Plus size={14} className="m-1" />}
						title="Someone new…"
						sub="A teammate who takes the calls"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function CalendarLinkField({
	orgId,
	contact,
	waiting,
	canEdit,
}: {
	orgId: string;
	contact: ContactOption;
	waiting: number;
	canEdit: boolean;
}) {
	const queryClient = useQueryClient();
	const [link, setLink] = useState("");
	const [invalid, setInvalid] = useState(false);
	const name = firstName(fullName(contact));
	const save = useMutation({
		mutationFn: (calendarLink: string) =>
			trackSave(companyContacts.update(orgId, contact.id, { calendarLink }).then(unwrap)),
		onSuccess: () =>
			toast.success(
				waiting
					? `Saved. ${plural(waiting, "candidate")} can book ${name} directly now.`
					: `Saved. Candidates can book ${name} directly now.`,
			),
		onError: (error) => toast.error(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: companyKeys.contactOptions(orgId) });
			invalidateOrgDashboard(queryClient);
		},
	});
	const submit = (e: FormEvent) => {
		e.preventDefault();
		const value = link.trim();
		if (!looksLikeUrl(value)) return setInvalid(true);
		save.mutate(/^https?:\/\//.test(value) ? value.replace(/^http:/, "https:") : `https://${value}`);
	};
	return (
		<div className="flex flex-col gap-1.5">
			<Missing>{waiting ? `${plural(waiting, "candidate")} can't book a call` : "No calendar link yet"}</Missing>
			{canEdit && (
				<form onSubmit={submit} noValidate className="flex gap-1.5">
					<input
						value={link}
						onChange={(e) => {
							setLink(e.target.value);
							setInvalid(false);
						}}
						type="url"
						inputMode="url"
						aria-label={`${name}'s booking link`}
						aria-invalid={invalid || undefined}
						placeholder={`Paste ${name}'s booking link`}
						className={cn(FIELD_CLASSES, "py-1.5")}
					/>
					<Button type="submit" size="sm" disabled={save.isPending} className="h-8.5 shrink-0">
						Save
					</Button>
				</form>
			)}
			{invalid && (
				<p role="alert" className="font-v2-body text-v2-status-error text-xs">
					Paste a link, like cal.com/{name.toLowerCase()}
				</p>
			)}
		</div>
	);
}

function NewHiringManager({
	orgId,
	onCancel,
	onAdded,
}: {
	orgId: string;
	onCancel: () => void;
	onAdded: (contact: ContactOption) => void;
}) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [title, setTitle] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const first = useFirstFocus();
	const create = useMutation({
		mutationFn: () => {
			const [first, ...rest] = name.trim().split(/\s+/);
			return trackSave(
				companyContacts
					.create(orgId, {
						firstName: first ?? "",
						lastName: rest.join(" "),
						email: email.trim(),
						title: title.trim() || null,
						phone: null,
						linkedinUrl: null,
						calendarLink: null,
						isPrimary: false,
						shouldCc: false,
					})
					.then(unwrap),
			);
		},
		onSuccess: (contact) => {
			queryClient.setQueryData<ContactOption[]>(companyKeys.contactOptions(orgId), (old) => [
				...(old ?? []),
				contact as unknown as ContactOption,
			]);
			onAdded(contact as unknown as ContactOption);
		},
		onError: (error) => setProblem(error.message),
		onSettled: () => queryClient.invalidateQueries({ queryKey: companyKeys.contactOptions(orgId) }),
	});
	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				if (!name.trim()) return setProblem("Add their name");
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
					return setProblem("That doesn't look like an email address");
				setProblem(null);
				create.mutate();
			}}
			className="grid gap-2 border-v2-border-divider border-t bg-v2-bg-warm px-5 py-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] max-lg:px-4"
		>
			<input
				ref={first}
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Full name"
				aria-label="Full name"
				className={cn(FIELD_CLASSES, "bg-v2-bg-card")}
			/>
			<input
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				type="email"
				placeholder="Work email"
				aria-label="Work email"
				className={cn(FIELD_CLASSES, "bg-v2-bg-card")}
			/>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Title (optional)"
				aria-label="Title"
				className={cn(FIELD_CLASSES, "bg-v2-bg-card")}
			/>
			<div className="flex gap-1.5">
				<Button type="submit" size="sm" disabled={create.isPending}>
					Add
				</Button>
				<Button type="button" variant="ghost" size="sm" onClick={onCancel}>
					Cancel
				</Button>
			</div>
			{problem && (
				<p role="alert" className="font-v2-body text-v2-status-error text-xs md:col-span-4">
					{problem}
				</p>
			)}
		</form>
	);
}
