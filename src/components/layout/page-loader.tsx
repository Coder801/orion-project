import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/** In-page loading state (route transitions, guards). The first-paint splash is `site/page-loader`. */
export function PageLoader({ fullscreen = false }: { fullscreen?: boolean }) {
    const t = useTranslations("common");

    return (
        <div
            className={cn(
                "grid place-items-center py-24",
                fullscreen && "min-h-[calc(100dvh-2rem)]",
            )}
        >
            <Spinner className="size-6" label={t("loading")} />
        </div>
    );
}
