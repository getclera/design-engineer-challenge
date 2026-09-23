export function captureException(_error: unknown, _context?: unknown): string {
  return "";
}

export function captureMessage(_message: string, _context?: unknown): string {
  return "";
}

export function setUser(_user: unknown): void {}

export function addBreadcrumb(_breadcrumb: unknown): void {}

export interface SentryEvent {
  request?: { url?: string };
  exception?: { values?: { value?: string; type?: string }[] };
  [key: string]: unknown;
}

export function init(_options: { beforeSend?: (event: SentryEvent) => SentryEvent | null; [key: string]: unknown }): void {}

export function replayIntegration(_options?: unknown): unknown {
  return {};
}
