import { siteConfig } from "@/config/site";
import { LogoMarkArt } from "@/components/LogoArt";

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
                    <LogoMarkArt
                        orbit="currentColor"
                        className="absolute inset-0 size-full text-muted-foreground/20"
                    />
                    <div className="absolute inset-0 animate-loader-fill">
                        <LogoMarkArt className="size-full" />
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
