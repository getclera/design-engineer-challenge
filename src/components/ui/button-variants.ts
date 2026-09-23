import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button variant generator. Lives in its own file (no `"use client"`) so
 * Server Components can apply button styling to a plain `<a>`/`<button>`
 * without dragging the interactive `<Button>` Client Component along.
 *
 * Used directly when `<Button asChild>` would cause SSR/hydration issues
 * (notably with hash-anchor links + Radix Slot in Next 16).
 */

/**
 * Layout classes shared by every visually-themed button variant. Kept out of
 * the base so `unstyled` (and the inline `link` variant) can opt out of flex
 * layout and `whitespace-nowrap` when the button is flowing inside a
 * paragraph or otherwise non-flex container.
 */
const BUTTON_LAYOUT =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap font-v2-body [&_svg]:pointer-events-none [&_svg]:shrink-0";

const buttonVariants = cva(
	"cursor-pointer transition-all active:scale-98 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-offset-2",
	{
		variants: {
			variant: {
				primary: `${BUTTON_LAYOUT} gradient-v2-brand text-white shadow-v2-button border border-black/10 hover:shadow-none`,
				"primary-light": `${BUTTON_LAYOUT} bg-linear-to-b from-v2-bg-page to-v2-bg-modal-header text-v2-text-brand shadow-v2-button border border-v2-brand-teal-dark hover:opacity-90`,
				ghost: `${BUTTON_LAYOUT} border border-v2-border-warm bg-transparent text-v2-text-body hover:bg-v2-bg-input-solid`,
				link: "font-v2-body text-v2-text-tertiary underline-offset-4 hover:underline p-0 h-auto",
				// Inherits base UX invariants (cursor, focus ring, tap feedback, disabled opacity)
				// with no visual theme and no layout opinions. Use for buttons that need full
				// `className` control, including inline-flowing ones inside paragraphs.
				unstyled: "",
			},
			size: {
				default: "h-11 min-w-11 px-5 text-sm rounded-v2-md",
				sm: "h-9 min-w-11 px-4 text-sm rounded-v2-md",
				compact: "h-7 min-w-9 px-2.5 text-xs rounded-v2-md",
				lg: "h-13.25 min-w-11 px-6 text-base rounded-v2-md",
				pill: "min-w-11 px-9.5 py-3 text-base rounded-v2-full",
				icon: "size-11 rounded-v2-md",
				"toolbar-icon": "size-8 rounded-v2-md",
				"compact-icon": "size-7 rounded-v2-md",
				// Matches the `unstyled` variant: no dimension or radius constraints.
				unstyled: "",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export { type ButtonVariantProps, buttonVariants };
