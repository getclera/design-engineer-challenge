interface HiringHintPointerProps {
	label: string;
}

function HiringHintPointer({ label }: HiringHintPointerProps) {
	return (
		<span
			aria-hidden="true"
			className="pointer-events-none absolute bottom-1/2 left-full ml-1 hidden w-100 translate-y-3 flex-col items-end text-v2-brand-teal xl:flex"
		>
			<span className="-rotate-2 whitespace-nowrap pr-1 font-v2-heading text-lg font-medium italic leading-none">
				{label}
			</span>
			<svg aria-hidden="true" viewBox="0 0 400 164" className="h-41 w-100" fill="none">
				<path
					d="M300 9 C 298 106, 240 152, 14 152 M25 145 Q 20 149.4 14 152 Q 20 154.6 25 159"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</span>
	);
}
HiringHintPointer.displayName = "HiringHintPointer";

export { HiringHintPointer };
