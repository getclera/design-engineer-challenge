import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { talentKeys } from "@/lib/query-keys";
import { talentEnrichment } from "@/services/api";

export function useRecalculateYoe(talentId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: ["recalculate-yoe", talentId],
		mutationFn: () => talentEnrichment.calculateExperienceYears({ talentId, breakCache: true }),
		onSettled: (result) => {
			if (result?.ok) {
				toast.success("Recalculation started — refresh in a few seconds");
				qc.invalidateQueries({ queryKey: talentKeys.headerData(talentId) });
			} else {
				toast.error("Failed to recalculate years of experience");
			}
		},
	});
}
