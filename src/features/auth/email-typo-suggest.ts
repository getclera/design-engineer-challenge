import { isPersonalEmailDomain, PERSONAL_EMAIL_DOMAINS } from "@clera/shared-utils";

function damerauLevenshteinBounded(a: string, b: string, max: number): number {
	if (Math.abs(a.length - b.length) > max) return max + 1;
	if (a === b) return 0;

	const rows = a.length + 1;
	const cols = b.length + 1;
	const matrix: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

	for (let i = 0; i < rows; i++) matrix[i][0] = i;
	for (let j = 0; j < cols; j++) matrix[0][j] = j;

	for (let i = 1; i < rows; i++) {
		let rowMin = matrix[i][0];
		for (let j = 1; j < cols; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1, matrix[i - 1][j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
			}
			if (matrix[i][j] < rowMin) rowMin = matrix[i][j];
		}
		if (rowMin > max) return max + 1;
	}

	return matrix[rows - 1][cols - 1];
}

export function suggestPersonalEmailCorrection(email: string): string | null {
	if (!email || typeof email !== "string") return null;
	const trimmed = email.trim();
	const atIndex = trimmed.lastIndexOf("@");
	if (atIndex < 1 || atIndex === trimmed.length - 1) return null;

	const local = trimmed.slice(0, atIndex);
	const domain = trimmed.slice(atIndex + 1).toLowerCase();

	if (isPersonalEmailDomain(domain)) return null;

	let bestMatch: string | null = null;
	let bestDistance = 2;
	for (const candidate of PERSONAL_EMAIL_DOMAINS) {
		const distance = damerauLevenshteinBounded(domain, candidate, 1);
		if (distance < bestDistance) {
			bestMatch = candidate;
			bestDistance = distance;
			if (distance === 0) break;
		}
	}

	if (!bestMatch || bestDistance > 1) return null;
	return `${local}@${bestMatch}`;
}
