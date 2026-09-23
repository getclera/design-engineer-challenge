export const UTM_COOKIE_NAME = "clera_pending_utm";
export const UTM_FIRST_TOUCH_COOKIE = "clera_utm_first";
export const UTM_LAST_TOUCH_COOKIE = "clera_utm_last";
export const UTM_LOCALSTORAGE_KEY = "clera_utm_params";
export const UTM_SESSIONSTORAGE_KEY = "clera_utm_session";
export const UTM_CODE_CACHE_PREFIX = "clera_utm_code_";
export const UTM_LATEST_CODE_KEY = "clera_utm_latest_code";

export const UTM_COOKIE_MAX_AGE_SECONDS = 1800;
export const UTM_ATTRIBUTION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const UTM_CODE_CACHE_TTL_MS = 86_400_000;

export const UTM_LANDING_PAGE_MAX_LENGTH = 2048;

export const UTM_CODE_LENGTH = 6;
export const UTM_CODE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export const UTM_URL_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export const CLICK_ID_URL_PARAMS = ["gclid", "fbclid", "msclkid"] as const;
