import { siteConfig } from "@/config/site";
import { brandHex } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

// Same geometry as `LogoMark` (components/logo.tsx). Redrawn here because that
// one is a client component (useId), while the splash must stay server-rendered.
function LoaderMark({
    outline = false,
    className,
}: {
    outline?: boolean;
    className?: string;
}) {
    const fill = outline ? "currentColor" : "url(#loader-fill-gradient)";
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className={cn("size-full", className)}
        >
            {!outline && (
                <defs>
                    <linearGradient
                        id="loader-fill-gradient"
                        x1="0"
                        y1="0"
                        x2="32"
                        y2="32"
                    >
                        <stop offset="0%" stopColor={brandHex.primary} />
                        <stop offset="55%" stopColor={brandHex.secondary} />
                        <stop offset="100%" stopColor={brandHex.accent} />
                    </linearGradient>
                </defs>
            )}
            <rect
                x="1.5"
                y="1.5"
                width="29"
                height="29"
                rx="9"
                stroke={fill}
                strokeWidth="2"
            />
            <circle cx="10" cy="20.5" r="2.4" fill={fill} />
            <circle cx="16" cy="16" r="2.4" fill={fill} />
            <circle
                cx="22"
                cy="11.5"
                r="2.4"
                fill={outline ? "currentColor" : brandHex.accent}
            />
        </svg>
    );
}

// Pure-CSS first-paint splash (keyframes in globals.css) so it's server-rendered
// with no hydration flash; only plays on full load, not client-side navigations.
export function PageLoader() {
    return (
        <div
            aria-hidden
            className="fixed inset-0 z-100 grid animate-loader-dismiss place-items-center bg-background/70 backdrop-blur-2xl"
        >
            <div className="flex animate-loader-logo-out flex-col items-center gap-5">
                <div className="relative size-20 sm:size-24">
                    <LoaderMark
                        outline
                        className="absolute inset-0 text-muted-foreground/20"
                    />
                    <div className="absolute inset-0 animate-loader-fill">
                        <LoaderMark />
                    </div>
                </div>
                <p className="animate-loader-name-in font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                    {siteConfig.name}
                    <span className="text-gradient"> Bank</span>
                </p>
            </div>
        </div>
    );
}
