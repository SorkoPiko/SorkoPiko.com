import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Background } from "@/components/Background";
import { site } from "@/lib/content";
import { theme } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: site.name,
	description: site.description,
	openGraph: {
		type: "website",
		url: "/",
		siteName: site.name,
		title: site.name,
		description: site.description,
	},
	twitter: {
		card: "summary_large_image",
		site: "@SorkoPiko",
		creator: "@SorkoPiko",
		title: site.name,
		description: site.description,
	},
};

export const viewport: Viewport = {
	themeColor: theme.backdrop,
	colorScheme: "dark",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Background />
				{children}
				<Analytics />
			</body>
		</html>
	);
}
