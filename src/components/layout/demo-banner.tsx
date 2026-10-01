import { FlaskConicalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/** Always visible, 2rem tall (`h-8`): fixed headers and the sidebar sit below it at `top-8`. */
export function DemoBanner() {
    const t = useTranslations("layout");
    return (
        <div
            role="note"
            className="sticky top-0 z-60 flex h-8 items-center justify-center gap-2 bg-warning px-4 text-xs font-semibold text-black/85"
        >
            <FlaskConicalIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{t("demoBanner")}</span>
        </div>
    );
}
