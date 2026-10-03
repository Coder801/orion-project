import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { API_PREFIX, apiOrigin } from "./src/data/api/origin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    // Tree-shake heavy barrel packages so only used exports ship (lowers TBT).
    // recharts + framer-motion are the big ones; lucide-react is on by default.
    experimental: {
        optimizePackageImports: ["recharts", "framer-motion"],
    },
    // The browser talks to the API on its own origin, so the httpOnly session
    // cookie and the API's Origin check work without CORS.
    async rewrites() {
        return [
            {
                source: `${API_PREFIX}/:path*`,
                destination: `${apiOrigin()}${API_PREFIX}/:path*`,
            },
        ];
    },
};

export default withNextIntl(nextConfig);
