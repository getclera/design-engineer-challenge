import { LoginView } from "@v2/features/auth/login-view";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import { LoginSkeleton } from "./_components/login-skeleton";

export const metadata = buildMetadata({
	title: "Log In",
	description: "Sign in to your Clera account to access personalized job matches and career opportunities.",
	path: "/login",
	robots: "noindex",
});

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginSkeleton />}>
			<LoginView />
		</Suspense>
	);
}
