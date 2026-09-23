import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { talentKeys } from "@/lib/query-keys";
import { talentEnrichment } from "@/services/api";

export function useManualOverrideYoe(talentId: string, onSuccess?: () => void) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { yearsExperience: number; reasoning?: string }) =>
			talentEnrichment.updateYearsExperience({
				talentId,
				totalYears: vars.yearsExperience,
				reasoningText: vars.reasoning,
				source: "manual_override",
			}),
		onSettled: (result) => {
			if (result?.ok) {
				toast.success("YOE updated");
				qc.invalidateQueries({ queryKey: talentKeys.headerData(talentId) });
				qc.invalidateQueries({ queryKey: talentKeys.yoeHistory(talentId) });
				onSuccess?.();
			} else {
				toast.error("Failed to update YOE");
			}
		},
	});
}
