import { isPersonalEmailDomain } from "@clera/shared-utils";
import logger from "@/utils/logger";
import { isValidEmail } from "@/utils/validation";

const supplementaryDisposableDomains = new Set<string>(["bmoar.com", "zipxui.com"]);

let disposableDomainSetPromise: Promise<Set<string>> | null = null;

async function getDisposableDomainSet(): Promise<Set<string>> {
	if (!disposableDomainSetPromise) {
		disposableDomainSetPromise = import("disposable-email-domains").then((mod) => new Set<string>(mod.default));
	}
	return disposableDomainSetPromise;
}

interface EmailValidationResult {
	valid: boolean;
	reason?: "disposable" | "personal" | "invalid_format" | "no_mx_records" | "unknown";
	type?: "personal" | "work";
	message?: string;
}

export async function validateEmailClient(email: string): Promise<EmailValidationResult> {
	if (!email || !isValidEmail(email)) {
		return {
			valid: false,
			reason: "invalid_format",
			message: "Please enter a valid email address",
		};
	}

	const domain = email.split("@")[1]?.toLowerCase();
	if (!domain) {
		return {
			valid: false,
			reason: "invalid_format",
			message: "Please enter a valid email address",
		};
	}

	const disposableDomainSet = await getDisposableDomainSet();
	if (disposableDomainSet.has(domain) || supplementaryDisposableDomains.has(domain)) {
		return {
			valid: false,
			reason: "disposable",
			message: "Disposable email addresses are not allowed. Please use your business email.",
		};
	}

	if (isPersonalEmailDomain(domain)) {
		return {
			valid: false,
			reason: "personal",
			message: "Please sign up with your business email instead.",
		};
	}

	return {
		valid: true,
		type: "work",
	};
}

export async function validateEmailServer(email: string): Promise<EmailValidationResult> {
	const clientValidation = await validateEmailClient(email);
	if (!clientValidation.valid) {
		return clientValidation;
	}

	const domain = email.split("@")[1]?.toLowerCase();
	if (!domain) {
		return {
			valid: false,
			reason: "invalid_format",
			message: "Please enter a valid email address",
		};
	}

	try {
		const mxRecords = await checkMXRecords(domain);
		if (mxRecords.length === 0) {
			return {
				valid: false,
				reason: "no_mx_records",
				message: "This email domain does not appear to be valid. Please use a valid business email address.",
			};
		}

		return {
			valid: true,
			type: "work",
		};
	} catch (error) {
		logger.warn(`[validateEmailServer] DNS lookup failed for ${domain}`, { error });
		return {
			valid: true,
			type: "work",
		};
	}
}

async function checkMXRecords(domain: string): Promise<Array<{ priority: number; exchange: string }>> {
	const dns = await import("node:dns/promises").catch(() => {
		return null;
	});

	if (!dns) {
		return [{ priority: 10, exchange: domain }];
	}

	try {
		const mxRecords = await dns.resolveMx(domain);
		return mxRecords.map((record) => ({
			priority: record.priority,
			exchange: record.exchange,
		}));
	} catch (error) {
		const code = (error as NodeJS.ErrnoException | undefined)?.code;
		if (code === "ENOTFOUND" || code === "NXDOMAIN" || code === "ENODATA") {
			return [];
		}
		throw error;
	}
}
