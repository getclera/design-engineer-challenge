import { Skeleton } from "@v2/components/ui/skeleton";

function LoginSkeleton() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-v2-bg-page px-5 py-10">
			<div className="flex w-full max-w-130 flex-col gap-8">
				<Skeleton className="h-6 w-20" />

				<div className="w-full rounded-v2-xl border border-v2-border-warm/30 bg-white px-8 py-10 shadow-v2-card md:px-12 md:py-12">
					<div className="flex flex-col items-center gap-6">
						<Skeleton className="size-11.75 rounded-full" />
						<div className="flex flex-col items-center gap-3">
							<Skeleton className="h-8.5 w-48" />
							<Skeleton className="h-5 w-56" />
						</div>
						<Skeleton className="h-13.25 w-full rounded-v2-md" />
						<Skeleton className="h-13.25 w-full rounded-v2-md" />
						<div className="flex w-full items-center gap-4">
							<Skeleton className="h-px flex-1" />
							<Skeleton className="h-4 w-6" />
							<Skeleton className="h-px flex-1" />
						</div>
						<Skeleton className="h-13.25 w-full rounded-v2-md" />
						<Skeleton className="h-4 w-56" />
					</div>

					<div className="my-8 h-px w-full bg-v2-border-warm/30" />
					<Skeleton className="mx-auto h-4 w-72" />
				</div>
			</div>
		</div>
	);
}
LoginSkeleton.displayName = "LoginSkeleton";

export { LoginSkeleton };
