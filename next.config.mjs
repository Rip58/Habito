/** @type {import('next').NextConfig} */
const nextConfig = {
    // We intentionally disable ignoreBuildErrors to find the root cause
    // typescript: { ignoreBuildErrors: true }, 
    // output: "standalone", // Reverted to default for Vercel
};

export default nextConfig;
