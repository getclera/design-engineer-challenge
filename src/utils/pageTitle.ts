const BRAND_SUFFIX = "Clera";

export function formatPageTitle(title: string, section?: string): string {
	if (section) {
		return `${title} | ${BRAND_SUFFIX} ${section}`;
	}
	return `${title} | ${BRAND_SUFFIX}`;
}
