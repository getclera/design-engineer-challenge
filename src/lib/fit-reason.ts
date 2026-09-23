const FIT_REASON_HOOK_LABELS = [
  "Why now",
  "Why this fit",
  "Why this seat",
  "Why him",
  "Why her",
  "Why them",
  "The pitch",
  "Standout",
] as const;

const LEADING_ENUMERATOR_PATTERN = /^\(?\d+[.)]\s*/;
const KNOWN_HOOK_LABEL_PATTERN = new RegExp(`^(?:${FIT_REASON_HOOK_LABELS.join("|")}):\\s+`);
const GENERIC_HOOK_LABEL_PATTERN = /^[A-Z][A-Za-z' ]{0,24}:\s+/;
const SENTENCE_PATTERN = /[^.!?]+[.!?]+["')\]]*\s*/g;
const FIT_REASON_HOOK_MAX_CHARS = 220;
const FIT_REASON_HOOK_MAX_SENTENCES = 2;

export function stripSlackMrkdwn(text: string): string {
  if (!text) return text;
  let out = text;
  out = out.replace(/<(https?:\/\/[^>|]+)>/g, "$1");
  out = out.replace(/<[^>|]+\|([^>]+)>/g, "$1");
  out = out.replace(/\*([^*\n]+)\*/g, "$1");
  out = out.replace(/\b_([^_\n]+)_\b/g, "$1");
  out = out.replace(/ · /g, " | ");
  out = out.replace(/^• /gm, "- ");
  return out;
}

function firstBlockOf(text: string): string {
  const blankLineIndex = text.search(/\n[ \t]*\n/);
  if (blankLineIndex >= 0) return text.slice(0, blankLineIndex);
  const newlineIndex = text.indexOf("\n");
  if (newlineIndex >= 0) return text.slice(0, newlineIndex);
  return text;
}

function stripHookLabel(text: string): string {
  const knownStripped = text.replace(KNOWN_HOOK_LABEL_PATTERN, "");
  if (knownStripped !== text && knownStripped.trim().length > 0) return knownStripped;
  const genericStripped = text.replace(GENERIC_HOOK_LABEL_PATTERN, "");
  if (genericStripped !== text && genericStripped.trim().length > 0) return genericStripped;
  return text;
}

function limitSentences(text: string, maxSentences: number): string {
  const sentences = text.match(SENTENCE_PATTERN);
  if (!sentences || sentences.length <= maxSentences) return text.trim();
  return sentences.slice(0, maxSentences).join("").trim();
}

function truncateAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

export function extractFitReasonHook(input: string | null | undefined): string | null {
  if (!input) return null;
  const normalized = input.replace(/\\n/g, "\n");
  if (!normalized.trim()) return null;
  if (!normalized.includes("\n")) return null;

  const stripped = stripSlackMrkdwn(firstBlockOf(normalized)).trim();
  if (!stripped) return null;

  const withoutEnumerator = stripped.replace(LEADING_ENUMERATOR_PATTERN, "").trim();
  const withoutLabel = stripHookLabel(withoutEnumerator || stripped).trim();
  if (!withoutLabel) return null;

  const limited = limitSentences(withoutLabel, FIT_REASON_HOOK_MAX_SENTENCES);
  const capped = truncateAtWordBoundary(limited, FIT_REASON_HOOK_MAX_CHARS);

  return capped.length > 0 ? capped : null;
}
