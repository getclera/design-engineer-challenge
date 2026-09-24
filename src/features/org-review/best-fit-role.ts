// Words every role title shares; they can't tell roles apart.
const GENERIC = new Set(["senior", "staff", "founding", "head", "lead", "principal", "engineer", "engineering"]);

/**
 * Guess which role a candidate without one fits best: the role whose distinctive title words
 * appear most in what we know about them. Ties go to the first role; no match returns null.
 * ponytail: plain word overlap; swap for a server-side score if the guess proves unreliable.
 */
export function bestFitRoleId(
	roles: readonly { id: string; position: string }[],
	candidateText: readonly (string | null | undefined)[],
): string | null {
	const text = candidateText.join(" ").toLowerCase();
	let best: string | null = null;
	let bestScore = 0;
	for (const role of roles) {
		const words = role.position.toLowerCase().match(/[a-z]{3,}/g) ?? [];
		const score = words.filter((w) => !GENERIC.has(w) && new RegExp(`\\b${w}`).test(text)).length;
		if (score > bestScore) {
			best = role.id;
			bestScore = score;
		}
	}
	return best;
}
