"use client";

import { CaretDown, Check, CheckCircle, PaperPlaneTilt, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { resolveEffectiveHmContact, resolveRoleIntroReadiness } from "@v2/features/company-contacts";
import { invalidateOrgDashboard } from "@v2/features/org-review";
import { useRolesList } from "@v2/features/org-roles";
import { cn } from "@v2/lib/utils";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { companyKeys, roleKeys } from "@/lib/query-keys";
import { reviewFeedQueryOptions } from "@/lib/review-feed";
import { type ContactOption, companyContacts, organizations, unwrap } from "@/services/api";
import { ViewOnlyNote } from "./company-settings";
import { looksLikeUrl } from "./company-profile";
import { focusField } from "./focus-field";
import { invitationsKey, membersKey } from "./keys";
import { trackSave, UNDO_MS, undoToast } from "./save-status";
import { FIELD_CLASSES } from "./settings-fields";

export interface Member {
	id: string;
	role: "owner" | "viewer";
	firstName: string;
	lastName: string;
	email: string;
	avatarUrl: string | null;
	joinedAt: string;
}
export interface Invitation {
	id: string;
	email: string;
	role: "owner" | "viewer";
	sentAt: string;
}

const fullName = (p: { firstName: string; lastName: string | null; email: string }) =>
	`${p.firstName} ${p.lastName ?? ""}`.trim() || p.email;
const firstName = (name: string) => name.split(" ")[0] || name;
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
const JOINED = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const ROLE_COPY = {
	owner: ["Owner", "Decides on candidates, edits settings"],
	viewer: ["Viewer", "Sees everything, can't decide"],
} as const;

/** Settings › Members: who's in Clera, then Contacts (who candidates meet for each role, and their calendar link). */
export function MembersSettings({
	orgId,
	canEdit,
	meId,
	focus,
	focusRole,
}: {
	orgId: string;
	canEdit: boolean;
	meId: string;
	/** From Review or Home: `calendar` (with a role) or `hm`. */
	focus?: string;
	focusRole?: string;
}) {
	const { data: members = [] } = useQuery({
		queryKey: membersKey(orgId),
		queryFn: () =>
			organizations
				.listMembers<{ members: Member[] }>(orgId)
				.then(unwrap)
				.then((d) => d.members),
	});
	const owners = members.filter((m) => m.role === "owner");

	useEffect(() => {
		if (focus) focusField(focus === "hm" ? "hm" : "calendar", focusRole);
	}, [focus, focusRole]);

	return (
		<div className="flex flex-col gap-5">
			{!canEdit && <ViewOnlyNote ownerName={owners[0] ? fullName(owners[0]) : null} />}
			<People orgId={orgId} canEdit={canEdit} meId={meId} members={members} />
			<HiringManagers orgId={orgId} canEdit={canEdit} />
		</div>
	);
}

MembersSettings.displayName = "MembersSettings";

function SectionCard({
	title,
	sub,
	action,
	children,
}: {
	title: string;
	sub: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Card className="overflow-hidden">
			<section aria-label={title}>
				<header className="flex items-end justify-between gap-3 px-5 pt-4 pb-3 max-lg:px-4 max-sm:flex-col max-sm:items-start">
					<div>
						<h2 className="font-v2-heading text-lg text-v2-text-primary">{title}</h2>
						<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">{sub}</p>
					</div>
					{action}
				</header>
				{children}
			</section>
		</Card>
	);
}

/* ---------------------------------------------------------------- hiring managers */

function HiringManagers({ orgId, canEdit }: { orgId: string; canEdit: boolean }) {
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

function MenuItem({
	selected,
	onSelect,
	icon,
	title,
	sub,
}: {
	selected?: boolean;
	onSelect: () => void;
	icon: ReactNode;
	title: string;
	sub: string;
}) {
	return (
		<button
			type="button"
			role="menuitemradio"
			aria-checked={!!selected}
			onClick={onSelect}
			className="flex w-full items-center gap-2.5 rounded-v2-sm px-2 py-1.5 text-left transition-colors hover:bg-v2-bg-input-solid focus-visible:bg-v2-bg-input-solid focus-visible:outline-none"
		>
			<span className="shrink-0">{icon}</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate font-v2-body text-sm text-v2-text-primary">{title}</span>
				<span className="block truncate font-v2-body text-v2-text-tertiary text-xs">{sub}</span>
			</span>
			{selected && <Check size={14} className="shrink-0 text-v2-brand-green" />}
		</button>
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

/** Forms opened by a click ("Someone new…", Invite): the next thing is typing, so the cursor goes there. */
function useFirstFocus() {
	const ref = useRef<HTMLInputElement>(null);
	useEffect(() => ref.current?.focus(), []);
	return ref;
}

/* ---------------------------------------------------------------- people */

function People({
	orgId,
	canEdit,
	meId,
	members,
}: {
	orgId: string;
	canEdit: boolean;
	meId: string;
	members: Member[];
}) {
	const queryClient = useQueryClient();
	const [inviting, setInviting] = useState(false);
	const { data: invitations = [] } = useQuery({
		queryKey: invitationsKey(orgId),
		queryFn: () =>
			organizations
				.listOrgInvitations<{ invitations: Invitation[] }>(orgId)
				.then(unwrap)
				.then((d) => d.invitations),
	});
	const owners = members.filter((m) => m.role === "owner").length;
	// Removals and cancels wait out the Undo window before they're sent; leaving the page sends them at once.
	const held = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; send: () => void }>());
	useEffect(() => {
		const pending = held.current;
		return () => {
			for (const { timer, send } of pending.values()) {
				clearTimeout(timer);
				send();
			}
		};
	}, []);
	const unhold = (key: string) => {
		clearTimeout(held.current.get(key)?.timer);
		held.current.delete(key);
	};

	const setRole = useMutation({
		mutationFn: ({ member, role }: { member: Member; role: Member["role"] }) =>
			trackSave(organizations.updateMember(orgId, member.id, { role }).then(unwrap)),
		onMutate: ({ member, role }) =>
			queryClient.setQueryData<Member[]>(membersKey(orgId), (old) =>
				old?.map((m) => (m.id === member.id ? { ...m, role } : m)),
			),
		onError: (error) => toast.error(error.message),
		onSettled: () => queryClient.invalidateQueries({ queryKey: membersKey(orgId) }),
	});
	const changeRole = (member: Member, role: Member["role"]) => {
		if (member.role === role) return;
		const was = member.role;
		setRole.mutate({ member, role });
		undoToast(`${member.firstName} is now ${role === "owner" ? "an owner" : "a viewer"}`, () =>
			setRole.mutate({ member: { ...member, role }, role: was }),
		);
	};

	const later = (key: string, list: readonly unknown[], remove: () => Promise<unknown>, restore: () => void) => {
		const send = () => {
			held.current.delete(key);
			trackSave(remove())
				.catch((error: Error) => {
					toast.error(error.message);
					restore();
				})
				.finally(() => queryClient.invalidateQueries({ queryKey: list }));
		};
		held.current.set(key, { timer: setTimeout(send, UNDO_MS), send });
	};
	const removeMember = (member: Member) => {
		const before = queryClient.getQueryData<Member[]>(membersKey(orgId));
		const restore = () => queryClient.setQueryData(membersKey(orgId), before);
		queryClient.setQueryData<Member[]>(membersKey(orgId), (old) => old?.filter((m) => m.id !== member.id));
		later(
			`m:${member.id}`,
			membersKey(orgId),
			() => organizations.deleteMember(orgId, member.id).then(unwrap),
			restore,
		);
		undoToast(`Removed ${fullName(member)}`, () => {
			unhold(`m:${member.id}`);
			restore();
		});
	};
	const cancelInvite = (invitation: Invitation) => {
		const before = queryClient.getQueryData<Invitation[]>(invitationsKey(orgId));
		const restore = () => queryClient.setQueryData(invitationsKey(orgId), before);
		queryClient.setQueryData<Invitation[]>(invitationsKey(orgId), (old) => old?.filter((i) => i.id !== invitation.id));
		later(
			`i:${invitation.id}`,
			invitationsKey(orgId),
			() => organizations.deleteOrgInvitation(orgId, invitation.id).then(unwrap),
			restore,
		);
		undoToast(`Invite to ${invitation.email} cancelled`, () => {
			unhold(`i:${invitation.id}`);
			restore();
		});
	};
	const resend = useMutation({
		mutationFn: (invitation: Invitation) =>
			trackSave(
				fetch(`/api/organizations/${orgId}/invitations/${invitation.id}/resend`, { method: "POST" }).then((r) => {
					if (!r.ok) throw new Error("Couldn't resend. Try again.");
				}),
			),
		onSuccess: (_, invitation) => toast.success(`Sent again to ${invitation.email}`),
		onError: (error) => toast.error(error.message),
		onSettled: () => queryClient.invalidateQueries({ queryKey: invitationsKey(orgId) }),
	});

	return (
		<SectionCard
			title="Team members"
			sub={plural(members.length, "member")}
			action={
				canEdit && (
					<Button
						size="sm"
						variant={inviting ? "ghost" : "primary"}
						onClick={() => setInviting((open) => !open)}
						aria-expanded={inviting}
						className="gap-1.5"
					>
						{inviting ? (
							"Cancel"
						) : (
							<>
								<Plus size={14} /> Invite
							</>
						)}
					</Button>
				)
			}
		>
			{inviting && <InviteRow orgId={orgId} onDone={() => setInviting(false)} />}
			<ul>
				{members.map((member) => {
					const you = member.id === meId;
					const lastOwner = member.role === "owner" && owners === 1;
					return (
						<li
							key={member.id}
							className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-v2-border-divider border-t px-5 py-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.7fr)_2.5rem] max-lg:px-4"
						>
							<div className="flex min-w-0 items-center gap-2.5">
								<UserAvatar
									name={fullName(member)}
									src={member.avatarUrl}
									generated={!member.avatarUrl}
									size="sm"
									className="shrink-0"
								/>
								<div className="min-w-0">
									<p className="truncate font-medium font-v2-body text-sm text-v2-text-primary">
										{fullName(member)} {you && <span className="font-normal text-v2-text-tertiary">(you)</span>}
									</p>
									<p className="truncate font-v2-body text-v2-text-tertiary text-xs">{member.email}</p>
								</div>
							</div>
							<div className="max-sm:col-span-2 max-sm:row-start-2">
								<RolePicker
									value={member.role}
									disabled={!canEdit || lastOwner}
									onChange={(role) => changeRole(member, role)}
								/>
								{lastOwner && canEdit && (
									<p className="mt-1 font-v2-body text-2xs text-v2-text-tertiary">
										Only owner. Make someone else an owner first.
									</p>
								)}
							</div>
							<p className="font-v2-body text-sm text-v2-text-secondary tabular-nums max-sm:hidden">
								{JOINED.format(new Date(member.joinedAt))}
							</p>
							<div className="justify-self-end max-sm:col-start-2 max-sm:row-start-1">
								{canEdit && !you && !lastOwner && (
									<Button
										variant="unstyled"
										size="unstyled"
										onClick={() => removeMember(member)}
										aria-label={`Remove ${fullName(member)}`}
										title="Remove"
										className="grid size-8 place-items-center rounded-v2-md text-v2-text-tertiary transition-colors hover:bg-v2-bg-input-solid hover:text-v2-status-error"
									>
										<Trash size={15} />
									</Button>
								)}
							</div>
						</li>
					);
				})}
				{invitations.map((invitation) => (
					<li
						key={invitation.id}
						className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-v2-border-divider border-t px-5 py-3 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none max-lg:px-4"
					>
						<div className="flex min-w-0 items-center gap-2.5">
							<span
								aria-hidden="true"
								className="grid size-7.75 shrink-0 place-items-center rounded-full border-[1.5px] border-v2-border-default border-dashed font-v2-body text-v2-text-tertiary text-xs uppercase"
							>
								{invitation.email[0]}
							</span>
							<div className="min-w-0">
								<p className="flex items-center gap-2 font-v2-body text-sm text-v2-text-secondary">
									<span className="truncate">{invitation.email}</span>
									<span className="shrink-0 rounded-v2-sm bg-v2-status-warning-bg px-1.5 font-medium text-2xs text-v2-status-warning">
										Invited
									</span>
								</p>
								<p className="font-v2-body text-v2-text-tertiary text-xs">
									{ROLE_COPY[invitation.role][0]} · <SentAgo at={invitation.sentAt} />
								</p>
							</div>
						</div>
						{canEdit && (
							<div className="flex gap-1">
								<Button
									variant="link"
									size="compact"
									onClick={() => resend.mutate(invitation)}
									disabled={resend.isPending}
								>
									Resend
								</Button>
								<Button variant="link" size="compact" onClick={() => cancelInvite(invitation)}>
									Cancel
								</Button>
							</div>
						)}
					</li>
				))}
			</ul>
		</SectionCard>
	);
}

