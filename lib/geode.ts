const DEVELOPER = "sorkopiko";
const API = "https://api.geode-sdk.org/v1/mods";
const PER_PAGE = 100;
const MAX_PAGES = 10;
export const FALLBACK_DOWNLOADS = 181_000;

interface ModsResponse {
	payload?: {
		count?: number;
		data?: { download_count?: number }[];
	};
}

/** Sum of download counts across all of the developer's Geode mods. Never throws. */
export async function getGeodeDownloads(): Promise<number> {
	try {
		let total = 0;
		let seen = 0;
		for (let page = 1; page <= MAX_PAGES; page++) {
			const url = `${API}?developer=${DEVELOPER}&per_page=${PER_PAGE}&page=${page}`;
			const res = await fetch(url, {
				next: { revalidate: 86400 },
				signal: AbortSignal.timeout(10_000),
			});
			if (!res.ok) throw new Error(`Geode API ${res.status}`);
			const json = (await res.json()) as ModsResponse;
			const mods = json.payload?.data ?? [];
			for (const mod of mods) total += mod.download_count ?? 0;
			seen += mods.length;
			const count = json.payload?.count ?? seen;
			if (mods.length < PER_PAGE || seen >= count) break;
		}
		return total > 0 ? total : FALLBACK_DOWNLOADS;
	} catch {
		return FALLBACK_DOWNLOADS;
	}
}

/** 356747 -> "350k+", 1234567 -> "1.2M+" */
export function formatDownloads(n: number): string {
	if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
	if (n >= 10_000) return `${Math.floor(n / 10_000) * 10}k+`;
	if (n >= 1_000) return `${Math.floor(n / 1_000)}k+`;
	return `${n}`;
}
