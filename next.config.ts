import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    // Tree-shake heavy barrel packages so only used exports ship (lowers TBT).
    // recharts + framer-motion are the big ones; lucide-react is on by default.
    experimental: {
        optimizePackageImports: ["recharts", "framer-motion"],
    },
};

export default withNextIntl(nextConfig);
