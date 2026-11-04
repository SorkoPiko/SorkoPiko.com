"use client";

import { useEffect, useRef, useState } from "react";
import { copyStatusText, copyText, type CopyResult } from "@/lib/clipboard";

const RESET_MS = { copied: 1500, failed: 4000 } as const;

export function CopyButton({ text, label, children }: { text: string; label: string; children: React.ReactNode }) {
	const [result, setResult] = useState<CopyResult | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = async () => {
		const next = await copyText(text);
		setResult(next);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setResult(null), RESET_MS[next]);
	};

	return (
		<span className="copy-row">
			<button type="button" onClick={copy} className="link-row" aria-label={`Copy ${label} handle ${text}`}>
				{children}
			</button>
			{/* Outside the button so it isn't part of the button's name, and so the handle can be selected by hand */}
			<span className="link-handle" role="status" aria-live="polite">
				{copyStatusText(text, result)}
			</span>
		</span>
	);
}
