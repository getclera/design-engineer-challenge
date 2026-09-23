import type { RequirementGroup, RequirementType } from "./requirementEnums";

export interface OnboardingRequirement {
	requirement: string;
	description?: string;
	type?: RequirementType;
	group?: RequirementGroup;
}
