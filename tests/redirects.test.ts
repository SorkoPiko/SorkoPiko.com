import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

describe("redirects", () => {
	it("permanently redirects the old pages to /", async () => {
		const redirects = await nextConfig.redirects?.();

		expect(redirects).toEqual([
			{ source: "/about", destination: "/", permanent: true },
			{ source: "/projects", destination: "/", permanent: true },
			{ source: "/contact", destination: "/", permanent: true },
		]);
	});
});
