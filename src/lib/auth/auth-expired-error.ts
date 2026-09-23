export class AuthExpiredError extends Error {
	constructor() {
		super("Auth session expired");
		this.name = "AuthExpiredError";
	}
}
