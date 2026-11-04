import { describe, expect, it, vi } from "vitest";
import { copyStatusText, copyText } from "../lib/clipboard";

describe("copyText", () => {
	it("writes the text and reports success", async () => {
		const writeText = vi.fn(async () => {});

		await expect(copyText("sorkopiko", { writeText })).resolves.toBe("copied");
		expect(writeText).toHaveBeenCalledWith("sorkopiko");
	});

	it("reports failure when writing is rejected", async () => {
		const writeText = vi.fn(async () => {
			throw new DOMException("denied", "NotAllowedError");
		});

		await expect(copyText("sorkopiko", { writeText })).resolves.toBe("failed");
	});

	it("reports failure when there's no clipboard API", async () => {
		await expect(copyText("sorkopiko", undefined)).resolves.toBe("failed");
	});
});

describe("copyStatusText", () => {
	it("shows the handle until something happens", () => {
		expect(copyStatusText("sorkopiko", null)).toBe("sorkopiko");
	});

	it("confirms a copy", () => {
		expect(copyStatusText("sorkopiko", "copied")).toBe("copied");
	});

	it("keeps the handle visible when copying fails", () => {
		expect(copyStatusText("sorkopiko", "failed")).toContain("copy failed");
		expect(copyStatusText("sorkopiko", "failed")).toContain("sorkopiko");
	});
});
