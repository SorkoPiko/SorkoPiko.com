import { describe, expect, it } from "vitest";
import { beatline, gameCta } from "../lib/content";

describe("gameCta", () => {
	it("shows a coming-soon badge and no link before a store page exists", () => {
		expect(gameCta({ status: "coming-soon" })).toEqual({ badge: "Coming soon to Steam" });
	});

	it("offers a wishlist link once a store page exists before release", () => {
		expect(gameCta({ status: "coming-soon", steamUrl: "https://store.steampowered.com/app/1" })).toEqual({
			badge: "Coming soon to Steam",
			link: { href: "https://store.steampowered.com/app/1", label: "Wishlist on Steam" },
		});
	});

	it("switches to an out-now badge and store link on release", () => {
		expect(gameCta({ status: "released", steamUrl: "https://store.steampowered.com/app/1" })).toEqual({
			badge: "Out now on Steam",
			link: { href: "https://store.steampowered.com/app/1", label: "Get it on Steam" },
		});
	});

	it("never renders a link without a steamUrl, even when released", () => {
		expect(gameCta({ status: "released" }).link).toBeUndefined();
		expect(gameCta({ status: "released", steamUrl: "" }).link).toBeUndefined();
	});
});

describe("beatline content", () => {
	it("is coming soon with no Steam link yet", () => {
		expect(beatline.status).toBe("coming-soon");
		expect(beatline.steamUrl).toBeUndefined();
		expect(gameCta(beatline)).toEqual({ badge: "Coming soon to Steam" });
	});

	it("has an image with alt text", () => {
		expect(beatline.image.src).toMatch(/^\//);
		expect(beatline.image.alt.length).toBeGreaterThan(0);
	});
});
