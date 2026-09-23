const TALENT_BOARD_PANE_SELECTOR = "[data-talent-board-pane]";

function scrollTalentBoardPaneToTop() {
	const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
	for (const pane of document.querySelectorAll(TALENT_BOARD_PANE_SELECTOR)) {
		pane.scrollTo({ top: 0, behavior });
	}
}

export { scrollTalentBoardPaneToTop };
