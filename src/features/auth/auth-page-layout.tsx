import { marketingRoutes } from "@clera/route-factory";
import { CleraLogo } from "@v2/components/ui/clera-logo";
import Link from "next/link";
import type { AuthPageLayoutProps } from "./types";

function AuthPageLayout({ children, cardFooter, errorMessage }: AuthPageLayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-v2-bg-page px-5 py-10">
			<div className="flex w-full max-w-130 flex-col gap-8">
				<Link href={marketingRoutes.home} aria-label="Go to Clera home">
					<CleraLogo size="sm" />
				</Link>

				{errorMessage && (
					<div
						role="alert"
						className="rounded-v2-md border border-v2-status-error/20 bg-v2-status-error/5 px-4 py-3 text-center font-v2-body text-sm text-v2-status-error"
					>
						{errorMessage}
					</div>
				)}

				<div className="w-full rounded-v2-xl border border-v2-border-warm/30 bg-white px-8 py-10 shadow-v2-card md:px-12 md:py-12">
					{children}

					{cardFooter && (
						<>
							<div className="my-8 h-px w-full bg-v2-border-warm/30" />
							{cardFooter}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
AuthPageLayout.displayName = "AuthPageLayout";

function AuthCardTerms() {
	return (
		<p className="text-center font-v2-body text-sm font-normal text-v2-text-muted">
			By continuing, you agree to our{" "}
			<Link href={marketingRoutes.terms} className="underline transition-colors hover:text-v2-text-primary">
				Terms
			</Link>{" "}
			and{" "}
			<Link href={marketingRoutes.privacy} className="underline transition-colors hover:text-v2-text-primary">
				Privacy Policy
			</Link>
		</p>
	);
}
AuthCardTerms.displayName = "AuthCardTerms";

export { AuthCardTerms, AuthPageLayout };
