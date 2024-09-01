import type { Metadata } from "next";
import "@/styles/globals.css";

import { siteConfig } from "@/constant/config";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.title,
		template: `%s | ${siteConfig.title}`,
	},
	description: siteConfig.description,
	robots: { index: true, follow: true },
	icons: {
		icon: "/favicon/favicon.ico",
		shortcut: "/favicon/favicon-16x16.png",
		apple: "/favicon/apple-touch-icon.png",
	},
	manifest: "/favicon/site.webmanifest",
	openGraph: {
		url: siteConfig.url,
		title: siteConfig.title,
		description: siteConfig.description,
		siteName: siteConfig.title,
		images: [`${siteConfig.url}/images/og.jpg`],
		type: "website",
		locale: "de_DE",
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.title,
		description: siteConfig.description,
		images: [`${siteConfig.url}/images/og.jpg`],
		// creator: '@th_clarence',
	},
	// authors: [
	//   {
	//     name: 'Tim Krämer',
	//     url: 'https://tim-kraemer.de',
	//   },
	// ],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="de">
			<body>{children}</body>
		</html>
	);
}
