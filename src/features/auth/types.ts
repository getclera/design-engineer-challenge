export type AuthStep = "options" | "email" | "confirm-intent" | "otp";

export interface OtpStepProps {
	maskedEmail: string;
	otpValue: string;
	onOtpChange: (value: string) => void;
	onResend: () => void;
	onBack?: () => void;
	isVerifying: boolean;
	resendCooldown: number;
	error: string | null;
	showHeader?: boolean;
	hasResent?: boolean;
}

export interface HiringHint {
	prompt: string;
	label: string;
	href: string;
	pointerLabel?: string;
}

export interface AuthCardProps {
	onSuccess: () => void;
	hiringHint?: HiringHint;
	defaultEmail?: string;
	heading?: string;
	subtitle?: string;
	redirectUrl?: string;
	showFooter?: boolean;
	authSwitch?: "login" | "signup";
	authSwitchHref?: string;
	onCreateUser?: (email: string) => Promise<{ isExisting: boolean }>;
	requireBusinessEmail?: boolean;
}

export interface UseAuthFlowOptions {
	defaultEmail?: string;
	onSuccess: () => void;
	redirectUrl?: string;
	onCreateUser?: (email: string) => Promise<{ isExisting: boolean }>;
	requireBusinessEmail?: boolean;
}

export interface AuthPageLayoutProps {
	children: React.ReactNode;
	cardFooter?: React.ReactNode;
	errorMessage?: string | null;
}

export interface AccountCheckResponse {
	success: boolean;
	shouldRedirect?: boolean;
	redirectTo?: string;
}

export interface AuthFlowReturn {
	step: AuthStep;
	email: string;
	setEmail: (v: string) => void;
	error: string | null;
	isLoading: boolean;
	otpValue: string;
	isVerifying: boolean;
	resendCooldown: number;
	maskedEmail: string;
	hasResent: boolean;

	goToEmail: () => void;
	goBack: () => void;
	confirmTalentIntent: () => void;
	confirmCompanyIntent: () => void;
	handleGoogleAuth: () => Promise<void>;
	handleLinkedInAuth: () => Promise<void>;
	handleEmailSubmit: () => Promise<void>;
	handleOtpChange: (value: string) => Promise<void>;
	handleResend: () => Promise<void>;
}
