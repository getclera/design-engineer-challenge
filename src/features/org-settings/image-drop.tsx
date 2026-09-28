"use client";

import { Camera, UploadSimple, X } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { type DragEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { imageToDataUrl } from "./image-file";
import { undoToast } from "./save-status";

const MAX_IMAGES = 8;

async function read(files: FileList | File[], opts: { max: number; keepAlpha: boolean }) {
	try {
		return await Promise.all([...files].map((file) => imageToDataUrl(file, opts)));
	} catch (error) {
		toast.error(error instanceof Error ? error.message : "Couldn't read that image");
		return [];
	}
}

function useDrop(onFiles: (files: FileList) => void) {
	const [over, setOver] = useState(false);
	return {
		over,
		props: {
			onDragOver: (e: DragEvent) => {
				e.preventDefault();
				setOver(true);
			},
			onDragLeave: () => setOver(false),
			onDrop: (e: DragEvent) => {
				e.preventDefault();
				setOver(false);
				if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
			},
		},
	};
}

/** Team and product photos: pick or drop several at once, remove one with Undo. */
export function ImageList({
	id,
	label,
	values,
	onChange,
	readOnly,
}: {
	id: string;
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	readOnly?: boolean;
}) {
	const add = async (files: FileList) => {
		const room = MAX_IMAGES - values.length;
		if (room <= 0) return toast.error(`Up to ${MAX_IMAGES} images`);
		const urls = await read([...files].slice(0, room), { max: 1400, keepAlpha: false });
		// The same photo twice adds nothing (and each photo is its own key below).
		const fresh = [...new Set(urls)].filter((url) => !values.includes(url));
		if (fresh.length) onChange([...values, ...fresh]);
	};
	const remove = (index: number) => {
		onChange(values.filter((_, i) => i !== index));
		undoToast("Image removed", () => onChange(values));
	};
	const drop = useDrop(add);
	return (
		<div className="flex flex-wrap gap-2">
			{values.map((src, index) => (
				<span
					key={src}
					className="group relative h-19 w-28 overflow-hidden rounded-v2-md bg-v2-bg-input-solid animate-in fade-in zoom-in-95 motion-reduce:animate-none"
				>
					{/* biome-ignore lint/performance/noImgElement: data URLs from the upload, nothing for next/image to optimise */}
					<img src={src} alt={`${label} ${index + 1}`} className="size-full object-cover" />
					{!readOnly && (
						<button
							type="button"
							onClick={() => remove(index)}
							aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
							className="absolute top-1 right-1 grid size-5.5 place-items-center rounded-v2-sm bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white max-sm:opacity-100"
						>
							<X size={12} weight="bold" />
						</button>
					)}
				</span>
			))}
			{readOnly ? (
				values.length === 0 && <span className="font-v2-body text-sm text-v2-text-tertiary">None yet</span>
			) : (
				<label
					{...drop.props}
					className={cn(
						"relative flex h-19 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-v2-md border-[1.5px] border-dashed font-v2-body text-xs transition-colors focus-within:ring-2 focus-within:ring-v2-brand-teal",
						drop.over
							? "border-v2-status-active bg-v2-status-success-bg text-v2-text-primary"
							: "border-v2-border-default bg-v2-bg-warm text-v2-text-secondary hover:border-v2-status-active hover:text-v2-text-primary",
					)}
				>
					<UploadSimple size={16} />
					Upload image
					<input
						id={id}
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						multiple
						className="sr-only"
						onChange={(e) => {
							if (e.target.files?.length) void add(e.target.files);
							e.target.value = "";
						}}
					/>
				</label>
			)}
		</div>
	);
}

/** One picture you replace by clicking or dropping on it: the logo, your avatar. */
export function ImagePick({
	id,
	label,
	shape,
	children,
	onPick,
	readOnly,
}: {
	id: string;
	label: string;
	shape: "square" | "round";
	/** What's there now: the image, or initials. */
	children: ReactNode;
	onPick: (dataUrl: string) => void;
	readOnly?: boolean;
}) {
	const pick = async (files: FileList) => {
		const [url] = await read([files[0]], { max: 512, keepAlpha: true });
		if (url) onPick(url);
	};
	const drop = useDrop(pick);
	const frame = cn(
		"relative block size-16 shrink-0 overflow-hidden",
		shape === "round" ? "rounded-full" : "rounded-v2-lg",
	);
	if (readOnly) return <span className={frame}>{children}</span>;
	return (
		<label
			{...drop.props}
			className={cn(
				frame,
				"group cursor-pointer focus-within:ring-2 focus-within:ring-v2-brand-teal focus-within:ring-offset-2",
				drop.over && "ring-2 ring-v2-status-active ring-offset-2",
			)}
		>
			{children}
			<span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
				<Camera size={18} />
			</span>
			<input
				id={id}
				type="file"
				accept="image/png,image/jpeg,image/webp,image/gif"
				aria-label={label}
				className="sr-only"
				onChange={(e) => {
					if (e.target.files?.length) void pick(e.target.files);
					e.target.value = "";
				}}
			/>
		</label>
	);
}
