declare module "@logger" {
	export enum LogLevel {
		DEBUG = 0,
		INFO = 1,
		WARN = 2,
		ERROR = 3,
		NONE = 4,
	}

	interface LogConfig {
		minLevel: LogLevel;
		enableStackTrace: boolean;
		timestampFormat: Intl.DateTimeFormatOptions;
		structuredOutput: boolean;
	}

	type LogMetadata = Record<string, unknown>;

	type LoggerWithContext = {
		debug: (message: string, metadata?: LogMetadata) => void;
		info: (message: string, metadata?: LogMetadata) => void;
		warn: (message: string, metadata?: LogMetadata) => void;
		error: (message: string, error?: unknown, metadata?: LogMetadata) => void;
	};

	export function configureLogger(customConfig: Partial<LogConfig>): void;
	export function setRequestId(id: string): void;
	export function generateRequestId(): string;
	export function clearRequestId(): void;

	const logger: {
		debug: (message: string, metadata?: LogMetadata) => void;
		info: (message: string, metadata?: LogMetadata) => void;
		warn: (message: string, metadata?: LogMetadata) => void;
		error: (message: string, error?: unknown, metadata?: LogMetadata) => void;
		withContext: (context: LogMetadata) => LoggerWithContext;
	};

	export default logger;
}
