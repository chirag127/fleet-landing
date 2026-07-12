// @ts-check

import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://fleet-landing.oriz.in",
	output: "static",
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		AstroPWA({
			registerType: "autoUpdate",
			injectRegister: false,
			includeAssets: ["favicon.svg", "favicon.ico"],
			manifest: {
				id: "/",
				name: "oriz API fleet",
				short_name: "API fleet",
				description:
					"Free static JSON APIs for reference data. No auth. No rate limits. No cost.",
				start_url: "/",
				scope: "/",
				display: "standalone",
				theme_color: "#0f172a",
				background_color: "#0f172a",
				icons: [
					{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
					{ src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
					{
						src: "/pwa-maskable-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{html,css,js,svg,ico,png,woff2}"],
				// Never serve stale live-data / API / auth responses — always hit the network.
				navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
				runtimeCaching: [
					{
						urlPattern: ({ url }) =>
							url.pathname.startsWith("/api") ||
							url.pathname.startsWith("/auth") ||
							url.origin !== self.location.origin,
						handler: "NetworkOnly",
					},
				],
			},
		}),
	],
});
