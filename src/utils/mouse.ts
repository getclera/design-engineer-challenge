function isRepeatClick(event: { detail: number }): boolean {
	return event.detail > 1;
}

export { isRepeatClick };
