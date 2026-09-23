import { normalizeCompanyName, parseFlexDate, sortByRecency } from "./normalize.ts";

const TENURE_GAP_TOLERANCE_MONTHS = 6;

const EMPLOYER_RETURN_GAP_MONTHS = 12;

const MS_PER_MONTH = 30.44 * 24 * 60 * 60 * 1000;

export interface CompanyRole {
	title?: string | null;
	companyName?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	isCurrent?: boolean | null;
}

export interface CompanyTenure<T extends CompanyRole> {
	companyName: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean;
	tenureMonths: number;
	roles: T[];
}

interface RoleBounds {
	startMs: number;
	endMs: number;
	knownEndMs: number;
}

interface OpenRun<T extends CompanyRole> extends RoleBounds {
	isCurrent: boolean;
	roles: T[];
}

function companyBaseName(name: string): string {
	const beforePipe = name.split("|")[0].trim();
	return beforePipe.length > 0 ? beforePipe : name.trim();
}

function measurableBounds(role: CompanyRole, nowMs: number): RoleBounds | null {
	const startMs = parseFlexDate(role.startDate)?.getTime();
	if (startMs == null || !Number.isFinite(startMs)) return null;
	const parsedEnd = parseFlexDate(role.endDate)?.getTime();
	const endMs = role.isCurrent ? nowMs : (parsedEnd ?? nowMs);
	if (!Number.isFinite(endMs) || endMs < startMs) return null;
	return { startMs, endMs, knownEndMs: parsedEnd ?? Number.NEGATIVE_INFINITY };
}

function monthsBetween(startMs: number, endMs: number): number {
	const start = new Date(startMs);
	const end = new Date(endMs);
	const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
	return Math.max(0, months);
}

function isContinuationOfRun<T extends CompanyRole>(run: OpenRun<T>, bounds: RoleBounds): boolean {
	return bounds.startMs - run.endMs <= TENURE_GAP_TOLERANCE_MONTHS * MS_PER_MONTH;
}

function toCompanyTenure<T extends CompanyRole>(run: OpenRun<T>): CompanyTenure<T> {
	const roles = [...run.roles].sort(sortByRecency);
	const endDate = run.isCurrent || run.knownEndMs < run.endMs ? null : new Date(run.endMs).toISOString().slice(0, 10);
	const latestName = roles[0].companyName ?? null;
	const companyName =
		roles.length > 1 && latestName != null && roles.some((r) => r.companyName !== latestName)
			? companyBaseName(latestName)
			: latestName;
	return {
		companyName,
		startDate: new Date(run.startMs).toISOString().slice(0, 10),
		endDate,
		isCurrent: run.isCurrent,
		tenureMonths: monthsBetween(run.startMs, run.endMs),
		roles,
	};
}

function standaloneTenure<T extends CompanyRole>(role: T, bounds: RoleBounds | null): CompanyTenure<T> {
	return {
		companyName: role.companyName ?? null,
		startDate: role.startDate ?? null,
		endDate: role.endDate ?? null,
		isCurrent: role.isCurrent ?? false,
		tenureMonths: bounds ? monthsBetween(bounds.startMs, bounds.endMs) : 0,
		roles: [role],
	};
}

export interface EmployerGroup<T extends CompanyRole> {
	companyName: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean;
	totalTenureMonths: number;
	roles: T[];
}

function unionMonths<T extends CompanyRole>(roles: T[], nowMs: number): number {
	const intervals = roles
		.map((role) => measurableBounds(role, nowMs))
		.filter((bounds): bounds is RoleBounds => bounds != null)
		.map((bounds) => [bounds.startMs, bounds.endMs] as const)
		.sort((a, b) => a[0] - b[0]);
	if (intervals.length === 0) return 0;
	let total = 0;
	let [segmentStart, segmentEnd] = intervals[0];
	for (const [start, end] of intervals.slice(1)) {
		if (start <= segmentEnd) {
			segmentEnd = Math.max(segmentEnd, end);
		} else {
			total += monthsBetween(segmentStart, segmentEnd);
			segmentStart = start;
			segmentEnd = end;
		}
	}
	return total + monthsBetween(segmentStart, segmentEnd);
}

function toEmployerGroup<T extends CompanyRole>(tenures: Array<CompanyTenure<T>>, nowMs: number): EmployerGroup<T> {
	const ordered = [...tenures].sort(sortByRecency);
	const latest = ordered[0];
	const roles = ordered.flatMap((tenure) => tenure.roles).sort(sortByRecency);
	const startDate = ordered.reduce<string | null>((earliest, tenure) => {
		if (!tenure.startDate) return earliest;
		if (!earliest) return tenure.startDate;
		const candidate = parseFlexDate(tenure.startDate)?.getTime() ?? 0;
		const current = parseFlexDate(earliest)?.getTime() ?? 0;
		return candidate < current ? tenure.startDate : earliest;
	}, null);
	const companyName =
		ordered.length > 1 && latest.companyName != null ? companyBaseName(latest.companyName) : latest.companyName;
	return {
		companyName,
		startDate,
		endDate: latest.endDate,
		isCurrent: ordered.some((tenure) => tenure.isCurrent),
		totalTenureMonths: unionMonths(roles, nowMs),
		roles,
	};
}

