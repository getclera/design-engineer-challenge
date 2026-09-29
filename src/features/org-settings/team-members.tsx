"use client";

import { CaretDown, PaperPlaneTilt, Plus, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { cn } from "@v2/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { organizations, unwrap } from "@/services/api";
import { invitationsKey, membersKey } from "./keys";
import { trackSave, UNDO_MS, undoToast } from "./save-status";
import { FIELD_CLASSES, FieldError } from "./settings-fields";
import { type Invitation, type Member, fullName, plural, useFirstFocus } from "./people";
import { MenuItem, SectionCard } from "./settings-fields";

const JOINED = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const ROLE_COPY = {
	owner: ["Owner", "Decides on candidates, edits settings"],
	viewer: ["Viewer", "Sees everything, can't decide"],
} as const;

/* ---------------------------------------------------------------- people */

export function People({
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
									label={`Role for ${fullName(member)}`}
									value={member.role}
									disabled={!canEdit || lastOwner}
									onChange={(role) => changeRole(member, role)}
								/>
								{lastOwner && canEdit && (
									<p className="mt-1 font-v2-body text-v2-text-tertiary text-xs">
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
	label,
	value,
	disabled,
	onChange,
}: {
	label: string;
	value: Member["role"];
	disabled: boolean;
	onChange: (role: Member["role"]) => void;
}) {
	const [open, setOpen] = useState(false);
	const trigger = (
		<button
			type="button"
			disabled={disabled}
			aria-label={`${label}: ${ROLE_COPY[value][0]}`}
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
				<div role="group" aria-label={label}>
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
				aria-describedby={problem ? "e-invite" : undefined}
				autoComplete="off"
				className={cn(FIELD_CLASSES, "bg-v2-bg-card")}
			/>
			<fieldset
				aria-label="Role"
				aria-describedby="invite-role-note"
				className="m-0 inline-flex min-w-0 rounded-v2-md border border-v2-border-divider bg-v2-bg-card p-0.5"
			>
				{(["viewer", "owner"] as const).map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={role === option}
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
			{/* What the chosen role can do, in view (it used to hide in a hover title). */}
			<p id="invite-role-note" className="font-v2-body text-v2-text-tertiary text-xs sm:col-span-3">
				{ROLE_COPY[role][0]}: {ROLE_COPY[role][1].toLowerCase()}.
			</p>
			<div className="sm:col-span-3">
				<FieldError id="e-invite">{problem ?? undefined}</FieldError>
			</div>
		</form>
	);
}
