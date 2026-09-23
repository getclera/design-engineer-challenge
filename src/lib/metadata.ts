import { CLERA_ORIGIN } from "@clera/route-factory";
import { cleanMetaDescription } from "@clera/shared-utils";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from "./seo";

export const MAX_META_DESCRIPTION_LENGTH = 145;

interface OgImage {
	url: string;
	width?: number;
	height?: number;
	alt?: string;
}

type ReferrerPolicy = NonNullable<Metadata["referrer"]>;

function robotsDirectives(robots: BuildMetadataOptions["robots"]): Metadata["robots"] {
	switch (robots) {
		case "indexable":
			return {
				index: true,
				follow: true,
				googleBot: {
					index: true,
					follow: true,
					"max-video-preview": -1,
					"max-image-preview": "large",
					"max-snippet": -1,
				},
			};
		case "noindex":
			return { index: false, follow: false };
		case "noindex-follow":
			return { index: false, follow: true, googleBot: { index: false, follow: true } };
		default:
			return undefined;
	}
}

export interface BuildMetadataOptions {
	title: string;
	titleSection?: string;
	description: string;
	path: string;
	ogTitle?: string;
	ogDescription?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	image?: OgImage;
	imageAlt?: string;
	keywords?: string | string[];
	robots?: "indexable" | "noindex" | "noindex-follow";
	referrer?: ReferrerPolicy;
	type?: "website" | "article" | "profile";
	article?: {
		publishedTime?: string;
		modifiedTime?: string;
		authors?: string[];
		tags?: string[];
		section?: string;
	};
}

export function buildMetadata({
	title,
	titleSection,
	description,
	path,
	ogTitle,
	ogDescription,
	twitterTitle,
	twitterDescription,
	image,
	imageAlt,
	keywords,
	robots,
	referrer,
	type = "website",
	article,
}: BuildMetadataOptions): Metadata {
	const snippet = cleanMetaDescription(description, MAX_META_DESCRIPTION_LENGTH);
	const fullTitle = formatPageTitle(title, titleSection);
	const canonicalUrl = `${CLERA_ORIGIN}${path}`;
	const resolvedOgTitle = ogTitle ?? fullTitle;
	const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
	const resolvedOgDescription = ogDescription ?? snippet;
	const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;

	const ogImage: OgImage = image ?? (imageAlt ? { ...DEFAULT_OG_IMAGE, alt: imageAlt } : DEFAULT_OG_IMAGE);
	const twitterImage = image?.url ?? DEFAULT_TWITTER_IMAGE;

	const openGraph: Metadata["openGraph"] =
		type === "article"
			? {
					title: resolvedOgTitle,
					description: resolvedOgDescription,
					url: canonicalUrl,
					siteName: "Clera",
					type: "article",
					locale: "en_US",
					images: [ogImage],
					...(article?.publishedTime && { publishedTime: article.publishedTime }),
					...(article?.modifiedTime && { modifiedTime: article.modifiedTime }),
					...(article?.authors && { authors: article.authors }),
					...(article?.tags && { tags: article.tags }),
					...(article?.section && { section: article.section }),
				}
			: {
					title: resolvedOgTitle,
					description: resolvedOgDescription,
					url: canonicalUrl,
					siteName: "Clera",
					type,
					locale: "en_US",
					images: [ogImage],
				};

	const robotsDirective = robotsDirectives(robots);
	const omitsCanonical = robots === "noindex" || robots === "noindex-follow" || path === "/";

	const articleOther =
		type === "article" && article
			? {
					other: {
						...(article.authors?.[0] && { "article:author": article.authors[0] }),
						...(article.publishedTime && { "article:published_time": article.publishedTime }),
						...(article.modifiedTime && { "article:modified_time": article.modifiedTime }),
						...(article.section ? { "article:section": article.section } : {}),
						...(article.tags?.length && { "article:tag": article.tags.join(",") }),
					},
				}
			: {};

	return {
		title: fullTitle,
		description: snippet,
		...(keywords && { keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords }),
		...(referrer && { referrer }),
		...(omitsCanonical ? {} : { alternates: { canonical: canonicalUrl } }),
		...(robotsDirective && { robots: robotsDirective }),
		openGraph,
		twitter: {
			card: "summary_large_image",
			title: resolvedTwitterTitle,
			description: resolvedTwitterDescription,
			images: [twitterImage],
			creator: "@getclera",
			site: "@getclera",
		},
		...articleOther,
	};
}