function tenureBounds<T extends CompanyRole>(tenure: CompanyTenure<T>, nowMs: number): RoleBounds | null {
	return measurableBounds({ startDate: tenure.startDate, endDate: tenure.endDate, isCurrent: tenure.isCurrent }, nowMs);
}

function splitOnReturnGaps<T extends CompanyRole>(
	runs: Array<CompanyTenure<T>>,
	nowMs: number,
): Array<Array<CompanyTenure<T>>> {
	const chronological = [...runs].sort(
		(a, b) => (parseFlexDate(a.startDate)?.getTime() ?? 0) - (parseFlexDate(b.startDate)?.getTime() ?? 0),
	);
	const clusters: Array<Array<CompanyTenure<T>>> = [];
	let current: Array<CompanyTenure<T>> = [];
	let currentEndMs = Number.NEGATIVE_INFINITY;

	for (const run of chronological) {
		const bounds = tenureBounds(run, nowMs);
		const returnsAfterGap =
			bounds != null &&
			Number.isFinite(currentEndMs) &&
			bounds.startMs - currentEndMs > EMPLOYER_RETURN_GAP_MONTHS * MS_PER_MONTH;
		if (current.length > 0 && returnsAfterGap) {
			clusters.push(current);
			current = [];
			currentEndMs = Number.NEGATIVE_INFINITY;
		}
		current.push(run);
		if (bounds) currentEndMs = Math.max(currentEndMs, bounds.endMs);
	}

	if (current.length > 0) clusters.push(current);
	return clusters;
}

interface EmployerGroupOptions {
	mergeLongGapReturns?: boolean;
}

export function groupRolesByEmployer<T extends CompanyRole>(
	experiences: T[],
	nowMs = Date.now(),
	{ mergeLongGapReturns = false }: EmployerGroupOptions = {},
): Array<EmployerGroup<T>> {
	const runsByEmployer = new Map<string, Array<CompanyTenure<T>>>();
	const keyless: Array<EmployerGroup<T>> = [];

	for (const run of groupRolesByCompany(experiences, nowMs)) {
		const key = run.companyName ? normalizeCompanyName(companyBaseName(run.companyName)) : "";
		if (!key) {
			keyless.push(toEmployerGroup([run], nowMs));
			continue;
		}
		const existing = runsByEmployer.get(key);
		if (existing) existing.push(run);
		else runsByEmployer.set(key, [run]);
	}

	const grouped = [...runsByEmployer.values()].flatMap((tenures) =>
		(mergeLongGapReturns ? [tenures] : splitOnReturnGaps(tenures, nowMs)).map((cluster) =>
			toEmployerGroup(cluster, nowMs),
		),
	);
	return [...grouped, ...keyless].sort(sortByRecency);
}

export function groupRolesByCompany<T extends CompanyRole>(
	experiences: T[],
	nowMs = Date.now(),
): Array<CompanyTenure<T>> {
	const rolesByCompany = new Map<string, T[]>();
	const standalone: Array<CompanyTenure<T>> = [];

	for (const role of experiences) {
		const companyKey = role.companyName ? normalizeCompanyName(companyBaseName(role.companyName)) : "";
		const bounds = measurableBounds(role, nowMs);
		if (!companyKey || bounds == null) {
			standalone.push(standaloneTenure(role, bounds));
			continue;
		}
		const existing = rolesByCompany.get(companyKey);
		if (existing) existing.push(role);
		else rolesByCompany.set(companyKey, [role]);
	}

	const tenures: Array<CompanyTenure<T>> = [];
	for (const companyRoles of rolesByCompany.values()) {
		const chronological = [...companyRoles].sort(
			(a, b) => (parseFlexDate(a.startDate)?.getTime() ?? 0) - (parseFlexDate(b.startDate)?.getTime() ?? 0),
		);
		let run: OpenRun<T> | null = null;
		for (const role of chronological) {
			const bounds = measurableBounds(role, nowMs);
			if (!bounds) continue;
			if (run && isContinuationOfRun(run, bounds)) {
				run.endMs = Math.max(run.endMs, bounds.endMs);
				run.knownEndMs = Math.max(run.knownEndMs, bounds.knownEndMs);
				run.isCurrent = run.isCurrent || (role.isCurrent ?? false);
				run.roles.push(role);
				continue;
			}
			if (run) tenures.push(toCompanyTenure(run));
			run = { ...bounds, isCurrent: role.isCurrent ?? false, roles: [role] };
		}
		if (run) tenures.push(toCompanyTenure(run));
	}

	return [...tenures, ...standalone].sort(sortByRecency);
}
