import { cn } from "@v2/lib/utils";

interface CleraIconProps {
	className?: string;
}

function CleraIcon({ className }: CleraIconProps) {
	return (
		<svg
			width="16"
			height="15"
			viewBox="0 0 16 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("size-4 fill-current", className)}
			aria-hidden="true"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1.79697 14.2305H7.04994C8.19137 14.2305 9.27672 13.7374 10.0251 12.8788L12.0585 10.5457H5.00859L1.79697 14.2305ZM0 9.02918H5.39896C6.54039 9.02918 7.62573 8.53604 8.37412 7.67739L10.4075 5.34437H3.21162L0 9.02918ZM5.00859 3.51731H10.4075C11.549 3.51731 12.6343 3.02418 13.3827 2.16552L15.2702 0H8.07423L5.00859 3.51731Z"
				fill="currentColor"
			/>
		</svg>
	);
}
CleraIcon.displayName = "CleraIcon";

export { CleraIcon };
