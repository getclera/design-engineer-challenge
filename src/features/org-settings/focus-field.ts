"use client";

/**
 * Deep links from Home and Review (`?focus=linkedin`, `?focus=calendar&role=…`): bring the field into view, flash it
 * once so the eye lands on it, and put the cursor in it.
 */
export function focusField(key: string, scope?: string, tries = 20) {
	const row = document.querySelector<HTMLElement>(`[data-field="${key}"]${scope ? `[data-scope="${scope}"]` : ""}`);
	// Right after arriving, the rows can still be one render away: look again for up to a second.
	if (!row) {
		if (tries > 0) setTimeout(() => focusField(key, scope, tries - 1), 50);
		return;
	}
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	row.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
	// In order of preference: the first empty field (the gap), then any field, then a button (size chips, pickers).
	const target =
		row.querySelector<HTMLElement>("input:not([readonly]):placeholder-shown") ??
		row.querySelector<HTMLElement>("input:not([readonly]), textarea:not([readonly])") ??
		row.querySelector<HTMLElement>("button:not([disabled])");
	setTimeout(
		() => {
			target?.focus({ preventScroll: true });
			if (!reduced)
				row.animate(
					[
						{ boxShadow: "0 0 0 6px rgb(3 147 101 / 0.22)", backgroundColor: "rgb(3 147 101 / 0.08)" },
						{ boxShadow: "0 0 0 6px rgb(3 147 101 / 0)", backgroundColor: "rgb(3 147 101 / 0)" },
					],
					{ duration: 1800, easing: "ease-out" },
				);
		},
		reduced ? 0 : 350,
	);
}