function SentAgo({ at }: { at: string }) {
	const minutes = Math.round((Date.now() - Date.parse(at)) / 60_000);
	return <>{minutes < 1 ? "sent just now" : minutes < 60 ? `sent ${minutes} min ago` : "sent earlier"}</>;
}

function RolePicker({
	value,
	disabled,
	onChange,
}: {
	value: Member["role"];
	disabled: boolean;
	onChange: (role: Member["role"]) => void;
}) {
	const [open, setOpen] = useState(false);
	const trigger = (
		<button
			type="button"
			disabled={disabled}
			className="inline-flex items-center gap-1.5 rounded-v2-md border border-v2-border-divider bg-v2-bg-card px-2.5 py-1 font-v2-body text-sm transition-colors hover:border-v2-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal disabled:cursor-default disabled:text-v2-text-secondary disabled:hover:border-v2-border-divider"
		>
			{ROLE_COPY[value][0]}
			{!disabled && <CaretDown size={12} className="text-v2-text-tertiary" />}
		</button>
	);
	if (disabled) return trigger;
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent align="start" tone="grey" className="w-60 p-1">
				<div role="menu" aria-label="Role">
					{(["owner", "viewer"] as const).map((role) => (
						<MenuItem
							key={role}
							selected={value === role}
							onSelect={() => {
								setOpen(false);
								onChange(role);
							}}
							icon={null}
							title={ROLE_COPY[role][0]}
							sub={ROLE_COPY[role][1]}
						/>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

function InviteRow({ orgId, onDone }: { orgId: string; onDone: () => void }) {
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<Member["role"]>("viewer");
	const [problem, setProblem] = useState<string | null>(null);
	const first = useFirstFocus();
	const invite = useMutation({
		mutationFn: () =>
			trackSave(organizations.inviteMember<Invitation>(orgId, { email: email.trim(), role }).then(unwrap)),
		onSuccess: (invitation) => {
			queryClient.setQueryData<Invitation[]>(invitationsKey(orgId), (old) => [invitation, ...(old ?? [])]);
			toast.success(`Invite sent to ${invitation.email}`);
			onDone();
		},
		onError: (error) => setProblem(error.message),
	});
	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
					return setProblem("That doesn't look like an email address");
				setProblem(null);
				invite.mutate();
			}}
			className="grid gap-2 border-v2-border-divider border-t bg-v2-bg-warm px-5 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] max-lg:px-4"
		>
			<input
				ref={first}
				type="email"
				value={email}
				onChange={(e) => {
					setEmail(e.target.value);
					setProblem(null);
				}}
				placeholder="name@company.com"
				aria-label="Email"
				aria-invalid={problem ? true : undefined}
				autoComplete="off"
				className={cn(FIELD_CLASSES, "bg-v2-bg-card")}
			/>
			<fieldset
				aria-label="Role"
				className="m-0 inline-flex min-w-0 rounded-v2-md border border-v2-border-divider bg-v2-bg-card p-0.5"
			>
				{(["viewer", "owner"] as const).map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={role === option}
						title={ROLE_COPY[option][1]}
						onClick={() => setRole(option)}
						className={cn(
							"rounded-v2-sm px-3 py-1 font-v2-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal",
							role === option ? "bg-v2-status-success-bg font-medium text-v2-text-primary" : "text-v2-text-secondary",
						)}
					>
						{ROLE_COPY[option][0]}
					</button>
				))}
			</fieldset>
			<Button type="submit" size="sm" disabled={invite.isPending} className="gap-1.5">
				<PaperPlaneTilt size={14} weight="fill" /> Send invite
			</Button>
			{problem && (
				<p role="alert" className="font-v2-body text-v2-status-error text-xs sm:col-span-3">
					{problem}
				</p>
			)}
		</form>
	);
}
