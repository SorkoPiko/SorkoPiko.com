import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				backdrop: "var(--backdrop)",
				base: "var(--base)",
				primary: "var(--primary)",
				accent: "var(--accent)",
				text: "var(--text)",
				muted: "var(--muted)",
				faint: "var(--faint)",
				outline: "var(--outline)",
			},
		},
	},
	plugins: [],
};

export default config;
