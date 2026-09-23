export const REFERRAL_SOURCES = [
	"ai_search",
	"search_engine",
	"linkedin",
	"twitter",
	"youtube_or_podcast",
	"blog_post",
	"event",
	"online_ad",
	"word_of_mouth",
	"sales_outreach",
	"press",
	"mcp",
	"other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];
