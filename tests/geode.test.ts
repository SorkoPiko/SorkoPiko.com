import { afterEach, describe, expect, it, vi } from "vitest";

// Stand-in for Next's unstable_cache: records each cache's options and, like the
// real one, never caches a thrown error. Calls go straight through so each test
// sees fresh fetches.
const caches = vi.hoisted(() => [] as { keyParts: string[]; options: { revalidate?: number }; calls: number }[]);
vi.mock("next/cache", () => ({
	unstable_cache: <T,>(fn: () => Promise<T>, keyParts: string[], options: { revalidate?: number }) => {
		const entry = { keyParts, options, calls: 0 };
		caches.push(entry);
		return async () => {
			entry.calls++;
			return fn();
		};
	},
}));

import {
	DOWNLOADS_REVALIDATE,
	FALLBACK_DOWNLOADS,
	FALLBACK_REVALIDATE,
	formatDownloads,
	getGeodeDownloads,
} from "../lib/geode";

const cacheFor = (key: string) => caches.find((c) => c.keyParts.includes(key))!;

function page(downloads: number[], count: number) {
	return {
		payload: {
			count,
			data: downloads.map((download_count) => ({ download_count })),
		},
	};
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), { status: 200, ...init });
}

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
	const fn = vi.fn(impl);
	vi.stubGlobal("fetch", fn);
	return fn;
}

afterEach(() => {
	vi.unstubAllGlobals();
	for (const c of caches) c.calls = 0;
});

describe("getGeodeDownloads", () => {
	it("sums download_count across a single page", async () => {
		const fetch = mockFetch(async () => jsonResponse(page([115293, 96989, 60452, 43840, 20493, 19680], 6)));

		await expect(getGeodeDownloads()).resolves.toBe(356747);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("queries the developer's mods with a timeout", async () => {
		const fetch = mockFetch(async () => jsonResponse(page([1], 1)));

		await getGeodeDownloads();

		const [url, init] = fetch.mock.calls[0];
		const parsed = new URL(url);
		expect(parsed.origin + parsed.pathname).toBe("https://api.geode-sdk.org/v1/mods");
		expect(parsed.searchParams.get("developer")).toBe("sorkopiko");
		expect(parsed.searchParams.get("page")).toBe("1");
		expect(init?.signal).toBeInstanceOf(AbortSignal);
	});

	it("follows pagination until every mod is counted", async () => {
		const perPage = 100;
		const fetch = mockFetch(async (url) => {
			const n = Number(new URL(url).searchParams.get("page"));
			if (n === 1) return jsonResponse(page(Array(perPage).fill(10), 150));
			if (n === 2) return jsonResponse(page(Array(50).fill(1), 150));
			throw new Error(`unexpected page ${n}`);
		});

		await expect(getGeodeDownloads()).resolves.toBe(perPage * 10 + 50);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("treats missing download_count as zero", async () => {
		mockFetch(async () => jsonResponse({ payload: { count: 2, data: [{ download_count: 5 }, {}] } }));

		await expect(getGeodeDownloads()).resolves.toBe(5);
	});

	it("falls back on a network error", async () => {
		mockFetch(async () => {
			throw new TypeError("fetch failed");
		});

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("falls back on a non-OK status", async () => {
		mockFetch(async () => jsonResponse({ error: "down" }, { status: 503 }));

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("falls back on malformed JSON", async () => {
		mockFetch(async () => new Response("<html>not json</html>", { status: 200 }));

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("falls back when the request times out", async () => {
		mockFetch(async () => {
			throw new DOMException("The operation timed out.", "TimeoutError");
		});

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("falls back when a later page fails, rather than showing a partial total", async () => {
		mockFetch(async (url) => {
			const n = Number(new URL(url).searchParams.get("page"));
			if (n === 1) return jsonResponse(page(Array(100).fill(10), 150));
			return jsonResponse({}, { status: 500 });
		});

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("falls back when the API returns no mods", async () => {
		mockFetch(async () => jsonResponse(page([], 0)));

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
	});

	it("uses 350,000 as the fallback", () => {
		expect(FALLBACK_DOWNLOADS).toBe(350_000);
	});
});

describe("download caching", () => {
	it("caches a successful total for a day", () => {
		expect(DOWNLOADS_REVALIDATE).toBe(86400);
		expect(cacheFor("geode-downloads").options.revalidate).toBe(DOWNLOADS_REVALIDATE);
	});

	it("caches the fallback only briefly", () => {
		expect(FALLBACK_REVALIDATE).toBeLessThan(DOWNLOADS_REVALIDATE);
		expect(cacheFor("geode-downloads-fallback").options.revalidate).toBe(FALLBACK_REVALIDATE);
	});

	it("doesn't touch the short-lived fallback cache on success", async () => {
		mockFetch(async () => jsonResponse(page([10], 1)));

		await expect(getGeodeDownloads()).resolves.toBe(10);
		expect(cacheFor("geode-downloads").calls).toBe(1);
		expect(cacheFor("geode-downloads-fallback").calls).toBe(0);
	});

	it("goes through the short-lived fallback cache on failure", async () => {
		mockFetch(async () => jsonResponse({}, { status: 500 }));

		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);
		expect(cacheFor("geode-downloads-fallback").calls).toBe(1);
	});

	it("retries the API on the next call after a failure", async () => {
		const fetch = mockFetch(async () => {
			throw new TypeError("fetch failed");
		});
		await expect(getGeodeDownloads()).resolves.toBe(FALLBACK_DOWNLOADS);

		fetch.mockImplementation(async () => jsonResponse(page([42], 1)));
		await expect(getGeodeDownloads()).resolves.toBe(42);
	});
});

describe("formatDownloads", () => {
	it.each([
		[0, "0"],
		[999, "999"],
		[1_000, "1k+"],
		[1_999, "1k+"],
		[9_999, "9k+"],
		[10_000, "10k+"],
		[19_999, "10k+"],
		[180_000, "180k+"],
		[181_000, "180k+"],
		[350_000, "350k+"],
		[356_747, "350k+"],
		[999_999, "990k+"],
		[1_000_000, "1M+"],
		[1_234_567, "1.2M+"],
		[2_000_000, "2M+"],
	])("%i -> %s", (n, expected) => {
		expect(formatDownloads(n)).toBe(expected);
	});
});
