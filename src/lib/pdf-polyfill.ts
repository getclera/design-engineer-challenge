declare global {
	interface PromiseConstructor {
		withResolvers<T>(): {
			promise: Promise<T>;
			resolve: (value: T | PromiseLike<T>) => void;
			reject: (reason?: unknown) => void;
		};
	}
}

const polyfillGlobal = globalThis as typeof globalThis & { __PDF_POLYFILL_APPLIED__?: boolean };

if (typeof globalThis.window !== "undefined" && !polyfillGlobal.__PDF_POLYFILL_APPLIED__) {
	if (typeof Promise.withResolvers !== "function") {
		Promise.withResolvers = <T>() => {
			let resolve!: (value: T | PromiseLike<T>) => void;
			let reject!: (reason?: unknown) => void;
			const promise = new Promise<T>((res, rej) => {
				resolve = res;
				reject = rej;
			});
			return { promise, resolve, reject };
		};
	}
	if (typeof (URL as unknown as { parse?: unknown }).parse !== "function") {
		(URL as unknown as { parse: (input: string | URL, base?: string | URL) => URL | null }).parse = (input, base) => {
			try {
				return new URL(input, base);
			} catch {
				return null;
			}
		};
	}
	polyfillGlobal.__PDF_POLYFILL_APPLIED__ = true;
}

export {};
