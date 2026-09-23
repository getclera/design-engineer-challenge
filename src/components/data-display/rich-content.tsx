import { cn } from "@v2/lib/utils";
import { parseRichText } from "@v2/utils/rich-text";

interface RichContentProps {
	content: string | null | undefined;
	dropLeadingHeading?: string;
	density?: "default" | "compact";
	className?: string;
}

/**
 * Single source of truth for rendering rich job descriptions with v2 tokens.
 *
 * Source HTML may contain inline styles with colors from the original job board
 * (dark themes, brand colors, etc.). We override ALL color/font properties via
 * `!important` descendant selectors so the v2 warm theme controls the look,
 * while layout properties (flex, grid, gap, padding, border-radius) are preserved
 * so rich structures like card grids and numbered sections render faithfully.
 */
const proseStyles = [
	"[&_*]:!text-inherit [&_*]:!font-v2-body",
	"[&_*]:!bg-transparent",

	"font-v2-body text-base font-normal leading-relaxed text-v2-text-secondary",

	"[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:!font-medium [&_h2]:leading-tight [&_h2]:!text-v2-text-primary",
	"[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:!font-medium [&_h3]:leading-snug [&_h3]:!text-v2-text-primary",
	"[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:text-base [&_h4]:!font-medium [&_h4]:!text-v2-text-primary",
	"[&_h5]:mb-1 [&_h5]:mt-4 [&_h5]:text-base [&_h5]:!font-medium [&_h5]:!text-v2-text-primary",
	"[&_h6]:mb-1 [&_h6]:mt-4 [&_h6]:text-sm [&_h6]:!font-medium [&_h6]:!text-v2-text-primary",

	"[&_p]:mb-3 [&_p]:last:mb-0",

	"[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
	"[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
	"[&_li]:mb-1.5 [&_li]:last:mb-0 [&_li]:leading-normal",
	"[&_li_ul]:my-1.5 [&_li_ol]:my-1.5",

	"[&_a]:!text-v2-text-brand-green [&_a]:underline [&_a]:decoration-v2-text-brand-green/50 [&_a]:hover:decoration-v2-text-brand-green",

	"[&_strong]:!font-medium [&_strong]:!text-v2-text-primary",
	"[&_b]:!font-medium [&_b]:!text-v2-text-primary",
	"[&_em]:italic",
	"[&_del]:line-through [&_del]:opacity-70",
	"[&_code]:rounded [&_code]:!bg-v2-bg-input-solid [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",

	"[&_blockquote]:my-4 [&_blockquote]:!border-l-2 [&_blockquote]:!border-v2-border-warm [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:!text-v2-text-muted",
	"[&_hr]:my-6 [&_hr]:!border-v2-border-divider",

	"[&_div]:!border-v2-border-warm/60",
	"[&_section]:!border-v2-border-warm/60",

	"[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse",
	"[&_th]:!border-v2-border-divider [&_th]:!bg-v2-bg-warm [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:!font-medium [&_th]:!text-v2-text-primary",
	"[&_td]:!border-v2-border-divider [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm",

	"[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-v2-sm",

	"[&>:first-child]:mt-0",
] as const;

const compactProseStyles = [
	"text-2xs font-light leading-relaxed",
	"[&_p]:mb-1.5",
	"[&_ul]:my-0 [&_ul]:pl-3.5",
	"[&_ol]:my-0 [&_ol]:pl-3.5",
	"[&_li]:mb-0.5",
	"[&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-2xs",
] as const;

function RichContent({ content, dropLeadingHeading, density = "default", className }: RichContentProps) {
	const html = parseRichText(content, { dropLeadingHeading });
	if (!html) return null;

	return (
		<div
			className={cn(proseStyles, density === "compact" && compactProseStyles, className)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized by parseRichText
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
RichContent.displayName = "RichContent";

export { RichContent, type RichContentProps };
