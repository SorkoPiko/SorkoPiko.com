/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
		qualities: [75, 90],
	},
	async redirects() {
		return ["/about", "/projects", "/contact"].map((source) => ({
			source,
			destination: "/",
			permanent: true,
		}));
	},
};

export default nextConfig;
