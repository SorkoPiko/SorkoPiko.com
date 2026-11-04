// Palette (~/.config/theme/palette). app/globals.css mirrors these as CSS
// variables, and the background shader keeps its own GLSL copies.
export const theme = {
	backdrop: "#111111",
	base: "#161618",
	primary: "#2d2d3a",
	accent: "#ffe2f4",
	edge: "#000000",
	text: "#e8e6e1",
	muted: "#9a978f",
	faint: "#5f5d58",
	outline: "#ffffff0f",
} as const;
