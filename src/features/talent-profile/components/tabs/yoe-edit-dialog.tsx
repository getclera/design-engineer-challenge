"use client";

import { FormControl, FormDialog, FormField, FormItem, FormLabel, FormMessage } from "@v2/components/forms";
import { Input } from "@v2/components/ui/input";
import { useMemo } from "react";
import { z } from "zod";
import { useManualOverrideYoe } from "../../hooks/use-manual-override-yoe";

const schema = z.object({
	yearsExperience: z.number().int().min(0).max(80),
	reasoning: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface YoeEditDialogProps {
	talentId: string;
	currentYoe: number | null | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function YoeEditDialog({ talentId, currentYoe, open, onOpenChange }: YoeEditDialogProps) {
	const override = useManualOverrideYoe(talentId, () => onOpenChange(false));

	const defaultValues = useMemo<FormValues>(() => ({ yearsExperience: currentYoe ?? 0, reasoning: "" }), [currentYoe]);

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Override YOE"
			schema={schema}
			defaultValues={defaultValues}
			onSubmit={(values) =>
				override.mutate({ yearsExperience: values.yearsExperience, reasoning: values.reasoning || undefined })
			}
			submitLabel="Save"
			isSubmitting={override.isPending}
			contentClassName="md:max-w-md"
			headerClassName="px-5 pt-6 pb-3 md:px-6 md:pt-8 md:pb-3"
			titleClassName="text-xl md:text-2xl"
			bodyClassName="px-5 py-5 md:px-6 md:py-6 space-y-4"
			footerClassName="px-5 py-4 md:px-6 md:py-4"
		>
			{(form) => (
				<>
					<FormField
						control={form.control}
						name="yearsExperience"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Years of experience</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										max={80}
										step={1}
										tone="warm"
										className="w-28"
										value={field.value}
										onChange={(e) => field.onChange(Number(e.target.value))}
										disabled={override.isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="reasoning"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Reason <span className="font-normal text-v2-text-muted">(optional)</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="text"
										placeholder="e.g. LinkedIn data was outdated"
										disabled={override.isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			)}
		</FormDialog>
	);
}

YoeEditDialog.displayName = "YoeEditDialog";

export { YoeEditDialog };
