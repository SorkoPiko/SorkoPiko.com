export type CopyResult = "copied" | "failed";

/** Copy text, reporting failure (no clipboard API, insecure context, permission denied) instead of throwing. */
export async function copyText(
	text: string,
	clipboard: Pick<Clipboard, "writeText"> | undefined = globalThis.navigator?.clipboard,
): Promise<CopyResult> {
	try {
		if (!clipboard) return "failed";
		await clipboard.writeText(text);
		return "copied";
	} catch {
		return "failed";
	}
}

/** What the status next to the copy button shows. */
export function copyStatusText(text: string, result: CopyResult | null): string {
	if (result === "copied") return "copied";
	if (result === "failed") return `copy failed, it's ${text}`;
	return text;
}
