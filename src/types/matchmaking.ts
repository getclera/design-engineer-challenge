export interface CalibrationRequirement {
	requirement: string;
	score: number;
	reasons: string[];
	optional?: boolean;
	missingInformation?: string[];
	requirementFit?: string;
	type?: string;
	group?: string;
}

export interface CalibrationData {
	score: number;
	results: CalibrationRequirement[];
	missingInformation?: string[];
}

export interface MatchmakingStartResponse {
	success: boolean;
	message: string;
	runId?: string | null;
	publicAccessToken?: string;
	matchmakingActivityId?: string;
	triggerTaskId?: string;
}
