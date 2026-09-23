"use client";

import {
	ArrowClockwise,
	ArrowCounterClockwise,
	DownloadSimple,
	MagnifyingGlass,
	MinusCircle,
	PlusCircle,
} from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v2/components/ui/select";
import { Separator } from "@v2/components/ui/separator";
import { Sidebar, SidebarContent, SidebarProvider, SidebarRail, SidebarTrigger } from "@v2/components/ui/sidebar";
import { cn } from "@v2/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs, Thumbnail } from "react-pdf";
import logger from "@/utils/logger";
import { ScrollArea, ScrollBar } from "./scroll-area";

import "@/lib/pdf-polyfill";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

declare global {
	var __PDF_WORKER_INITIALIZED__: boolean | undefined;
}

if (typeof globalThis.window !== "undefined" && !globalThis.__PDF_WORKER_INITIALIZED__) {
	pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
	globalThis.__PDF_WORKER_INITIALIZED__ = true;
}

const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 8];

const PAGES_HORIZONTAL_PADDING = 64;

const PDF_OPTIONS_VERBOSITY_ERRORS_ONLY = { verbosity: 0 } as const;

function highlightPattern(text: string, pattern: string, itemIndex: number) {
	return text.replace(pattern, (value: string) => `<mark id="search-result-${itemIndex}">${value}</mark>`);
}

