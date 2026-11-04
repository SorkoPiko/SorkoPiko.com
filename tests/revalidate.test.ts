import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DOWNLOADS_REVALIDATE } from "../lib/geode";

describe("page revalidate", () => {
	// Next only reads the segment config as a literal, so app/page.tsx can't import the
	// constant; this keeps the two from drifting apart.
	it("matches the Geode download cache", () => {
		const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
		const match = source.match(/export const revalidate = (\d+);/);

		expect(match).not.toBeNull();
		expect(Number(match![1])).toBe(DOWNLOADS_REVALIDATE);
	});
});
