/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return ["/about", "/projects", "/contact"].map((source) => ({
			source,
			destination: "/",
			permanent: true,
		}));
	},
};

export default nextConfig;
