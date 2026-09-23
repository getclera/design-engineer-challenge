const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "unknown";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (isProd && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
	console.error("[env] NEXT_PUBLIC_SUPABASE_URL is not set — Supabase client will fail");
}

const cleraWhatsAppNumber = process.env.NEXT_PUBLIC_CLERA_WHATSAPP_NUMBER ?? "";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

const getStorageUrl = (path: string) => `${supabaseUrl}/storage/v1/object/public/${path}`;
const getAvatarUrl = (userId: string, extension?: string) => {
	const basePath = `avatars/${userId}`;
	return extension ? `${basePath}.${extension}` : basePath;
};

const getFullAvatarUrl = (userId: string, extension?: string) => {
	return getStorageUrl(getAvatarUrl(userId, extension));
};

const getMultipleAvatarUrls = (userId: string) => [
	getFullAvatarUrl(userId),
	getFullAvatarUrl(userId, "jpg"),
	getFullAvatarUrl(userId, "png"),
	getFullAvatarUrl(userId, "jpeg"),
];

export const config = {
	isDevelopment,
	isProduction,
	isDev,
	isProd,

	appVersion,

	supabase: {
		url: supabaseUrl,
		anonKey: supabaseAnonKey,
	},

	contact: {
		whatsAppNumber: cleraWhatsAppNumber,
	},

	posthog: {
		key: posthogKey,
		host: posthogHost,
	},

	storage: {
		getUrl: getStorageUrl,
		getAvatarUrl: getFullAvatarUrl,
		getMultipleAvatarUrls,
	},
} as const;
