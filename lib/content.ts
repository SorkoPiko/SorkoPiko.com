export type GameStatus = "coming-soon" | "released";

export interface Game {
	name: string;
	pitch: string;
	status: GameStatus;
	/** Set once the Steam store page exists; the card only links when this is present. */
	steamUrl?: string;
	image: { src: string; width: number; height: number; alt: string };
}

export interface Project {
	name: string;
	description: string;
	url: string;
	linkLabel: string;
}

export interface Link {
	label: string;
	href?: string;
	/** Text shown next to the label, e.g. a username. */
	handle?: string;
	/** When set, clicking copies this text instead of navigating. */
	copy?: string;
	icon: "discord" | "github" | "x" | "email";
}

export const site = {
	name: "SorkoPiko",
	tagline: "Game developer",
	description: "SorkoPiko, game developer. Making Beatline, plus SendDB and Geode mods for Geometry Dash.",
	url: "https://www.sorkopiko.com",
};

export const beatline: Game = {
	name: "Beatline",
	pitch: "RHYTHM // PARKOUR",
	status: "coming-soon",
	image: {
		src: "/beatline-banner.png",
		width: 1600,
		height: 800,
		alt: "The glowing cyan Beatline logo and \"Rhythm // Parkour\" above a wireframe globe ringed by a parkour track on a neon grid, between orange light pillars.",
	},
};

export const senddb: Project = {
	name: "SendDB",
	description: "Tracks Geometry Dash level sends. Available as a website, a Discord bot and a Geode mod.",
	url: "https://senddb.dev",
	linkLabel: "senddb.dev",
};

export const geodeMods: Project = {
	name: "Geode mods",
	description: "Geometry Dash mods, mostly quality-of-life and utility.",
	url: "https://geode-sdk.org/mods?developer=sorkopiko",
	linkLabel: "geode-sdk.org",
};

export const links: Link[] = [
	{ label: "Discord", handle: "sorkopiko", copy: "sorkopiko", icon: "discord" },
	{ label: "GitHub", href: "https://github.com/SorkoPiko", icon: "github" },
	{ label: "X", href: "https://x.com/SorkoPiko", icon: "x" },
	{ label: "Email", href: "mailto:me@sorko.dev", handle: "me@sorko.dev", icon: "email" },
];

export interface GameCta {
	badge: string;
	/** Only present once there's a store page to link to. */
	link?: { href: string; label: string };
}

/** Badge text and optional Steam link for a game card. */
export function gameCta(game: Pick<Game, "status" | "steamUrl">): GameCta {
	const released = game.status === "released";
	return {
		badge: released ? "Out now on Steam" : "Coming soon to Steam",
		...(game.steamUrl
			? { link: { href: game.steamUrl, label: released ? "Get it on Steam" : "Wishlist on Steam" } }
			: {}),
	};
}
