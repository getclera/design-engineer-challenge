const CARET_SAFE_INPUT_TYPES = new Set(["text", "search", "url", "tel", "password"]);

function focusFirstFieldWithoutSelecting(event: Event) {
	const content = event.currentTarget;
	if (!(content instanceof HTMLElement)) return;

	const field = content.querySelector(
		"input:not([type=hidden]):not([disabled]):not([aria-hidden=true]), textarea:not([disabled]), [role=radio]:not([disabled])",
	);
	if (!(field instanceof HTMLElement)) return;

	event.preventDefault();
	field.focus({ preventScroll: true });
	if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) return;
	if (field instanceof HTMLInputElement && !CARET_SAFE_INPUT_TYPES.has(field.type)) return;
	field.setSelectionRange(field.value.length, field.value.length);
}

export { focusFirstFieldWithoutSelecting };
