import type { ConsolaInstance } from "consola";
import { createConsola } from "consola/browser";
import { isProduction } from "@/config/env";
import {
	captureException as sentryCaptureException,
	captureMessage as sentryCaptureMessage,
} from "@/utils/sentry-lazy";

enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 4,
}

const logLevelMap: Record<LogLevel, number> = {
	[LogLevel.DEBUG]: 4,
	[LogLevel.INFO]: 3,
	[LogLevel.WARN]: 2,
	[LogLevel.ERROR]: 1,
	[LogLevel.NONE]: -999,
};

interface LogConfig {
	minLevel: LogLevel;
	enableStackTrace: boolean;
	timestampFormat: Intl.DateTimeFormatOptions;
	structuredOutput: boolean;
}

type LogMetadata = Record<string, unknown>;

export type RequestIdGlobal = typeof globalThis & {
	__cleraGetRequestId?: () => string | undefined;
};

const defaultConfig: LogConfig = {
	minLevel: isProduction ? LogLevel.WARN : LogLevel.DEBUG,
	enableStackTrace: !isProduction,
	timestampFormat: {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	},
	structuredOutput: !isProduction,
};

const config: LogConfig = { ...defaultConfig };

const consolaInstance: ConsolaInstance = createConsola({
	level: logLevelMap[config.minLevel],
	formatOptions: {
		date: true,
		colors: true,
		compact: !config.structuredOutput,
	},
});

function formatMetadata(metadata?: LogMetadata): LogMetadata {
	const meta = { ...metadata };
	const requestId = (globalThis as RequestIdGlobal).__cleraGetRequestId?.();
	if (requestId) {
		meta.requestId = requestId;
	}
	return meta;
}

export const logger = {
	debug: (message: string, metadata?: LogMetadata): void => {
		consolaInstance.debug(message, formatMetadata(metadata));
	},

	info: (message: string, metadata?: LogMetadata): void => {
		consolaInstance.info(message, formatMetadata(metadata));
	},

	warn: (message: string, metadata?: LogMetadata): void => {
		consolaInstance.warn(message, formatMetadata(metadata));
	},

	error: (message: string, error?: unknown, metadata?: LogMetadata): void => {
		const combinedMetadata = { ...metadata };

		if (error instanceof Error) {
			sentryCaptureException(error, {
				extra: { message, ...formatMetadata(combinedMetadata) },
			});
			Object.assign(combinedMetadata, {
				errorName: error.name,
				errorMessage: error.message,
				stack: config.enableStackTrace ? error.stack : undefined,
			});
		} else if (error !== undefined) {
			const errorObj = error as LogMetadata;
			sentryCaptureMessage(message, {
				level: "error",
				extra: { ...formatMetadata(errorObj) },
			});
			Object.assign(combinedMetadata, errorObj);
		}

		consolaInstance.error(message, formatMetadata(combinedMetadata));
	},

	withContext: (context: LogMetadata) => {
		const contextLogger = consolaInstance.withTag(Object.values(context).join(":"));

		return {
			debug: (message: string, metadata?: LogMetadata): void => {
				contextLogger.debug(message, formatMetadata({ ...context, ...metadata }));
			},
			info: (message: string, metadata?: LogMetadata): void => {
				contextLogger.info(message, formatMetadata({ ...context, ...metadata }));
			},
			warn: (message: string, metadata?: LogMetadata): void => {
				contextLogger.warn(message, formatMetadata({ ...context, ...metadata }));
			},
			error: (message: string, error?: unknown, metadata?: LogMetadata): void => {
				const errorMetadata = { ...metadata };
				const fullContext = { ...context, ...errorMetadata };

				if (error instanceof Error) {
					sentryCaptureException(error, {
						extra: { message, ...formatMetadata(fullContext) },
					});
					Object.assign(errorMetadata, {
						errorName: error.name,
						errorMessage: error.message,
						stack: config.enableStackTrace ? error.stack : undefined,
					});
				} else if (error !== undefined) {
					const errorObj = error as LogMetadata;
					sentryCaptureMessage(message, {
						level: "error",
						extra: { ...formatMetadata({ ...context, ...errorObj }) },
					});
					Object.assign(errorMetadata, errorObj);
				}

				contextLogger.error(message, formatMetadata({ ...context, ...errorMetadata }));
			},
		};
	},
};

export default logger;