function PdfViewer({
	url,
	hideSidebar = false,
	onDownload,
}: {
	url: string;
	hideSidebar?: boolean;
	onDownload?: () => void;
}) {
	const [numPages, setNumPages] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [workerReady, setWorkerReady] = useState(false);
	const viewportRef = useRef<HTMLDivElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const scrollAreaRef = useCallback((element: HTMLDivElement | null) => {
		viewportRef.current = element;
		resizeObserverRef.current?.disconnect();
		resizeObserverRef.current = null;
		if (!element) return;

		const observer = new ResizeObserver(([entry]) => {
			setContainerWidth(Math.max(entry.contentRect.width - PAGES_HORIZONTAL_PADDING, 0));
		});
		observer.observe(element);
		resizeObserverRef.current = observer;
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!pdfjs.GlobalWorkerOptions.workerSrc) {
				setError("PDF worker initialization failed. Please refresh the page.");
			} else {
				setWorkerReady(true);
			}
		}, 50);

		return () => clearTimeout(timer);
	}, []);

	const textRenderer = useCallback(
		(textItem: { str: string; itemIndex: number }) => highlightPattern(textItem.str, searchQuery, textItem.itemIndex),
		[searchQuery],
	);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		setNumPages(numPages);
		setError(null);
	}

	function onDocumentLoadError(error: Error) {
		logger.error("PDF load error:", error);
		if (error.message.includes("sendWithPromise") || error.message.includes("worker")) {
			setError("PDF worker error. Please refresh the page to reload the PDF viewer.");
		} else {
			setError("Failed to load PDF");
		}
	}

	useEffect(() => {
		if (!viewportRef.current) return;

		const options = {
			root: viewportRef.current,
			rootMargin: "0px",
			threshold: 0.5,
		};

		const callback: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const pageElement = entry.target.closest("[data-page-number]");
					if (pageElement) {
						const pageNumber = Number.parseInt(pageElement.getAttribute("data-page-number") || "1", 10);
						setCurrentPage(pageNumber);
					}
				}
			});
		};

		const observer = new IntersectionObserver(callback, options);

		const mutationObserver = new MutationObserver(() => {
			const pages = viewportRef.current?.querySelectorAll(".react-pdf__Page");
			if (pages) {
				pages.forEach((page) => {
					observer.observe(page);
				});
			}
		});

		mutationObserver.observe(viewportRef.current, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
			mutationObserver.disconnect();
		};
	}, []);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 bg-v2-bg-warm ">
				<div className="text-center">
					<p className="text-v2-status-error mb-4">{error}</p>
					<div className="flex gap-2">
						<Button
							onClick={() => {
								setError(null);
								setWorkerReady(true);
							}}
							variant="ghost"
						>
							Retry
						</Button>
						<Button onClick={() => globalThis.window.open(url, "_blank")} variant="ghost">
							Open PDF in new tab
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!workerReady) {
		return null;
	}

	const documentContent = (
		<Document
			file={url}
			options={PDF_OPTIONS_VERBOSITY_ERRORS_ONLY}
			onLoadSuccess={onDocumentLoadSuccess}
			onLoadError={onDocumentLoadError}
			className={"w-full h-full flex flex-row"}
			loading={null}
			suspense={false}
		>
			{!hideSidebar && (
				<Sidebar>
					<SidebarRail />
					<SidebarContent className="flex flex-col p-8 items-center">
						{Array.from(new Array(numPages), (_, index) => (
							<div
								className={cn(
									"flex flex-col gap-2 mb-4 w-48 hover:bg-v2-bg-input-solid transition p-2",
									index + 1 === currentPage && "bg-v2-bg-input-solid",
								)}
								key={`thumbnail_${index + 1}`}
							>
								<Thumbnail
									pageNumber={index + 1}
									className="border shadow-xs"
									width={170}
									height={100}
									rotate={rotation}
								/>
								<div className="flex flex-row justify-center">
									<span className="text-sm text-v2-text-tertiary">{index + 1}</span>
								</div>
							</div>
						))}
					</SidebarContent>
				</Sidebar>
			)}
			<div className="flex flex-col w-full h-full min-h-0">
				<div className="w-full h-full flex flex-col">
					<div className="flex p-2 border-b justify-between items-center gap-1">
						<div className="flex flex-row gap-1 sm:gap-2 items-center shrink-0">
							{!hideSidebar && <SidebarTrigger />}
							<div className="text-xs text-v2-text-muted whitespace-nowrap">
								{currentPage}/{numPages}
							</div>
						</div>
						<div className="flex flex-row gap-0.5 sm:gap-2 items-center flex-wrap justify-end">
							{onDownload && (
								<>
									<Button
										variant="ghost"
										size="compact-icon"
										className="size-7"
										onClick={onDownload}
										aria-label="Download PDF"
									>
										<DownloadSimple className="size-4" />
									</Button>
									<Separator orientation="vertical" className="hidden sm:block" />
								</>
							)}
							<Button
								variant="ghost"
								size="compact-icon"
								className="size-7 hidden sm:inline-flex"
								onClick={() => setRotation(rotation - 90)}
							>
								<ArrowCounterClockwise className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="compact-icon"
								className="size-7 hidden sm:inline-flex"
								onClick={() => setRotation(rotation + 90)}
							>
								<ArrowClockwise className="size-4" />
							</Button>
							<Separator orientation="vertical" className="hidden sm:block" />
							<Button
								variant="ghost"
								size="compact-icon"
								className="size-7"
								disabled={zoom <= ZOOM_OPTIONS[0]}
								onClick={() => setZoom(zoom - 0.25)}
							>
								<MinusCircle className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="compact-icon"
								className="size-7"
								disabled={zoom >= ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]}
								onClick={() => setZoom(zoom + 0.25)}
							>
								<PlusCircle className="size-4" />
							</Button>

							<Select value={zoom.toString()} onValueChange={(value) => setZoom(Number(value))}>
								<SelectTrigger className="h-7 rounded-sm w-16 sm:w-24 text-xs">
									<SelectValue placeholder="Zoom">{`${zoom * 100}%`}</SelectValue>
								</SelectTrigger>
								<SelectContent align="end">
									{ZOOM_OPTIONS.map((option) => (
										<SelectItem key={option} value={option.toString()}>
											{`${option * 100}%`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" size="compact-icon" className="size-7">
										<MagnifyingGlass className="size-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent>
									<Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<ScrollArea className="h-16 grow w-full">
						<div className="flex flex-row grow">
							<ScrollArea className="grow w-48" ref={scrollAreaRef}>
								<ScrollBar orientation="horizontal" />
								<div className="items-center flex p-8 flex-col grow w-full">
									{Array.from(new Array(numPages), (_, index) => (
										<Page
											key={`page_${index + 1}`}
											pageNumber={index + 1}
											className="border shadow-xs mb-8"
											data-page-number={index + 1}
											renderAnnotationLayer={false}
											width={containerWidth || undefined}
											scale={zoom}
											rotate={rotation}
											loading={null}
											customTextRenderer={textRenderer}
										/>
									))}
								</div>
							</ScrollArea>
						</div>
					</ScrollArea>
				</div>
			</div>
		</Document>
	);

	if (hideSidebar) {
		return documentContent;
	}

	return (
		<SidebarProvider defaultOpen={false} className="h-full">
			{documentContent}
		</SidebarProvider>
	);
}

export { PdfViewer };
export default PdfViewer;
