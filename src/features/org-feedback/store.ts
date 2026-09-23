import { create } from "zustand";
import type { FeedbackDraft } from "./feedback-schema";

interface OrgFeedbackDialogState {
	open: boolean;
	drafts: Record<string, FeedbackDraft>;
	saveDraft: (contextKey: string, draft: FeedbackDraft) => void;
	clearDraft: (contextKey: string) => void;
	setOpen: (open: boolean) => void;
}

export const useOrgFeedbackDialog = create<OrgFeedbackDialogState>((set) => ({
	open: false,
	drafts: {},
	saveDraft: (contextKey, draft) =>
		set((state) => {
			const drafts = { ...state.drafts };
			if (!draft.reason && !draft.comment) delete drafts[contextKey];
			else drafts[contextKey] = { ...draft };
			return { drafts };
		}),
	clearDraft: (contextKey) =>
		set((state) => {
			const drafts = { ...state.drafts };
			delete drafts[contextKey];
			return { drafts };
		}),
	setOpen: (open) => set({ open }),
}));
