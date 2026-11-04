"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, children }: { text: string; children: React.ReactNode }) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		setCopied(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button type="button" onClick={copy} className="link-row" title={`Copy ${text}`}>
			{children}
			<span className="link-handle" aria-live="polite">
				{copied ? "copied" : text}
			</span>
		</button>
	);
}
