import { unstable_cache } from "next/cache";

const DEVELOPER = "sorkopiko";
const API = "https://api.geode-sdk.org/v1/mods";
const PER_PAGE = 100;
const MAX_PAGES = 10;
const TIMEOUT_MS = 10_000;

export const FALLBACK_DOWNLOADS = 350_000;
/** How long a successful total is cached. app/page.tsx's `revalidate` must match (it has to be a literal there). */
export const DOWNLOADS_REVALIDATE = 86400;
/** After a failed fetch, try again this soon rather than showing the fallback for a whole day. */
export const FALLBACK_REVALIDATE = 3600;

interface ModsResponse {
	payload?: {
		count?: number;
		data?: { download_count?: number }[];
	};
}

/** Sum of download counts across all of the developer's Geode mods. Throws on any failure. */
export async function fetchGeodeDownloads(): Promise<number> {
	let total = 0;
	let seen = 0;
	for (let page = 1; page <= MAX_PAGES; page++) {
		const url = `${API}?developer=${DEVELOPER}&per_page=${PER_PAGE}&page=${page}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
		if (!res.ok) throw new Error(`Geode API ${res.status}`);
		const json = (await res.json()) as ModsResponse;
		const mods = json.payload?.data ?? [];
		for (const mod of mods) total += mod.download_count ?? 0;
		seen += mods.length;
		const count = json.payload?.count ?? seen;
		if (mods.length < PER_PAGE || seen >= count) break;
	}
	if (total <= 0) throw new Error("Geode API returned no downloads");
	return total;
}

// unstable_cache never caches a thrown error, so a failure is retried on the next
// render. Each cached call also lowers the page's revalidate to its own value, so
// rendering the fallback makes the page regenerate within FALLBACK_REVALIDATE
// instead of keeping the fallback for a full DOWNLOADS_REVALIDATE.
const cachedDownloads = unstable_cache(fetchGeodeDownloads, ["geode-downloads"], {
	revalidate: DOWNLOADS_REVALIDATE,
});

const cachedFallback = unstable_cache(async () => FALLBACK_DOWNLOADS, ["geode-downloads-fallback"], {
	revalidate: FALLBACK_REVALIDATE,
});

/** Live download total, or FALLBACK_DOWNLOADS (cached only briefly) if the API fails. Never throws. */
export async function getGeodeDownloads(): Promise<number> {
	try {
		return await cachedDownloads();
	} catch {
		try {
			return await cachedFallback();
		} catch {
			return FALLBACK_DOWNLOADS;
		}
	}
}

/** 356747 -> "350k+", 1234567 -> "1.2M+" */
export function formatDownloads(n: number): string {
	if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
	if (n >= 10_000) return `${Math.floor(n / 10_000) * 10}k+`;
	if (n >= 1_000) return `${Math.floor(n / 1_000)}k+`;
	return `${n}`;
}
