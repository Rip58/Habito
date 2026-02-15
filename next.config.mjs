/** @type {import('next').NextConfig} */
const nextConfig = {
    // We intentionally disable ignoreBuildErrors to find the root cause
    // typescript: { ignoreBuildErrors: true }, 
    output: "standalone",
};

export default nextConfig;
