export interface PublicJobLocation {
	id: string | null;
	location: string;
	city: string | null;
	country: string | null;
}

export interface PublicJob {
	id: string;
	position: string;
	slug: string;
	lifecycle: string | null;
	created_at: string;
	employment_type: string | null;
	workplace_type: string | null;
	salary: {
		lower: number;
		upper: number | null;
		currency: string;
		equity: string | null;
	} | null;
	experience: { min: number; max: number | null } | null;
	visa: { status: string; details: string | null } | null;
	referral: { bounty: string | null; bounty_string: string | null };
	role_titles: string[];
	company: {
		id: string;
		name: string | null;
		slug: string | null;
		size: string | null;
		funding: string | null;
		industry: string | null;
		logo_url: string | null;
		websiteUrl: string | null;
		industries: string[];
	} | null;
	locations: PublicJobLocation[];
}
