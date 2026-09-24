import { Eye } from "@phosphor-icons/react/ssr";

/** Replaces the decision bar for viewers, whose decisions the server refuses. */
export function ReviewViewOnlyNote() {
	return (
		<p className="flex items-center justify-center gap-1.5 border-t border-v2-border-divider px-4 py-3 font-v2-body text-v2-text-tertiary text-xs">
			<Eye size={14} aria-hidden="true" />
			View only. Ask an owner to request intros.
		</p>
	);
}

ReviewViewOnlyNote.displayName = "ReviewViewOnlyNote";
